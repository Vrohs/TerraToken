const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { config } = require('../config');
const User = require('../models/User');

// Verify a Clerk JWT token
exports.verifyClerkJwt = async (token) => {
  try {
    // For demo purposes, decode the token without verification
    // In production, you should use proper verification with Clerk's JWKS
    // Example production code:
    // const jwks = jose.createRemoteJWKSet(
    //   new URL(`https://${process.env.CLERK_HOSTNAME}/.well-known/jwks.json`)
    // );
    // const result = await jose.jwtVerify(token, jwks, {
    //   issuer: process.env.CLERK_ISSUER,
    //   audience: process.env.CLERK_AUDIENCE,
    // });
    // return result.payload;
    
    const decoded = jwt.decode(token);
    if (!decoded) throw new Error('Invalid token');
    
    // In demo, validate the structure at least
    if (!decoded.sub || !decoded.exp) {
      throw new Error('Invalid token structure');
    }
    
    // Check token expiration
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decoded;
  } catch (error) {
    console.error('Error verifying Clerk JWT:', error);
    throw new Error('Invalid Clerk token');
  }
};

// Handler for syncing Clerk users with our database
exports.syncClerkUser = async (req, res) => {
  try {
    const { clerkId, email, name, imageUrl } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        error: 'ClerkId and email are required'
      });
    }
    
    // Find if user exists by clerk ID
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Find by email as fallback
      user = await User.findOne({ email });
    }
    
    if (user) {
      // Update existing user with Clerk info
      user.clerkId = clerkId;
      user.name = name || user.name;
      user.profileImage = imageUrl || user.profileImage;
      // Don't change the wallet address if it exists
      await user.save();
    } else {
      // Create new user with minimal info
      // Set a random wallet address for now (user will need to connect their wallet)
      const randomWalletAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
      
      user = await User.create({
        name,
        email,
        clerkId,
        profileImage: imageUrl,
        walletAddress: randomWalletAddress, // Placeholder - user will update later
        password: hashedPassword // Random password since auth is via Clerk
      });
    }
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        profileImage: user.profileImage,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error in syncClerkUser:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
