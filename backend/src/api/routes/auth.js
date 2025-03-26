const express = require('express');
const authService = require('../../services/authService');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Register with email
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Please provide name, email, and password'
      });
    }
    
    const result = await authService.registerWithEmail({ name, email, password });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Login with email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Please provide email and password'
      });
    }
    
    const result = await authService.loginWithEmail(email, password);
    
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: true,
      message: error.message
    });
  }
});

// Generate nonce for wallet authentication
router.post('/wallet/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        error: true,
        message: 'Please provide wallet address'
      });
    }
    
    const result = await authService.generateAuthNonce(walletAddress);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Verify wallet signature
router.post('/wallet/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    if (!walletAddress || !signature) {
      return res.status(400).json({
        error: true,
        message: 'Please provide wallet address and signature'
      });
    }
    
    const result = await authService.verifyWalletSignature(walletAddress, signature);
    
    res.json(result);
  } catch (error) {
    res.status(401).json({
      error: true,
      message: error.message
    });
  }
});

// Link wallet to account
router.post('/link-wallet', authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        error: true,
        message: 'Please provide wallet address'
      });
    }
    
    const result = await authService.linkWalletToAccount(req.user.userId, walletAddress);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;