const Project = require('../models/Project');
const logger = require('../../utils/logger');
const { uploadToIPFS, uploadMetadataToIPFS } = require('../../utils/ipfs');
const { initializeWeb3 } = require('../../utils/web3');

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by project type if provided
    if (req.query.projectType) {
      query.projectType = req.query.projectType;
    }
    
    // Filter by owner if viewing own projects
    if (req.query.myProjects === 'true' && req.user) {
      query.owner = req.user.id;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    const projects = await Project.find(query)
      .populate('owner', 'name email walletAddress')
      .populate('verificationDetails.verifier', 'name email')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: projects
    });
  } catch (error) {
    logger.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects',
      error: error.message
    });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email walletAddress')
      .populate('verificationDetails.verifier', 'name email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project',
      error: error.message
    });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      location,
      description,
      startDate,
      endDate,
      estimatedCredits,
      methodology,
      contactName,
      contactEmail
    } = req.body;
    
    // Create project with owner set to current user
    const project = await Project.create({
      projectName,
      projectType,
      location,
      description,
      startDate,
      endDate,
      estimatedCredits,
      methodology,
      contactName,
      contactEmail,
      owner: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating project',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is project owner
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }
    
    // Update only if not already verified
    if (project.verificationStatus !== 'not_submitted' && project.verificationStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update project that is under review or approved'
      });
    }
    
    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project',
      error: error.message
    });
  }
};

// Upload project document
exports.uploadDocument = async (req, res) => {
  try {
    // Find project
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is project owner
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents to this project'
      });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Upload file to IPFS
    const ipfsResult = await uploadToIPFS(req.file.buffer);
    
    // Add document to project
    project.documents.push({
      name: req.file.originalname,
      description: req.body.description || '',
      ipfsCid: ipfsResult.cid,
      ipfsUrl: ipfsResult.url
    });
    
    await project.save();
    
    res.status(200).json({
      success: true,
      data: project.documents[project.documents.length - 1]
    });
  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading document',
      error: error.message
    });
  }
};

// Submit project for verification
exports.submitForVerification = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is project owner
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this project for verification'
      });
    }
    
    // Check if project has documents
    if (project.documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project must have at least one document to submit for verification'
      });
    }
    
    // Update project verification status
    project.verificationStatus = 'pending';
    project.status = 'under_review';
    await project.save();
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Submit for verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting project for verification',
      error: error.message
    });
  }
};

// Register project on blockchain
exports.registerOnBlockchain = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'walletAddress');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if project is approved
    if (project.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Project must be approved before registering on blockchain'
      });
    }
    
    // Check if already registered
    if (project.blockchainDetails.registered) {
      return res.status(400).json({
        success: false,
        message: 'Project is already registered on blockchain'
      });
    }
    
    // Only admin, verifier or project owner can register
    if (project.owner._id.toString() !== req.user.id &&
        req.user.role !== 'admin' && 
        req.user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to register this project on blockchain'
      });
    }
    
    // Prepare metadata for blockchain
    const metadata = {
      projectName: project.projectName,
      projectType: project.projectType,
      location: project.location,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      methodology: project.methodology,
      estimatedCredits: project.estimatedCredits,
      documents: project.documents.map(doc => doc.ipfsUrl),
      verificationReport: project.verificationDetails.reportUrl || '',
      verifiedBy: project.verificationDetails.verifier || '',
      verifiedAt: project.verificationDetails.verifiedAt || '',
      databaseId: project._id.toString()
    };
    
    // Upload metadata to IPFS
    const ipfsResult = await uploadMetadataToIPFS(metadata);
    
    // Initialize web3 connection
    const { carbonCreditContract, wallet } = initializeWeb3();
    
    // Register project on blockchain
    // In a real implementation, you would call the appropriate smart contract function
    // This is a placeholder for the actual blockchain interaction
    try {
      // Example contract call (implementation would depend on actual contract)
      // const tx = await contract.registerProject(
      //   project.owner.walletAddress,
      //   project.projectType,
      //   project.estimatedCredits,
      //   365 * 24 * 60 * 60, // 1 year validity in seconds
      //   ipfsResult.url
      // );
      // const receipt = await tx.wait();
      
      // For this demo, we'll simulate a successful registration
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Update project with blockchain details
      project.blockchainDetails = {
        registered: true,
        tokenId: Math.floor(Math.random() * 1000), // Mock token ID
        registrationTxHash: mockTxHash,
        registeredAt: new Date()
      };
      
      await project.save();
      
      res.status(200).json({
        success: true,
        data: project.blockchainDetails
      });
    } catch (error) {
      logger.error('Blockchain registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering project on blockchain',
        error: error.message
      });
    }
  } catch (error) {
    logger.error('Register on blockchain error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering project on blockchain',
      error: error.message
    });
  }
};