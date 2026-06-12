const AuditLog = require('../models/AuditLog');

const logAction = async ({ action, actor, targetType, targetId, details }) => {
  try {
    if (!actor || !actor._id) {
      console.warn('⚠️ Missing actor object for audit logging');
      return;
    }
    await AuditLog.create({
      action,
      actor: actor._id,
      actorName: actor.fullName || 'Unknown',
      actorRole: actor.role || 'buyer',
      targetType: targetType || 'System',
      targetId: targetId || null,
      details: details || ''
    });
  } catch (err) {
    console.error('❌ Failed to save AuditLog entry:', err.message);
  }
};

module.exports = { logAction };
