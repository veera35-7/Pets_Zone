const rolesHierarchy = {
  buyer: 1,
  seller: 2,
  moderator: 3,
  admin: 4,
  superadmin: 5
};

const restrictTo = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRoleValue = rolesHierarchy[req.user.role] || 0;
    const minRoleValue = rolesHierarchy[minRole] || 99;

    if (userRoleValue >= minRoleValue) {
      return next();
    }

    res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
  };
};

module.exports = { restrictTo, rolesHierarchy };
