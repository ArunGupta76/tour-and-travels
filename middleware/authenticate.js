const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_wanderlust_jwt_key_2026_secure');

    // Check if token belongs to Admin or User
    if (decoded.role === 'admin' || decoded.role === 'superadmin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin || admin.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or deactivated.',
        });
      }
      req.user = admin;
      req.isAdmin = true;
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'User account not found or deactivated.',
        });
      }
      req.user = user;
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = authenticate;
