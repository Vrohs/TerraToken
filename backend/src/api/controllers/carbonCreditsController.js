const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const logger = require('../../utils/logger');
const { initializeWeb3 } = require('../../utils/web3');

// Get all carbon credits for a user
exports.getUserCredits = async (req, res) => {
  try {
    const { wallet } = initializeWeb3();
    const walletAddress = req.user.walletAddress || wallet.address;
    
    // In a real implementation, you would query your contracts via ethers
    // For this demo, we'll return mock data based on transactions
    
    const userTransactions = await Transaction.find({
      $or: [
        { sender: walletAddress },
        { recipient: walletAddress }
      ],
      status: 'confirmed'
    }).populate({
      path: 'projectId',
      select: 'projectName projectType location'
    });
    
    // Process transactions to determine current holdings
    const holdings = {};
    
    userTransactions.forEach(tx => {
      const tokenId = tx.tokenId.toString();
      
      if (!holdings[tokenId]) {
        holdings[tokenId] = {
          tokenId: tx.tokenId,
          projectId: tx.projectId?._id || null,
          projectName: tx.projectId?.projectName || 'Unknown Project',
          projectType: tx.projectId?.projectType || 'Unknown Type',
          location: tx.projectId?.location || 'Unknown Location',
          balance: 0,
          transactions: []
        };
      }
      
      // Update balance based on transaction type
      if (tx.type === 'mint' && tx.recipient === walletAddress) {
        holdings[tokenId].balance += tx.amount;
      } else if (tx.type === 'transfer' && tx.recipient === walletAddress) {
        holdings[tokenId].balance += tx.amount;
      } else if (tx.type === 'transfer' && tx.sender === walletAddress) {
        holdings[tokenId].balance -= tx.amount;
      } else if (tx.type === 'purchase' && tx.recipient === walletAddress) {
        holdings[tokenId].balance += tx.amount;
      } else if (tx.type === 'purchase' && tx.sender === walletAddress) {
        holdings[tokenId].balance -= tx.amount;
      } else if (tx.type === 'retirement' && tx.sender === walletAddress) {
        holdings[tokenId].balance -= tx.amount;
      }
      
      // Add transaction to history
      holdings[tokenId].transactions.push({
        id: tx._id,
        type: tx.type,
        amount: tx.amount,
        timestamp: tx.createdAt,
        txHash: tx.txHash
      });
    });
    
    // Convert to array and filter out zero balances
    const result = Object.values(holdings).filter(h => h.balance > 0);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    logger.error('Get user credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching carbon credits',
      error: error.message
    });
  }
};

// Get carbon credit details by token ID
exports.getCreditDetails = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // In a real implementation, you would query your contract
    // For this demo, we'll look up the credit in our transaction history
    
    const transactions = await Transaction.find({
      tokenId: parseInt(tokenId),
      status: 'confirmed'
    }).sort({ createdAt: 1 }).populate({
      path: 'projectId',
      select: 'projectName projectType location description documents verificationDetails'
    });
    
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }
    
    // Get the most recent project data
    const project = transactions[0].projectId;
    
    // Calculate total minted, transferred, and retired
    let totalMinted = 0;
    let totalRetired = 0;
    
    transactions.forEach(tx => {
      if (tx.type === 'mint') {
        totalMinted += tx.amount;
      } else if (tx.type === 'retirement') {
        totalRetired += tx.amount;
      }
    });
    
    const creditDetails = {
      tokenId: parseInt(tokenId),
      projectId: project?._id || null,
      projectName: project?.projectName || 'Unknown Project',
      projectType: project?.projectType || 'Unknown Type',
      location: project?.location || 'Unknown Location',
      description: project?.description || 'No description available',
      totalMinted,
      totalRetired,
      availableSupply: totalMinted - totalRetired,
      verificationDetails: project?.verificationDetails || null,
      documents: project?.documents || [],
      transactions: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        sender: tx.sender,
        recipient: tx.recipient,
        amount: tx.amount,
        price: tx.price,
        currency: tx.currency,
        txHash: tx.txHash,
        timestamp: tx.createdAt
      }))
    };
    
    res.status(200).json({
      success: true,
      data: creditDetails
    });
  } catch (error) {
    logger.error('Get credit details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching credit details',
      error: error.message
    });
  }
};

// Mint new carbon credits
exports.mintCarbonCredits = async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    
    // Verify project exists and is approved
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if project is approved and registered on blockchain
    if (project.verificationStatus !== 'approved' || !project.blockchainDetails.registered) {
      return res.status(400).json({
        success: false,
        message: 'Project must be approved and registered on blockchain before minting credits'
      });
    }
    
    // Check if user is authorized (admin or verifier)
    if (req.user.role !== 'admin' && req.user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mint carbon credits'
      });
    }
    
    // Initialize web3 connection
    const { carbonCreditContract, wallet } = initializeWeb3();
    
    // Get token ID from project
    const tokenId = project.blockchainDetails.tokenId;
    
    // Mint carbon credits
    // In a real implementation, you would call the actual contract function
    // This is a placeholder for the actual blockchain interaction
    try {
      // Example contract call
      // const tx = await carbonCreditContract.mintCredit(
      //   project.owner.walletAddress,
      //   amount,
      //   project.projectType,
      //   365 * 24 * 60 * 60, // 1 year validity in seconds
      //   `ipfs://project/${project._id}`
      // );
      // const receipt = await tx.wait();
      
      // For this demo, we'll simulate a successful minting
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Record transaction
      const transaction = await Transaction.create({
        type: 'mint',
        sender: wallet.address,
        recipient: project.owner.walletAddress,
        tokenId,
        amount,
        projectId: project._id,
        txHash: mockTxHash,
        status: 'confirmed',
        blockTimestamp: new Date()
      });
      
      // Update project issued credits
      project.issuedCredits += amount;
      await project.save();
      
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error('Blockchain minting error:', error);
      res.status(500).json({
        success: false,
        message: 'Error minting credits on blockchain',
        error: error.message
      });
    }
  } catch (error) {
    logger.error('Mint carbon credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error minting carbon credits',
      error: error.message
    });
  }
};

// Retire carbon credits
exports.retireCredits = async (req, res) => {
  try {
    const { tokenId, amount } = req.body;
    
    if (!req.user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required to retire credits'
      });
    }
    
    // Check if user has enough credits to retire
    // In a real implementation, you would check the actual balance on-chain
    const userCredits = await getUserCreditBalance(req.user.walletAddress, tokenId);
    
    if (userCredits < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credits to retire'
      });
    }
    
    // Initialize web3 connection
    const { wallet } = initializeWeb3();
    
    // Retire carbon credits
    // In a real implementation, you would call the actual contract function
    // This is a placeholder for the actual blockchain interaction
    try {
      // Example contract call
      // const tx = await retirementContract.retireCredits(tokenId, amount);
      // const receipt = await tx.wait();
      
      // For this demo, we'll simulate a successful retirement
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Find associated project
      const projectTransaction = await Transaction.findOne({
        tokenId: parseInt(tokenId),
        status: 'confirmed'
      }).populate('projectId');
      
      const projectId = projectTransaction?.projectId?._id || null;
      
      // Record transaction
      const transaction = await Transaction.create({
        type: 'retirement',
        sender: req.user.walletAddress,
        tokenId: parseInt(tokenId),
        amount,
        projectId,
        txHash: mockTxHash,
        status: 'confirmed',
        blockTimestamp: new Date()
      });
      
      // Update project retired credits if project exists
      if (projectId) {
        const project = await Project.findById(projectId);
        if (project) {
          project.retiredCredits += amount;
          await project.save();
        }
      }
      
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error('Blockchain retirement error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retiring credits on blockchain',
        error: error.message
      });
    }
  } catch (error) {
    logger.error('Retire credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retiring carbon credits',
      error: error.message
    });
  }
};

// Helper function to get user credit balance
const getUserCreditBalance = async (walletAddress, tokenId) => {
  // In a real implementation, you would query the actual balance on-chain
  // For this demo, we'll calculate it from our transaction history
  
  const transactions = await Transaction.find({
    $or: [
      { sender: walletAddress },
      { recipient: walletAddress }
    ],
    tokenId: parseInt(tokenId),
    status: 'confirmed'
  });
  
  let balance = 0;
  
  transactions.forEach(tx => {
    if (tx.type === 'mint' && tx.recipient === walletAddress) {
      balance += tx.amount;
    } else if (tx.type === 'transfer' && tx.recipient === walletAddress) {
      balance += tx.amount;
    } else if (tx.type === 'transfer' && tx.sender === walletAddress) {
      balance -= tx.amount;
    } else if (tx.type === 'purchase' && tx.recipient === walletAddress) {
      balance += tx.amount;
    } else if (tx.type === 'purchase' && tx.sender === walletAddress) {
      balance -= tx.amount;
    } else if (tx.type === 'retirement' && tx.sender === walletAddress) {
      balance -= tx.amount;
    }
  });
  
  return balance;
};