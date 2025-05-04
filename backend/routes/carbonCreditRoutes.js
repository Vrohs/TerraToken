const express = require('express');
const {
  getCarbonCredits,
  getCarbonCredit,
  createCarbonCredit,
  updateCarbonCredit,
  retireCarbonCredit,
  getUserCarbonCredits
} = require('../controllers/carbonCreditController');
const { protect, authorize } = require('../middleware/auth');
const { validate, carbonCreditValidation } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getCarbonCredits)
  .post(protect, authorize('project_developer', 'admin'), validate(carbonCreditValidation), createCarbonCredit);

router.route('/:id')
  .get(getCarbonCredit)
  .put(protect, updateCarbonCredit);

router.route('/:id/retire')
  .put(protect, retireCarbonCredit);

router.route('/user/:userId')
  .get(protect, getUserCarbonCredits);

module.exports = router;
