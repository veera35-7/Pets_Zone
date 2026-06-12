const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc  Get message history between logged-in user and target user
// @route GET /api/chat/:userId
// @access Private
const getMessages = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Get messages where current user is sender and target is receiver OR vice versa
    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read where current user is receiver
    await Chat.updateMany(
      { sender: targetUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get list of all conversation partners for logged-in user
// @route GET /api/chat/conversations
// @access Private
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all unique senders and receivers for current user
    const users = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }
      },
      {
        $project: {
          partner: {
            $cond: {
              if: { $eq: ['$sender', currentUserId] },
              then: '$receiver',
              else: '$sender'
            }
          }
        }
      },
      {
        $group: {
          _id: '$partner'
        }
      }
    ]);

    const partnerIds = users.map((u) => u._id);
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('fullName email mobile role avatar lastActive')
      .lean();

    // Attach unread counts and last messages
    const conversations = await Promise.all(
      partners.map(async (partner) => {
        const lastMessage = await Chat.findOne({
          $or: [
            { sender: currentUserId, receiver: partner._id },
            { sender: partner._id, receiver: currentUserId }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Chat.countDocuments({
          sender: partner._id,
          receiver: currentUserId,
          isRead: false
        });

        return {
          partner,
          lastMessage: lastMessage ? lastMessage.message : '',
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          unreadCount
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMessages,
  getConversations
};
