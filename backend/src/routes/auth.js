const express = require('express');
const router = express.Router();
const {
  signup, login, getMe, updateProfile, changePassword,
  sendOTP, verifyOTP, completeOTPRegistration,
  firebaseLogin, completeFirebaseRegistration,
  uploadAadhaar
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// OTP Auth Routes (Legacy/Direct)
router.post('/otp/send', authLimiter, sendOTP);
router.post('/otp/verify', authLimiter, verifyOTP);
router.post('/otp/complete', authLimiter, completeOTPRegistration);

// Firebase Phone Auth Routes
router.post('/firebase-login', authLimiter, firebaseLogin);
router.post('/firebase-complete', authLimiter, completeFirebaseRegistration);

// Aadhaar Upload Route
router.post('/upload-aadhaar', protect, upload.single('aadhaar'), uploadAadhaar);

module.exports = router;
