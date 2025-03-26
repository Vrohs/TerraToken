const express = require('express');
const marketplaceService = require('../../services/marketplaceService');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// List a carbon credit for sale
router.post('/list', authenticateToken, async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    
    if (!tokenId || !price) {
      return res.status(400).json({
        error: true,
        message: 'Please provide tokenId and price'
      });
    }
    
    const result = await marketplaceService.listCredit(
      tokenId,
      price,
      req.user.walletAddress
    );
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Buy a carbon credit
router.post('/buy', authenticateToken, async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    
    if (!tokenId || !price) {
      return res.status(400).json({
        error: true,
        message: 'Please provide tokenId and price'
      });
    }
    
    const result = await marketplaceService.buyCredit(
      tokenId,
      price,
      req.user.walletAddress
    );
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Cancel a listing
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({
        error: true,
        message: 'Please provide tokenId'
      });
    }
    
    const result = await marketplaceService.cancelListing(
      tokenId,
      req.user.walletAddress
    );
    
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Retire a carbon credit
router.post('/retire', authenticateToken, async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({
        error: true,
        message: 'Please provide tokenId'
      });
    }
    
    const result = await marketplaceService.retireCredit(
      tokenId,
      req.user.walletAddress
    );
    
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters if provided
    if (req.query.tokenId) filters.tokenId = parseInt(req.query.tokenId);
    if (req.query.seller) filters.seller = req.query.seller;
    
    const listings = await marketplaceService.getListings(filters);
    
    res.json(listings);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Get user transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await marketplaceService.getUserTransactions(
      req.user.walletAddress
    );
    
    res.json(transactions);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Update transaction with blockchain confirmation
router.post('/confirm-transaction', async (req, res) => {
  try {
    const { transactionId, txHash, blockNumber } = req.body;
    
    if (!transactionId || !txHash || !blockNumber) {
      return res.status(400).json({
        error: true,
        message: 'Please provide transactionId, txHash, and blockNumber'
      });
    }
    
    const transaction = await marketplaceService.updateTransactionConfirmation(
      transactionId,
      txHash,
      blockNumber
    );
    
    res.json(transaction);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;