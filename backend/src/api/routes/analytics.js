const express = require('express');
const analyticsService = require('../../services/analyticsService');
const { authenticateToken, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// Get platform overview
router.get('/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getPlatformOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// Get marketplace activity
router.get('/marketplace', async (req, res) => {
  try {
    const { timeperiod } = req.query;
    const activity = await analyticsService.getMarketplaceActivity(timeperiod);
    res.json(activity);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// Get user growth metrics
router.get('/users', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const { timeperiod } = req.query;
    const userMetrics = await analyticsService.getUserGrowthMetrics(timeperiod);
    res.json(userMetrics);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// Get carbon impact metrics
router.get('/impact', async (req, res) => {
  try {
    const impactMetrics = await analyticsService.getCarbonImpactMetrics();
    res.json(impactMetrics);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

// Get project success metrics
router.get('/projects', authenticateToken, authorizeRoles(['admin', 'verifier']), async (req, res) => {
  try {
    const projectMetrics = await analyticsService.getProjectSuccessMetrics();
    res.json(projectMetrics);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;