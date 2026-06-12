const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { verifyIdToken } = require('../utils/firebaseAdmin');
const { logAction } = require('../utils/auditLogger');
const { uploadToCloudinary } = require('../middleware/upload');

// @desc  Register user
// @route POST /api/auth/signup
// @access Public
const signup = async (req, res) => {
  try {
    const { fullName, mobile, email, password } = req.body;

    // Check existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    const user = await User.create({ fullName, mobile, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or mobile already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();

    // Audit log
    await logAction({
      action: 'LOGIN',
      actor: user,
      targetType: 'User',
      targetId: user._id,
      details: 'User logged in via Password'
    });

    res.json({ success: true, message: 'Login successful', token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, mobile } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (mobile) updates.mobile = mobile;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// In-memory OTP cache: mobile -> { otp, expires }
const otpCache = new Map();

// Helper to send actual SMS using Fast2SMS gateway
const sendActualSMS = async (mobile, code) => {
  if (!process.env.FAST2SMS_API_KEY) {
    console.log(`⚠️ FAST2SMS_API_KEY not configured. SMS not sent to ${mobile}.`);
    return false;
  }
  try {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${code}&numbers=${mobile}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.return === true) {
      console.log(`✅ SMS sent successfully to ${mobile} via Fast2SMS`);
      return true;
    } else {
      console.log(`❌ Fast2SMS failed to send: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    console.error('❌ Error sending SMS via Fast2SMS:', err.message);
    return false;
  }
};

// @desc  Send OTP to mobile
// @route POST /api/auth/otp/send
// @access Public
const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number' });
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache the OTP with 5 minute expiry
    otpCache.set(mobile, {
      otp: code,
      expires: Date.now() + 5 * 60 * 1000
    });

    console.log(`[OTP] Welcome to RV Pets Zone! Use OTP: ${code} to login.`);

    // Send actual SMS if Fast2SMS API key is set
    await sendActualSMS(mobile, code);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify OTP
// @route POST /api/auth/otp/verify
// @access Public
const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const cached = otpCache.get(mobile);
    if (!cached) {
      return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
    }

    if (cached.expires < Date.now()) {
      otpCache.delete(mobile);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (cached.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is verified. Remove from cache
    otpCache.delete(mobile);

    // Check if user exists
    const user = await User.findOne({ mobile });
    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
      }
      const token = generateToken(user._id);

      // Audit log
      await logAction({
        action: 'LOGIN',
        actor: user,
        targetType: 'User',
        targetId: user._id,
        details: 'User logged in via OTP'
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user,
        isNewUser: false
      });
    }

    // Return status for new user registration card
    res.json({
      success: true,
      message: 'OTP verified. Profile registration details required.',
      isNewUser: true
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Complete registration with OTP
// @route POST /api/auth/otp/complete
// @access Public
const completeOTPRegistration = async (req, res) => {
  try {
    const { mobile, fullName, email } = req.body;
    if (!mobile || !fullName || !email) {
      return res.status(400).json({ success: false, message: 'Mobile, Full Name, and Email are required' });
    }

    // Check unique constraints
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    // Generate a secure random password for model constraint
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

    const user = await User.create({
      fullName,
      mobile,
      email,
      password: randomPassword
    });

    const token = generateToken(user._id);

    // Audit log
    await logAction({
      action: 'LOGIN',
      actor: user,
      targetType: 'User',
      targetId: user._id,
      details: 'User registered and logged in via OTP'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify Firebase ID token and login/register
// @route POST /api/auth/firebase-login
// @access Public
const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required' });
    }

    // Verify token
    const decoded = await verifyIdToken(idToken);
    if (!decoded || !decoded.phone_number) {
      return res.status(400).json({ success: false, message: 'Invalid token or phone number not verified' });
    }

    // Extract 10-digit mobile number
    const mobile = decoded.phone_number.slice(-10);

    // Find user by mobile
    const user = await User.findOne({ mobile });
    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
      }
      const token = generateToken(user._id);

      // Audit log
      await logAction({
        action: 'LOGIN',
        actor: user,
        targetType: 'User',
        targetId: user._id,
        details: 'User logged in via Firebase Phone Auth'
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user,
        isNewUser: false
      });
    }

    // If user does not exist, return new user status
    res.json({
      success: true,
      message: 'Firebase verification successful. Profile registration required.',
      isNewUser: true,
      mobile,
      firebaseUid: decoded.uid
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Complete registration via Firebase Auth
// @route POST /api/auth/firebase-complete
// @access Public
const completeFirebaseRegistration = async (req, res) => {
  try {
    const { mobile, fullName, email, firebaseUid } = req.body;
    if (!mobile || !fullName || !email) {
      return res.status(400).json({ success: false, message: 'Mobile, Full Name, and Email are required' });
    }

    // Check unique constraints
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered' });
    }

    // Generate a secure random password for model constraint
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

    const user = await User.create({
      fullName,
      mobile,
      email,
      password: randomPassword
    });

    const token = generateToken(user._id);

    // Audit log
    await logAction({
      action: 'LOGIN',
      actor: user,
      targetType: 'User',
      targetId: user._id,
      details: 'User registered and logged in via Firebase Phone Auth'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Upload Aadhaar for seller verification
// @route POST /api/auth/upload-aadhaar
// @access Private
const uploadAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Aadhaar image file' });
    }

    // Upload buffer to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'rv-pets-zone/aadhaar');

    // Update user record
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        aadhaarUrl: uploadResult.secure_url,
        aadhaarStatus: 'pending'
      },
      { new: true }
    );

    // Audit log
    await logAction({
      action: 'USER_UPDATED',
      actor: user,
      targetType: 'User',
      targetId: user._id,
      details: 'User uploaded Aadhaar for verification'
    });

    res.json({
      success: true,
      message: 'Aadhaar uploaded successfully. Verification is pending.',
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  sendOTP,
  verifyOTP,
  completeOTPRegistration,
  firebaseLogin,
  completeFirebaseRegistration,
  uploadAadhaar
};
