const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const { initializeWeb3 } = require('../utils/web3');

class MarketplaceService {
  constructor() {
    const { carbonCreditContract, carbonMarketContract } = initializeWeb3();
    this.carbonCreditContract = carbonCreditContract;
    this.carbonMarketContract = carbonMarketContract;
  }

  // List a carbon credit for sale
  async listCredit(tokenId, priceInEther, walletAddress) {
    try {
      // Verify ownership through the contract (this is actually done on-chain)
      const owner = await this.carbonCreditContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Not the token owner');
      }
      
      // Get project associated with tokenId
      const project = await Project.findOne({ tokenId });
      
      // Record the listing in the database (off-chain data)
      const transaction = new Transaction({
        tokenId,
        type: 'Listing',
        from: walletAddress,
        amount: 1, // Assuming 1 token is listed
        price: parseFloat(priceInEther),
        transactionHash: 'pending', // Will be updated later
        blockNumber: 0, // Will be updated later
        projectId: project ? project._id : null
      });
      
      await transaction.save();
      
      return {
        listingId: transaction._id,
        tokenId,
        price: priceInEther,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Buy a carbon credit
  async buyCredit(tokenId, priceInEther, buyerWalletAddress) {
    try {
      // Find the listing
      const listing = await Transaction.findOne({ 
        tokenId, 
        type: 'Listing',
        transactionHash: { $ne: 'cancelled' } // Not cancelled
      }).sort({ createdAt: -1 }); // Get the most recent listing
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Get project associated with tokenId
      const project = await Project.findOne({ tokenId });
      
      // Record the purchase in the database (off-chain data)
      const transaction = new Transaction({
        tokenId,
        type: 'Purchase',
        from: listing.from,
        to: buyerWalletAddress,
        amount: listing.amount,
        price: parseFloat(priceInEther),
        transactionHash: 'pending', // Will be updated later
        blockNumber: 0, // Will be updated later
        projectId: project ? project._id : null
      });
      
      await transaction.save();
      
      return {
        purchaseId: transaction._id,
        tokenId,
        price: priceInEther,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel a listing
  async cancelListing(tokenId, walletAddress) {
    try {
      // Find the listing
      const listing = await Transaction.findOne({ 
        tokenId, 
        type: 'Listing',
        from: walletAddress,
        transactionHash: { $ne: 'cancelled' } // Not already cancelled
      }).sort({ createdAt: -1 }); // Get the most recent listing
      
      if (!listing) {
        throw new Error('Listing not found or not authorized');
      }
      
      // Update the listing to cancelled
      listing.transactionHash = 'cancelled';
      await listing.save();
      
      // Create a cancellation record
      const transaction = new Transaction({
        tokenId,
        type: 'Cancellation',
        from: walletAddress,
        amount: listing.amount,
        transactionHash: 'pending', // Will be updated later
        blockNumber: 0, // Will be updated later
        projectId: listing.projectId
      });
      
      await transaction.save();
      
      return {
        cancellationId: transaction._id,
        tokenId,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Retire a carbon credit
  async retireCredit(tokenId, walletAddress) {
    try {
      // Verify ownership through the contract (this is actually done on-chain)
      const owner = await this.carbonCreditContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Not the token owner');
      }
      
      // Get project associated with tokenId
      const project = await Project.findOne({ tokenId });
      
      // Record the retirement in the database (off-chain data)
      const transaction = new Transaction({
        tokenId,
        type: 'Retirement',
        from: walletAddress,
        amount: 1, // Assuming 1 token is retired
        transactionHash: 'pending', // Will be updated later
        blockNumber: 0, // Will be updated later
        projectId: project ? project._id : null
      });
      
      await transaction.save();
      
      return {
        retirementId: transaction._id,
        tokenId,
        status: 'pending'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get all listings
  async getListings(filters = {}) {
    try {
      // Find all active listings
      const query = { 
        type: 'Listing',
        transactionHash: { $ne: 'cancelled' } // Not cancelled
      };
      
      // Add filters if provided
      if (filters.tokenId) query.tokenId = filters.tokenId;
      if (filters.seller) query.from = filters.seller;
      
      const listings = await Transaction.find(query)
        .populate('projectId')
        .sort({ createdAt: -1 });
      
      return listings;
    } catch (error) {
      throw error;
    }
  }
  
  // Get user transactions
  async getUserTransactions(walletAddress) {
    try {
      const transactions = await Transaction.find({
        $or: [
          { from: walletAddress },
          { to: walletAddress }
        ]
      })
        .populate('projectId')
        .sort({ createdAt: -1 });
      
      return transactions;
    } catch (error) {
      throw error;
    }
  }
  
  // Update transaction with blockchain confirmation
  async updateTransactionConfirmation(transactionId, txHash, blockNumber) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          transactionHash: txHash,
          blockNumber: blockNumber
        },
        { new: true }
      );
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MarketplaceService();