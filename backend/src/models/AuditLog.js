const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'LISTING_APPROVED', 'LISTING_REJECTED', 'USER_BAN', 'USER_UNBAN', 'USER_UPDATED', 'ROLE_UPDATED', 'SELLER_VERIFICATION_APPROVED', 'SELLER_VERIFICATION_REJECTED']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorName: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['User', 'Pet', 'System'],
    default: 'System'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('AuditLog', auditLogSchema);
