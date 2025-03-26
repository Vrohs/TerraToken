const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const { 
  carbonCreditContract, 
  carbonMarketContract,
  provider
} = require('../utils/web3').initializeWeb3();

class EventListenerService {
  constructor() {
    this.isRunning = false;
    this.carbonCreditContract = carbonCreditContract;
    this.carbonMarketContract = carbonMarketContract;
    this.provider = provider;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('Starting blockchain event listeners...');
    
    // Setup event listeners
    this.setupCreditMintedListener();
    this.setupCreditTransferredListener();
    this.setupCreditListedListener();
    this.setupCreditSoldListener();
    this.setupCreditRetiredListener();
    
    console.log('Blockchain event listeners started successfully');
  }
  
  setupCreditMintedListener() {
    this.carbonCreditContract.on('CreditMinted', async (tokenId, recipient, amount, projectType, validUntil, metadataURI, event) => {
      try {
        console.log(`CreditMinted event detected: Token ${tokenId}`);
        
        // Process the event
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        
        // Find project by metadata URI (IPFS hash)
        const ipfsHash = metadataURI.replace('ipfs://', '');
        const project = await Project.findOne({ 'verificationData.ipfsHash': ipfsHash });
        
        // Record the transaction
        const transaction = new Transaction({
          tokenId: tokenId.toNumber(),
          type: 'Mint',
          to: recipient,
          amount: amount.toNumber(),
          transactionHash: txHash,
          blockNumber,
          projectId: project ? project._id : null,
          timestamp: Date.now()
        });
        
        await transaction.save();
        console.log(`Mint transaction recorded for token ${tokenId}`);
        
        // Update project tokenId if project exists
        if (project && !project.tokenId) {
          project.tokenId = tokenId.toNumber();
          await project.save();
          console.log(`Project ${project._id} updated with tokenId ${tokenId}`);
        }
      } catch (error) {
        console.error('Error processing CreditMinted event:', error);
      }
    });
  }
  
  setupCreditTransferredListener() {
    this.carbonCreditContract.on('Transfer', async (from, to, tokenId, event) => {
      try {
        // Ignore minting and burning events
        if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) {
          return;
        }
        
        console.log(`Transfer event detected: Token ${tokenId} from ${from} to ${to}`);
        
        // Process the event
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        
        // Find project by token ID
        const project = await Project.findOne({ tokenId: tokenId.toNumber() });
        
        // Check if this is part of a marketplace transaction
        const pendingPurchase = await Transaction.findOne({
          tokenId: tokenId.toNumber(),
          type: 'Purchase',
          transactionHash: 'pending'
        });
        
        if (pendingPurchase) {
          // Update the pending purchase with the transaction details
          pendingPurchase.transactionHash = txHash;
          pendingPurchase.blockNumber = blockNumber;
          await pendingPurchase.save();
          console.log(`Updated pending purchase for token ${tokenId}`);
        } else {
          // Record as a regular transfer
          const transaction = new Transaction({
            tokenId: tokenId.toNumber(),
            type: 'Transfer',
            from,
            to,
            amount: 1, // ERC-721 transfers are always 1 token
            transactionHash: txHash,
            blockNumber,
            projectId: project ? project._id : null,
            timestamp: Date.now()
          });
          
          await transaction.save();
          console.log(`Transfer transaction recorded for token ${tokenId}`);
        }
      } catch (error) {
        console.error('Error processing Transfer event:', error);
      }
    });
  }
  
  setupCreditListedListener() {
    this.carbonMarketContract.on('CreditListed', async (tokenId, seller, price, event) => {
      try {
        console.log(`CreditListed event detected: Token ${tokenId}`);
        
        // Process the event
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        
        // Find project by token ID
        const project = await Project.findOne({ tokenId: tokenId.toNumber() });
        
        // Find pending listing
        const pendingListing = await Transaction.findOne({
          tokenId: tokenId.toNumber(),
          type: 'Listing',
          transactionHash: 'pending'
        });
        
        if (pendingListing) {
          // Update pending listing
          pendingListing.transactionHash = txHash;
          pendingListing.blockNumber = blockNumber;
          pendingListing.price = ethers.formatEther(price);
          await pendingListing.save();
          console.log(`Updated pending listing for token ${tokenId}`);
        } else {
          // Create new listing record
          const transaction = new Transaction({
            tokenId: tokenId.toNumber(),
            type: 'Listing',
            from: seller,
            amount: 1,
            price: ethers.formatEther(price),
            transactionHash: txHash,
            blockNumber,
            projectId: project ? project._id : null,
            timestamp: Date.now()
          });
          
          await transaction.save();
          console.log(`Listing transaction recorded for token ${tokenId}`);
        }
      } catch (error) {
        console.error('Error processing CreditListed event:', error);
      }
    });
  }
  
  setupCreditSoldListener() {
    this.carbonMarketContract.on('CreditSold', async (tokenId, seller, buyer, price, event) => {
      try {
        console.log(`CreditSold event detected: Token ${tokenId}`);
        
        // Process the event
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        
        // Find project by token ID
        const project = await Project.findOne({ tokenId: tokenId.toNumber() });
        
        // Find pending purchase
        const pendingPurchase = await Transaction.findOne({
          tokenId: tokenId.toNumber(),
          type: 'Purchase',
          transactionHash: 'pending'
        });
        
        if (pendingPurchase) {
          // Update pending purchase
          pendingPurchase.transactionHash = txHash;
          pendingPurchase.blockNumber = blockNumber;
          pendingPurchase.from = seller;
          pendingPurchase.to = buyer;
          pendingPurchase.price = ethers.formatEther(price);
          await pendingPurchase.save();
          console.log(`Updated pending purchase for token ${tokenId}`);
        } else {
          // Create new purchase record
          const transaction = new Transaction({
            tokenId: tokenId.toNumber(),
            type: 'Purchase',
            from: seller,
            to: buyer,
            amount: 1,
            price: ethers.formatEther(price),
            transactionHash: txHash,
            blockNumber,
            projectId: project ? project._id : null,
            timestamp: Date.now()
          });
          
          await transaction.save();
          console.log(`Purchase transaction recorded for token ${tokenId}`);
        }
      } catch (error) {
        console.error('Error processing CreditSold event:', error);
      }
    });
  }
  
  setupCreditRetiredListener() {
    this.carbonCreditContract.on('CreditRetired', async (tokenId, owner, amount, event) => {
      try {
        console.log(`CreditRetired event detected: Token ${tokenId}`);
        
        // Process the event
        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        
        // Find project by token ID
        const project = await Project.findOne({ tokenId: tokenId.toNumber() });
        
        // Find pending retirement
        const pendingRetirement = await Transaction.findOne({
          tokenId: tokenId.toNumber(),
          type: 'Retirement',
          transactionHash: 'pending'
        });
        
        if (pendingRetirement) {
          // Update pending retirement
          pendingRetirement.transactionHash = txHash;
          pendingRetirement.blockNumber = blockNumber;
          pendingRetirement.amount = amount.toNumber();
          await pendingRetirement.save();
          console.log(`Updated pending retirement for token ${tokenId}`);
        } else {
          // Create new retirement record
          const transaction = new Transaction({
            tokenId: tokenId.toNumber(),
            type: 'Retirement',
            from: owner,
            amount: amount.toNumber(),
            transactionHash: txHash,
            blockNumber,
            projectId: project ? project._id : null,
            timestamp: Date.now()
          });
          
          await transaction.save();
          console.log(`Retirement transaction recorded for token ${tokenId}`);
        }
      } catch (error) {
        console.error('Error processing CreditRetired event:', error);
      }
    });
  }
  
  async stop() {
    if (!this.isRunning) return;
    
    // Remove all listeners
    this.carbonCreditContract.removeAllListeners();
    this.carbonMarketContract.removeAllListeners();
    
    this.isRunning = false;
    console.log('Blockchain event listeners stopped');
  }
  
  async processHistoricalEvents(fromBlock = 0) {
    console.log(`Processing historical events from block ${fromBlock}...`);
    
    try {
      const latestBlock = await this.provider.getBlockNumber();
      const batchSize = 10000; // Process in batches to avoid RPC limitations
      
      for (let startBlock = fromBlock; startBlock <= latestBlock; startBlock += batchSize) {
        const endBlock = Math.min(startBlock + batchSize - 1, latestBlock);
        
        console.log(`Processing events from block ${startBlock} to ${endBlock}...`);
        
        // Get historical minting events
        const mintFilter = this.carbonCreditContract.filters.CreditMinted();
        const mintEvents = await this.carbonCreditContract.queryFilter(mintFilter, startBlock, endBlock);
        
        for (const event of mintEvents) {
          const [tokenId, recipient, amount, projectType, validUntil, metadataURI] = event.args;
          
          // Check if already processed
          const exists = await Transaction.findOne({ 
            transactionHash: event.transactionHash,
            type: 'Mint'
          });
          
          if (!exists) {
            // Process the event (simplified version)
            const ipfsHash = metadataURI.replace('ipfs://', '');
            const project = await Project.findOne({ 'verificationData.ipfsHash': ipfsHash });
            
            const transaction = new Transaction({
              tokenId: tokenId.toNumber(),
              type: 'Mint',
              to: recipient,
              amount: amount.toNumber(),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              projectId: project ? project._id : null,
              timestamp: Date.now()
            });
            
            await transaction.save();
            console.log(`Historical mint transaction recorded for token ${tokenId}`);
            
            // Update project tokenId if needed
            if (project && !project.tokenId) {
              project.tokenId = tokenId.toNumber();
              await project.save();
            }
          }
        }
        
        // Similar processing for other event types...
        // This would be expanded for Transfer, Listing, Sale, and Retirement events
      }
      
      console.log('Historical event processing completed');
    } catch (error) {
      console.error('Error processing historical events:', error);
    }
  }
}

module.exports = new EventListenerService();