const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.isAdmin || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }
  next();
};

module.exports = authorizeAdmin;
