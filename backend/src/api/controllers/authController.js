const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');
const logger = require('../../utils/logger');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      walletAddress: user.walletAddress 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
};

// Register with email and password
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Login with email and password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Validate password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Generate nonce for wallet authentication
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }
    
    // Find or create user
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      // Create new user with wallet address
      user = await User.create({
        walletAddress,
        name: `User ${walletAddress.substring(0, 6)}`,
        role: 'user'
      });
    }
    
    // Generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Sign this message to verify you own this wallet: ${nonce}`;
    
    // Store nonce with user (in a real app, you'd persist this)
    // For simplicity, we'll return it directly
    
    res.status(200).json({
      success: true,
      message,
      nonce
    });
  } catch (error) {
    logger.error('Nonce generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error generating nonce',
      error: error.message 
    });
  }
};

// Verify wallet signature
exports.verifyWallet = async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;
    
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address'
      });
    }
    
    // Recreate the message that was signed
    const message = `Sign this message to verify you own this wallet: ${nonce}`;
    
    // Verify the signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature format'
      });
    }
    
    // Find user by wallet address
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        walletAddress: user.walletAddress,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Wallet verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during wallet verification',
      error: error.message 
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified,
        bio: user.bio,
        organization: user.organization,
        profileImage: user.profileImage,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching profile',
      error: error.message 
    });
  }
};