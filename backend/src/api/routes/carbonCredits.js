const express = require('express');
const { check } = require('express-validator');
const carbonCreditsController = require('../controllers/carbonCreditsController');
const { validateRequest } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get carbon credit details by token ID (public)
router.get('/:tokenId', carbonCreditsController.getCreditDetails);

// Protected routes
router.use(protect);

// Get all carbon credits for a user
router.get('/user/credits', carbonCreditsController.getUserCredits);

// Admin and verifier only routes
router.use(authorize('admin', 'verifier'));

// Mint new carbon credits
router.post(
  '/mint',
  [
    check('projectId', 'Project ID is required').isMongoId(),
    check('amount', 'Amount must be a positive number').isInt({ min: 1 })
  ],
  validateRequest,
  carbonCreditsController.mintCarbonCredits
);

// Retire carbon credits (any authenticated user)
router.post(
  '/retire',
  [
    check('tokenId', 'Token ID is required').isNumeric(),
    check('amount', 'Amount must be a positive number').isInt({ min: 1 })
  ],
  validateRequest,
  carbonCreditsController.retireCredits
);

module.exports = router;

