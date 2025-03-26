const Transaction = require('../models/Transaction');
const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

class AnalyticsService {
  // Get platform overview metrics
  async getPlatformOverview() {
    try {
      // Total verified projects
      const verifiedProjects = await Project.countDocuments({ status: 'Verified' });
      
      // Total carbon credits issued
      const totalCreditsResult = await Transaction.aggregate([
        { $match: { type: 'Mint' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalCredits = totalCreditsResult.length > 0 ? totalCreditsResult[0].total : 0;
      
      // Total carbon credits retired
      const retiredCreditsResult = await Transaction.aggregate([
        { $match: { type: 'Retirement' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const retiredCredits = retiredCreditsResult.length > 0 ? retiredCreditsResult[0].total : 0;
      
      // Total trading volume
      const tradingVolumeResult = await Transaction.aggregate([
        { $match: { type: 'Purchase' } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$amount'] } } } }
      ]);
      const tradingVolume = tradingVolumeResult.length > 0 ? tradingVolumeResult[0].total : 0;
      
      // Active users count
      const uniqueWallets = await Transaction.distinct('from');
      const uniqueBuyers = await Transaction.distinct('to');
      const activeUsers = new Set([...uniqueWallets, ...uniqueBuyers].filter(Boolean)).size;
      
      return {
        verifiedProjects,
        totalCredits,
        retiredCredits,
        activeCredits: totalCredits - retiredCredits,
        tradingVolume,
        activeUsers
      };
    } catch (error) {
      console.error('Error in getPlatformOverview:', error);
      throw error;
    }
  }
  
  // Get marketplace activity metrics
  async getMarketplaceActivity(timeperiod = 'last7days') {
    try {
      let dateFilter;
      const now = new Date();
      
      // Configure date range for the query
      switch (timeperiod) {
        case 'last24h':
          dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
          break;
        case 'last7days':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'last30days':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'last90days':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        default:
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      }
      
      // Activity by transaction type
      const activityByType = await Transaction.aggregate([
        { $match: { timestamp: dateFilter } },
        { $group: { _id: '$type', count: { $sum: 1 }, volume: { $sum: '$amount' } } },
        { $project: { type: '$_id', count: 1, volume: 1, _id: 0 } }
      ]);
      
      // Daily activity for the time period
      const dailyActivity = await Transaction.aggregate([
        { $match: { timestamp: dateFilter } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              type: '$type'
            },
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            activities: {
              $push: {
                type: '$_id.type',
                count: '$count',
                volume: '$volume'
              }
            },
            totalCount: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Most active projects
      const mostActiveProjects = await Transaction.aggregate([
        { $match: { timestamp: dateFilter, projectId: { $ne: null } } },
        { $group: { _id: '$projectId', transactionCount: { $sum: 1 } } },
        { $sort: { transactionCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        {
          $project: {
            projectId: '$_id',
            transactionCount: 1,
            projectName: { $arrayElemAt: ['$projectDetails.projectName', 0] },
            projectType: { $arrayElemAt: ['$projectDetails.projectType', 0] },
            _id: 0
          }
        }
      ]);
      
      // Average price trend
      const priceTrend = await Transaction.aggregate([
        { $match: { type: 'Purchase', timestamp: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            averagePrice: { $avg: '$price' },
            totalVolume: { $sum: { $multiply: ['$price', '$amount'] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return {
        activityByType,
        dailyActivity,
        mostActiveProjects,
        priceTrend
      };
    } catch (error) {
      console.error('Error in getMarketplaceActivity:', error);
      throw error;
    }
  }
  
  // Get user growth metrics
  async getUserGrowthMetrics(timeperiod = 'monthly') {
    try {
      let groupFormat;
      
      // Configure date grouping format
      switch (timeperiod) {
        case 'daily':
          groupFormat = '%Y-%m-%d';
          break;
        case 'weekly':
          groupFormat = '%Y-%U'; // Week number
          break;
        case 'monthly':
          groupFormat = '%Y-%m';
          break;
        default:
          groupFormat = '%Y-%m';
      }
      
      // User registration trend
      const registrationTrend = await User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      // Calculate cumulative users
      let cumulativeUsers = 0;
      const userGrowth = registrationTrend.map(period => {
        cumulativeUsers += period.newUsers;
        return {
          period: period._id,
          newUsers: period.newUsers,
          totalUsers: cumulativeUsers
        };
      });
      
      // User retention analysis
      // This is a simplified approach - for a real app, this would be more sophisticated
      const retentionData = await Transaction.aggregate([
        { $group: { _id: '$from', firstActivity: { $min: '$timestamp' }, lastActivity: { $max: '$timestamp' } } },
        {
          $project: {
            user: '$_id',
            daysSinceFirstActivity: {
              $divide: [
                { $subtract: [new Date(), '$firstActivity'] },
                1000 * 60 * 60 * 24
              ]
            },
            daysSinceLastActivity: {
              $divide: [
                { $subtract: [new Date(), '$lastActivity'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeLastDay: { $sum: { $cond: [{ $lte: ['$daysSinceLastActivity', 1] }, 1, 0] } },
            activeLastWeek: { $sum: { $cond: [{ $lte: ['$daysSinceLastActivity', 7] }, 1, 0] } },
            activeLastMonth: { $sum: { $cond: [{ $lte: ['$daysSinceLastActivity', 30] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            activeLastDay: 1,
            activeLastWeek: 1,
            activeLastMonth: 1,
            retentionRateDay: { $divide: ['$activeLastDay', '$totalUsers'] },
            retentionRateWeek: { $divide: ['$activeLastWeek', '$totalUsers'] },
            retentionRateMonth: { $divide: ['$activeLastMonth', '$totalUsers'] }
          }
        }
      ]);
      
      return {
        userGrowth,
        retention: retentionData.length > 0 ? retentionData[0] : {
          totalUsers: 0,
          activeLastDay: 0,
          activeLastWeek: 0,
          activeLastMonth: 0,
          retentionRateDay: 0,
          retentionRateWeek: 0,
          retentionRateMonth: 0
        }
      };
    } catch (error) {
      console.error('Error in getUserGrowthMetrics:', error);
      throw error;
    }
  }
  
  // Get carbon impact metrics
  async getCarbonImpactMetrics() {
    try {
      // Total carbon offset by project type
      const offsetByType = await Project.aggregate([
        { $match: { status: 'Verified', tokenId: { $ne: null } } },
        {
          $group: {
            _id: '$projectType',
            totalOffset: { $sum: '$estimatedCredits' }
          }
        },
        {
          $project: {
            projectType: '$_id',
            totalOffset: 1,
            _id: 0
          }
        }
      ]);
      
      // Carbon offset by region
      const offsetByRegion = await Project.aggregate([
        { $match: { status: 'Verified', tokenId: { $ne: null } } },
        {
          $group: {
            _id: { $regexFind: { input: '$location', regex: '^[^,]+' } },
            totalOffset: { $sum: '$estimatedCredits' }
          }
        },
        {
          $project: {
            region: { $ifNull: [{ $arrayElemAt: ['$_id.captures', 0] }, 'Unknown'] },
            totalOffset: 1,
            _id: 0
          }
        },
        { $sort: { totalOffset: -1 } }
      ]);
      
      // Retirement impact
      const retirementImpact = await Transaction.aggregate([
        { $match: { type: 'Retirement' } },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'projectDetails'
          }
        },
        {
          $group: {
            _id: { $arrayElemAt: ['$projectDetails.projectType', 0] },
            totalRetired: { $sum: '$amount' }
          }
        },
        {
          $project: {
            projectType: { $ifNull: ['$_id', 'Unknown'] },
            totalRetired: 1,
            _id: 0
          }
        }
      ]);
      
      // Monthly impact trend
      const monthlyImpact = await Transaction.aggregate([
        { $match: { $or: [{ type: 'Mint' }, { type: 'Retirement' }] } },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
              type: '$type'
            },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.month',
            data: {
              $push: {
                type: '$_id.type',
                amount: '$totalAmount'
              }
            }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: '$_id',
            minted: {
              $reduce: {
                input: {
                  $filter: {
                    input: '$data',
                    as: 'item',
                    cond: { $eq: ['$$item.type', 'Mint'] }
                  }
                },
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] }
              }
            },
            retired: {
              $reduce: {
                input: {
                  $filter: {
                    input: '$data',
                    as: 'item',
                    cond: { $eq: ['$$item.type', 'Retirement'] }
                  }
                },
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] }
              }
            },
            _id: 0
          }
        }
      ]);
      
      return {
        offsetByType,
        offsetByRegion,
        retirementImpact,
        monthlyImpact
      };
    } catch (error) {
      console.error('Error in getCarbonImpactMetrics:', error);
      throw error;
    }
  }
  
  // Get project success metrics
  async getProjectSuccessMetrics() {
    try {
      // Project verification success rate
      const verificationStats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Calculate total and create stats object
      const totalProjects = verificationStats.reduce((sum, stat) => sum + stat.count, 0);
      const statusCounts = {};
      
      verificationStats.forEach(stat => {
        statusCounts[stat._id] = {
          count: stat.count,
          percentage: totalProjects > 0 ? (stat.count / totalProjects) * 100 : 0
        };
      });
      
      // Average verification time
      const verificationTimeStats = await Project.aggregate([
        { $match: { status: 'Verified', 'verificationData.date': { $exists: true } } },
        {
          $project: {
            verificationTime: {
              $divide: [
                { $subtract: ['$verificationData.date', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageTime: { $avg: '$verificationTime' },
            minTime: { $min: '$verificationTime' },
            maxTime: { $max: '$verificationTime' }
          }
        }
      ]);
      
      // Project type distribution
      const projectTypeDistribution = await Project.aggregate([
        {
          $group: {
            _id: '$projectType',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            projectType: '$_id',
            count: 1,
            percentage: { $multiply: [{ $divide: ['$count', totalProjects] }, 100] },
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      return {
        statusCounts,
        verificationTimeStats: verificationTimeStats.length > 0 ? verificationTimeStats[0] : {
          averageTime: 0,
          minTime: 0,
          maxTime: 0
        },
        projectTypeDistribution,
        totalProjects
      };
    } catch (error) {
      console.error('Error in getProjectSuccessMetrics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();