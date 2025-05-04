const express = require('express');
const {
  getMarketplaceListings,
  purchaseCarbonCredit,
  getMarketplaceStats
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getMarketplaceListings);

router.route('/stats')
  .get(getMarketplaceStats);

router.route('/purchase/:id')
  .post(protect, purchaseCarbonCredit);

module.exports = router;
