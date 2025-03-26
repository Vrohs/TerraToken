const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const logger = require('../../utils/logger');
const { initializeWeb3 } = require('../../utils/web3');

// Get all active listings
exports.getListings = async (req, res) => {
  try {
    // In a real implementation, you would query your marketplace contract
    // For this demo, we'll create a simple mock marketplace
    
    // Get token IDs with their associated projects
    const activeListings = await Transaction.aggregate([
      // Get the most recent transactions for each token ID with type 'listing'
      {
        $match: {
          type: 'listing',
          status: 'confirmed'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: '$tokenId',
          latestListing: { $first: '$$ROOT' }
        }
      },
      // Only include tokens that haven't been purchased or canceled
      {
        $lookup: {
          from: 'transactions',
          let: { tokenId: '$_id', timestamp: '$latestListing.createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tokenId', '$$tokenId'] },
                    { $gt: ['$createdAt', '$$timestamp'] },
                    { 
                      $or: [
                        { $eq: ['$type', 'purchase'] }, 
                        { $eq: ['$type', 'cancel_listing'] }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'laterTransactions'
        }
      },
      {
        $match: {
          laterTransactions: { $size: 0 }
        }
      },
      // Join with projects
      {
        $lookup: {
          from: 'projects',
          localField: 'latestListing.projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true
        }
      },
      // Format the output
      {
        $project: {
          _id: 0,
          tokenId: '$_id',
          seller: '$latestListing.sender',
          price: '$latestListing.price',
          amount: '$latestListing.amount',
          currency: '$latestListing.currency',
          txHash: '$latestListing.txHash',
          listedAt: '$latestListing.createdAt',
          projectId: '$project._id',
          projectName: '$project.projectName',
          projectType: '$project.projectType',
          location: '$project.location'
        }
      }
    ]);
    
    // Apply filters if provided
    let filteredListings = activeListings;
    
    if (req.query.projectType) {
      filteredListings = filteredListings.filter(listing => 
        listing.projectType === req.query.projectType
      );
    }
    
    // Apply sorting
    if (req.query.sort === 'price') {
      filteredListings.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'date') {
      filteredListings.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));
    }
    
    res.status(200).json({
      success: true,
      count: filteredListings.length,
      data: filteredListings
    });
  } catch (error) {
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching marketplace listings',
      error: error.message
    // filepath: /home/vrohs/Desktop/TerraToken.io/backend/src/api/controllers/marketplaceController.js
const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const logger = require('../../utils/logger');
const { initializeWeb3 } = require('../../utils/web3');

// Get all active listings
exports.getListings = async (req, res) => {
  try {
    // In a real implementation, you would query your marketplace contract
    // For this demo, we'll create a simple mock marketplace
    
    // Get token IDs with their associated projects
    const activeListings = await Transaction.aggregate([
      // Get the most recent transactions for each token ID with type 'listing'
      {
        $match: {
          type: 'listing',
          status: 'confirmed'
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: '$tokenId',
          latestListing: { $first: '$$ROOT' }
        }
      },
      // Only include tokens that haven't been purchased or canceled
      {
        $lookup: {
          from: 'transactions',
          let: { tokenId: '$_id', timestamp: '$latestListing.createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$tokenId', '$$tokenId'] },
                    { $gt: ['$createdAt', '$$timestamp'] },
                    { 
                      $or: [
                        { $eq: ['$type', 'purchase'] }, 
                        { $eq: ['$type', 'cancel_listing'] }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'laterTransactions'
        }
      },
      {
        $match: {
          laterTransactions: { $size: 0 }
        }
      },
      // Join with projects
      {
        $lookup: {
          from: 'projects',
          localField: 'latestListing.projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true
        }
      },
      // Format the output
      {
        $project: {
          _id: 0,
          tokenId: '$_id',
          seller: '$latestListing.sender',
          price: '$latestListing.price',
          amount: '$latestListing.amount',
          currency: '$latestListing.currency',
          txHash: '$latestListing.txHash',
          listedAt: '$latestListing.createdAt',
          projectId: '$project._id',
          projectName: '$project.projectName',
          projectType: '$project.projectType',
          location: '$project.location'
        }
      }
    ]);
    
    // Apply filters if provided
    let filteredListings = activeListings;
    
    if (req.query.projectType) {
      filteredListings = filteredListings.filter(listing => 
        listing.projectType === req.query.projectType
      );
    }
    
    // Apply sorting
    if (req.query.sort === 'price') {
      filteredListings.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'date') {
      filteredListings.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));
    }
    
    res.status(200).json({
      success: true,
      count: filteredListings.length,
      data: filteredListings
    });
  } catch (error) {
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching marketplace listings',
      error: error.message
    