const express = require('express');
const multer = require('multer');
const projectService = require('../../services/projectService');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Create a new project
router.post(
  '/',
  authenticateToken,
  upload.array('documents', 10),
  async (req, res) => {
    try {
      const projectData = JSON.parse(req.body.projectData);
      const files = req.files;
      
      const project = await projectService.createProject(
        projectData,
        req.user.userId,
        files
      );
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Get all projects
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters if provided
    if (req.query.status) filters.status = req.query.status;
    if (req.query.projectType) filters.projectType = req.query.projectType;
    
    const projects = await projectService.getProjects(filters);
    
    res.json(projects);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Get project by ID
router.get('/:projectId', async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found'
      });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Get projects by owner
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const projects = await projectService.getProjectsByOwner(req.params.ownerId);
    
    res.json(projects);
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});

// Add document to project
router.post(
  '/:projectId/documents',
  authenticateToken,
  upload.single('document'),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { description } = req.body;
      const file = req.file;
      
      const project = await projectService.addDocumentToProject(
        projectId,
        file,
        description
      );
      
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Update project status (verifiers only)
router.patch(
  '/:projectId/status',
  authenticateToken,
  authorizeRoles(['verifier', 'admin']),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { status, comments, ipfsHash, mintToken } = req.body;
      
      const project = await projectService.updateProjectStatus(
        projectId,
        status,
        {
          verifierId: req.user.userId,
          comments,
          ipfsHash,
          mintToken
        }
      );
      
      res.json(project);
    } catch (error) {
      res.status(400).json({
        error: true,
        message: error.message
      });
    }
  }
);

module.exports = router;