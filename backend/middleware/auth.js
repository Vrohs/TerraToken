const jwt = require('jsonwebtoken');
const { config } = require('../config');
const User = require('../models/User');
const { verifyClerkJwt } = require('../services/clerkService');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Try to verify as a Clerk token first
    try {
      const clerkData = await verifyClerkJwt(token);
      // If it's a valid Clerk token, find the user by Clerk ID
      if (clerkData && clerkData.sub) {
        req.user = await User.findOne({ clerkId: clerkData.sub });
        
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'User not found in our system. Please complete registration.'
          });
        }
        
        next();
        return;
      }
    } catch (clerkErr) {
      // If Clerk verification fails, try our own JWT
      console.log('Not a Clerk token, trying regular JWT...');
    }

    // Fallback to our own JWT verification
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};