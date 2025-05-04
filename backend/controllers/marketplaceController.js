const CarbonCredit = require('../models/CarbonCredit');
const User = require('../models/User');

// @desc    Get all carbon credits for sale
// @route   GET /api/marketplace
// @access  Public
exports.getMarketplaceListings = async (req, res) => {
  try {
    const credits = await CarbonCredit.find({ 
      forSale: true,
      status: 'active'
    })
    .populate({
      path: 'project',
      select: 'name description projectType location methodology'
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

// @desc    Purchase carbon credit
// @route   POST /api/marketplace/purchase/:id
// @access  Private
exports.purchaseCarbonCredit = async (req, res) => {
  try {
    const creditId = req.params.id;

    let credit = await CarbonCredit.findById(creditId);

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'Carbon credit not found'
      });
    }

    // Check if credit is for sale
    if (!credit.forSale) {
      return res.status(400).json({
        success: false,
        error: 'This carbon credit is not for sale'
      });
    }

    // Check if credit is active
    if (credit.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This carbon credit is not active'
      });
    }

    // Check if buyer is not the owner
    if (credit.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot purchase your own carbon credit'
      });
    }

    // Get previous owner for record
    const previousOwner = await User.findById(credit.owner);
    
    // In a real application, payment processing would happen here
    // For demo, we'll just transfer ownership

    // Update transaction history
    credit.transactionHistory.push({
      transactionType: 'transfer',
      fromAddress: previousOwner.walletAddress,
      toAddress: req.user.walletAddress,
      amount: credit.amount,
      transactionHash: `demo_purchase_tx_${Date.now()}`
    });

    // Update credit status
    credit.owner = req.user.id;
    credit.forSale = false;
    credit.status = 'transferred';

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

// @desc    Get marketplace statistics
// @route   GET /api/marketplace/stats
// @access  Public
exports.getMarketplaceStats = async (req, res) => {
  try {
    // Get total credits for sale
    const totalCreditsForSale = await CarbonCredit.countDocuments({ 
      forSale: true,
      status: 'active'
    });

    // Get average price
    const priceStats = await CarbonCredit.aggregate([
      { $match: { forSale: true, status: 'active' } },
      { $group: { 
          _id: null, 
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalVolume: { $sum: '$amount' }
        }
      }
    ]);

    // Get counts by project type
    const projectTypeStats = await CarbonCredit.aggregate([
      { 
        $match: { forSale: true, status: 'active' } 
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: '$projectInfo.projectType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          projectType: '$_id',
          count: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCreditsForSale,
        prices: priceStats.length > 0 ? {
          average: priceStats[0].averagePrice,
          min: priceStats[0].minPrice,
          max: priceStats[0].maxPrice,
          totalVolume: priceStats[0].totalVolume
        } : {
          average: 0,
          min: 0,
          max: 0,
          totalVolume: 0
        },
        byProjectType: projectTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
