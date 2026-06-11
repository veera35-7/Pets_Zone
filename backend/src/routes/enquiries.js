const express = require('express');
const router = express.Router();
const { createEnquiry, getMyEnquiries, getNotifications, markNotificationsRead } = require('../controllers/enquiryController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createEnquiry);
router.get('/my', protect, getMyEnquiries);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
