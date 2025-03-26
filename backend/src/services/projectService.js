const Project = require('../models/Project');
const ipfsService = require('./ipfsService');
const { carbonCreditContract } = require('../utils/web3').initializeWeb3();

class ProjectService {
  // Create a new project
  async createProject(projectData, userId, files) {
    try {
      // Process and upload files to IPFS
      const documents = await Promise.all(
        files.map(async file => {
          const ipfsHash = await ipfsService.uploadFile(file.buffer);
          return {
            name: file.originalname,
            description: file.description || '',
            ipfsHash,
            uploadDate: new Date()
          };
        })
      );
      
      // Create project
      const project = new Project({
        ...projectData,
        owner: userId,
        documents
      });
      
      await project.save();
      
      return project;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all projects
  async getProjects(filters = {}) {
    try {
      return await Project.find(filters)
        .populate('owner', 'name email walletAddress')
        .populate('verificationData.verifier', 'name email walletAddress');
    } catch (error) {
      throw error;
    }
  }
  
  // Get project by ID
  async getProjectById(projectId) {
    try {
      return await Project.findById(projectId)
        .populate('owner', 'name email walletAddress')
        .populate('verificationData.verifier', 'name email walletAddress');
    } catch (error) {
      throw error;
    }
  }
  
  // Get projects by owner
  async getProjectsByOwner(ownerId) {
    try {
      return await Project.find({ owner: ownerId })
        .populate('verificationData.verifier', 'name email walletAddress');
    } catch (error) {
      throw error;
    }
  }
  
  // Add document to project
  async addDocumentToProject(projectId, file, description) {
    try {
      // Upload file to IPFS
      const ipfsHash = await ipfsService.uploadFile(file.buffer);
      
      // Update project
      const project = await Project.findByIdAndUpdate(
        projectId,
        {
          $push: {
            documents: {
              name: file.originalname,
              description: description || '',
              ipfsHash,
              uploadDate: new Date()
            }
          }
        },
        { new: true }
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    } catch (error) {
      throw error;
    }
  }
  
  // Update project status
  async updateProjectStatus(projectId, status, verifierData = {}) {
    try {
      const updates = { status };
      
      // If project is verified, add verification data
      if (status === 'Verified' && verifierData.verifierId) {
        updates.verificationData = {
          verifier: verifierData.verifierId,
          date: new Date(),
          comments: verifierData.comments || '',
          ipfsHash: verifierData.ipfsHash || ''
        };
        
        // Mint carbon credit token if project is verified
        if (verifierData.mintToken) {
          const project = await Project.findById(projectId).populate('owner', 'walletAddress');
          
          if (!project) {
            throw new Error('Project not found');
          }
          
          // Prepare for minting
          const ownerWalletAddress = project.owner.walletAddress;
          if (!ownerWalletAddress) {
            throw new Error('Project owner does not have a wallet address');
          }
          
          // Mint carbon credit token
          const tx = await carbonCreditContract.mintCredit(
            ownerWalletAddress,
            project.estimatedCredits,
            project.projectType,
            Math.floor((project.endDate - project.startDate) / 1000), // validity period in seconds
            `ipfs://${verifierData.ipfsHash}`
          );
          
          const receipt = await tx.wait();
          
          // Extract tokenId from event
          const mintEvent = receipt.events.find(e => e.event === 'CreditMinted');
          const tokenId = mintEvent.args.tokenId.toNumber();
          
          // Update project with tokenId
          updates.tokenId = tokenId;
        }
      }
      
      // Update project
      const project = await Project.findByIdAndUpdate(
        projectId,
        updates,
        { new: true }
      );
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectService();