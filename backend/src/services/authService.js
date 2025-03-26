const jwt = require('jsonwebtoken');
const ethers = require('ethers');
const User = require('../models/User');

class AuthService {
  // Generate JWT token
  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Register with email and password
  async registerWithEmail(userData) {
    try {
      const { email, password, name } = userData;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }
      
      // Create new user
      const user = new User({
        name,
        email,
        password
      });
      
      await user.save();
      
      // Generate token
      const token = this.generateToken(user._id, user.role);
      
      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Login with email and password
  async loginWithEmail(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Generate token
      const token = this.generateToken(user._id, user.role);
      
      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Generate nonce for wallet authentication
  async generateAuthNonce(walletAddress) {
    try {
      // Check if user exists with this wallet address
      let user = await User.findOne({ walletAddress });
      
      // If user doesn't exist, create a new one
      if (!user) {
        user = new User({
          name: `User_${walletAddress.substring(0, 6)}`,
          walletAddress
        });
        await user.save();
      }
      
      // Generate unique nonce for this user
      const nonce = `TerraToken authentication for ${walletAddress}: ${Date.now()}`;
      
      user.nonce = nonce;
      await user.save();
      
      return { nonce };
    } catch (error) {
      throw error;
    }
  }
  
  // Verify wallet signature
  async verifyWalletSignature(walletAddress, signature) {
    try {
      // Find user by wallet address
      const user = await User.findOne({ walletAddress });
      if (!user || !user.nonce) {
        throw new Error('Authentication failed. Please request a new nonce.');
      }
      
      // Verify signature
      const recoveredAddress = ethers.utils.verifyMessage(user.nonce, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Invalid signature');
      }
      
      // Clear nonce to prevent replay attacks
      user.nonce = null;
      await user.save();
      
      // Generate token
      const token = this.generateToken(user._id, user.role);
      
      return {
        token,
        user: {
          id: user._id,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
          email: user.email
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Link wallet to existing account
  async linkWalletToAccount(userId, walletAddress) {
    try {
      // Check if wallet is already linked to another account
      const existingWallet = await User.findOne({ walletAddress });
      if (existingWallet) {
        throw new Error('This wallet is already linked to another account');
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        { walletAddress },
        { new: true }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();