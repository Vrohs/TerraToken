const CarbonCredit = require('../models/CarbonCredit');
const Project = require('../models/Project');
const { ethers } = require('ethers');
const { config } = require('../config');

// Mock functions for demo purposes
const generateSerialNumber = () => {
  const prefix = 'TT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// @desc    Get all carbon credits
// @route   GET /api/carbon-credits
// @access  Public
exports.getCarbonCredits = async (req, res) => {
  try {
    const { forSale } = req.query;

    // Filter for marketplace if forSale is true
    const query = forSale === 'true' ? { forSale: true } : {};

    const credits = await CarbonCredit.find(query)
      .populate({
        path: 'project',
        select: 'name description projectType location'
      })
      .populate({
        path: 'owner',
        select: 'name email walletAddress'
      });

    res.status(200).json({
      success: true,
      count: credits.length,
      data: credits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single carbon credit
// @route   GET /api/carbon-credits/:id
// @access  Public
exports.getCarbonCredit = async (req, res) => {
  try {
    const credit = await CarbonCredit.findById(req.params.id)
      .populate({
        path: 'project',
        select: 'name description projectType location methodology'
      })
      .populate({
        path: 'owner',
        select: 'name email walletAddress'
      });

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'Carbon credit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: credit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new carbon credit (issue credits for a verified project)
// @route   POST /api/carbon-credits
// @access  Private (Admin or Project Developer)
exports.createCarbonCredit = async (req, res) => {
  try {
    const { projectId, amount, vintage, price } = req.body;

    // Validate input
    if (!projectId || !amount || !vintage) {
      return res.status(400).json({
        success: false,
        error: 'Please provide project ID, amount, and vintage year'
      });
    }

    // Get project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if project is verified
    if (project.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        error: 'Project must be verified before issuing carbon credits'
      });
    }

    // Check if user is project owner or admin
    if (
      project.developer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to issue credits for this project'
      });
    }

    // For demo purposes, generate token ID
    const tokenId = `${Date.now()}`;

    // Create carbon credit
    const credit = await CarbonCredit.create({
      tokenId,
      project: projectId,
      owner: req.user.id,
      amount,
      vintage: new Date(vintage),
      serialNumber: generateSerialNumber(),
      price: price || 0,
      forSale: price ? true : false,
      transactionHistory: [{
        transactionType: 'issuance',
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: req.user.walletAddress,
        amount,
        transactionHash: `demo_tx_${Date.now()}`
      }],
      metadata: {
        ipfsHash: `ipfs_mock_${Date.now()}`
      }
    });

    // Update project issued credits
    project.issuedCredits += parseInt(amount);
    await project.save();

    res.status(201).json({
      success: true,
      data: credit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update carbon credit (list for sale, change price)
// @route   PUT /api/carbon-credits/:id
// @access  Private
exports.updateCarbonCredit = async (req, res) => {
  try {
    const { forSale, price } = req.body;

    let credit = await CarbonCredit.findById(req.params.id);

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'Carbon credit not found'
      });
    }

    // Make sure user is the owner of the carbon credit
    if (credit.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this carbon credit'
      });
    }

    // Update fields
    credit.forSale = forSale !== undefined ? forSale : credit.forSale;
    credit.price = price !== undefined ? price : credit.price;

    await credit.save();

    res.status(200).json({
      success: true,
      data: credit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Retire carbon credit
// @route   PUT /api/carbon-credits/:id/retire
// @access  Private
exports.retireCarbonCredit = async (req, res) => {
  try {
    const { retirementBeneficiary, retirementReason } = req.body;

    let credit = await CarbonCredit.findById(req.params.id);

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'Carbon credit not found'
      });
    }

    // Make sure user is the owner of the carbon credit
    if (credit.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to retire this carbon credit'
      });
    }

    // Cannot retire already retired credits
    if (credit.status === 'retired') {
      return res.status(400).json({
        success: false,
        error: 'Carbon credit is already retired'
      });
    }

    // Update credit status
    credit.status = 'retired';
    credit.retirementDate = new Date();
    credit.retirementBeneficiary = retirementBeneficiary;
    credit.retirementReason = retirementReason;
    credit.forSale = false;

    // Add to transaction history
    credit.transactionHistory.push({
      transactionType: 'retirement',
      fromAddress: req.user.walletAddress,
      toAddress: '0x0000000000000000000000000000000000000000',
      amount: credit.amount,
      transactionHash: `demo_retire_tx_${Date.now()}`
    });

    await credit.save();

    res.status(200).json({
      success: true,
      data: credit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get carbon credits by user
// @route   GET /api/carbon-credits/user/:userId
// @access  Private
exports.getUserCarbonCredits = async (req, res) => {
  try {
    const credits = await CarbonCredit.find({ owner: req.params.userId })
      .populate({
        path: 'project',
        select: 'name description projectType'
      });

    res.status(200).json({
      success: true,
      count: credits.length,
      data: credits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};