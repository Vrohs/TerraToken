const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Authentication token required'
      });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: true,
          message: 'Invalid or expired token'
        });
      }
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(403).json({
          error: true,
          message: 'User not found'
        });
      }
      
      // Add user data to request
      req.user = {
        userId: user._id,
        role: user.role,
        walletAddress: user.walletAddress,
        email: user.email
      };
      
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Authentication error'
    });
  }
};

// Authorize by roles
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'Unauthorized access'
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};