const express = require('express');
const router = express.Router();
const {
  signup, login, getMe, updateProfile, changePassword,
  sendOTP, verifyOTP, completeOTPRegistration
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// OTP Auth Routes
router.post('/otp/send', authLimiter, sendOTP);
router.post('/otp/verify', authLimiter, verifyOTP);
router.post('/otp/complete', authLimiter, completeOTPRegistration);

module.exports = router;
