const express = require('express');
const registryIntegrationService = require('../../services/registryIntegrationService');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// Verify a project with an external registry
router.post(
  '/verify/:registryName',
  authenticateToken,
  authorizeRoles(['verifier', 'admin']),
  async (req, res) => {
    try {
      const { registryName } = req.params;
      const { projectId, registryProjectId } = req.body;
      
      if (!projectId || !registryProjectId) {
        return res.status(400).json({
          error: true,
          message: 'Project ID and registry project ID are required'
        });
      }
      
      const result = await registryIntegrationService.verifyProjectWithRegistry(
        projectId,
        registryName,
        registryProjectId
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Get project details from external registry
router.get(
  '/:registryName/project/:registryProjectId',
  authenticateToken,
  async (req, res) => {
    try {
      const { registryName, registryProjectId } = req.params;
      
      const projectDetails = await registryIntegrationService.getProjectFromRegistry(
        registryName,
        registryProjectId
      );
      
      res.json(projectDetails);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Import a project from an external registry
router.post(
  '/import/:registryName',
  authenticateToken,
  async (req, res) => {
    try {
      const { registryName } = req.params;
      const { registryProjectId } = req.body;
      
      if (!registryProjectId) {
        return res.status(400).json({
          error: true,
          message: 'Registry project ID is required'
        });
      }
      
      const result = await registryIntegrationService.importProjectFromRegistry(
        registryName,
        registryProjectId,
        req.user.userId
      );
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Search for projects in an external registry
router.get(
  '/:registryName/search',
  authenticateToken,
  async (req, res) => {
    try {
      const { registryName } = req.params;
      const searchParams = req.query;
      
      const results = await registryIntegrationService.searchRegistryProjects(
        registryName,
        searchParams
      );
      
      res.json(results);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Get credit status from an external registry
router.get(
  '/:registryName/credit/:serialNumber',
  authenticateToken,
  async (req, res) => {
    try {
      const { registryName, serialNumber } = req.params;
      
      const creditStatus = await registryIntegrationService.getCreditStatus(
        registryName,
        serialNumber
      );
      
      res.json(creditStatus);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

// Report credit retirement to an external registry
router.post(
  '/:registryName/retire',
  authenticateToken,
  async (req, res) => {
    try {
      const { registryName } = req.params;
      const { serialNumber, amount, beneficiary } = req.body;
      
      if (!serialNumber || !amount) {
        return res.status(400).json({
          error: true,
          message: 'Serial number and amount are required'
        });
      }
      
      const result = await registryIntegrationService.reportCreditRetirement(
        registryName,
        serialNumber,
        amount,
        beneficiary || req.user.name
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
);

module.exports = router;