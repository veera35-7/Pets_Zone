const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markSingleRead,
  deleteNotification,
  clearAll
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes are protected
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markSingleRead);
router.delete('/clear-all', clearAll);
router.delete('/:id', deleteNotification);

module.exports = router;
