const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:userId', getMessages);

module.exports = router;
