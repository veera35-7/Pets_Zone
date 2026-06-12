const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add index for fast retrieval of message history between two users
chatSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

module.exports = mongoose.model('Chat', chatSchema);
