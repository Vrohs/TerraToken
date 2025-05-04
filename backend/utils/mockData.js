const { config } = require('../config');
const User = require('../models/User');
const Project = require('../models/Project');
const CarbonCredit = require('../models/CarbonCredit');
const bcrypt = require('bcryptjs');

// Mock data generation for demo purposes
const seedMockData = async () => {
  try {
    console.log('Checking if mock data needs to be generated...');
    
    // Check if we already have users
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log('Database already has data, skipping mock data generation');
      return;
    }
    
    console.log('Generating mock data for demo...');
    
    // Create demo users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@terratoken.demo',
      password: await bcrypt.hash('password123', 10),
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      role: 'admin'
    });
    
    const developerUser = await User.create({
      name: 'Project Developer',
      email: 'developer@terratoken.demo',
      password: await bcrypt.hash('password123', 10),
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      role: 'project_developer'
    });
    
    const validatorUser = await User.create({
      name: 'Validator',
      email: 'validator@terratoken.demo',
      password: await bcrypt.hash('password123', 10),
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      role: 'validator'
    });
    
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@terratoken.demo',
      password: await bcrypt.hash('password123', 10),
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      role: 'user'
    });
    
    console.log('Created demo users');
    
    // Create demo projects
    const projects = [
      {
        name: 'Amazonian Reforestation Initiative',
        description: 'Reforestation project in the Amazon rainforest aimed at restoring degraded land and enhancing carbon sequestration.',
        location: {
          country: 'Brazil',
          region: 'Amazonas',
          coordinates: {
            latitude: -3.4653,
            longitude: -62.2159
          }
        },
        projectType: 'reforestation',
        methodology: 'AR-ACM0003',
        developer: developerUser._id,
        validator: validatorUser._id,
        status: 'approved',
        verificationStatus: 'verified',
        estimatedCredits: 50000,
        issuedCredits: 10000,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2033-01-01'),
        documents: [
          {
            name: 'Project Design Document',
            fileUrl: 'https://example.com/pdd.pdf',
            uploadDate: new Date('2022-12-01')
          }
        ]
      },
      {
        name: 'Solar Farm in Rajasthan',
        description: 'Large-scale solar energy project replacing grid electricity from fossil fuel sources in Rajasthan, India.',
        location: {
          country: 'India',
          region: 'Rajasthan',
          coordinates: {
            latitude: 27.0238,
            longitude: 74.2179
          }
        },
        projectType: 'renewable_energy',
        methodology: 'ACM0002',
        developer: developerUser._id,
        validator: validatorUser._id,
        status: 'approved',
        verificationStatus: 'verified',
        estimatedCredits: 30000,
        issuedCredits: 5000,
        startDate: new Date('2022-06-01'),
        endDate: new Date('2042-06-01'),
        documents: [
          {
            name: 'Project Design Document',
            fileUrl: 'https://example.com/pdd.pdf',
            uploadDate: new Date('2022-05-01')
          }
        ]
      },
      {
        name: 'Community-Based Methane Capture',
        description: 'Community-based project for capturing methane from waste and converting it to usable energy.',
        location: {
          country: 'Kenya',
          region: 'Nairobi',
          coordinates: {
            latitude: -1.2921,
            longitude: 36.8219
          }
        },
        projectType: 'methane_capture',
        methodology: 'AMS-III.H',
        developer: developerUser._id,
        status: 'under_review',
        verificationStatus: 'pending',
        estimatedCredits: 15000,
        issuedCredits: 0,
        startDate: new Date('2023-03-01'),
        endDate: new Date('2033-03-01'),
        documents: [
          {
            name: 'Project Design Document',
            fileUrl: 'https://example.com/pdd.pdf',
            uploadDate: new Date('2023-02-01')
          }
        ]
      }
    ];
    
    const createdProjects = [];
    
    for (const project of projects) {
      const createdProject = await Project.create(project);
      createdProjects.push(createdProject);
    }
    
    console.log('Created demo projects');
    
    // Create demo carbon credits
    const carbonCredits = [
      {
        tokenId: '1000001',
        project: createdProjects[0]._id,
        owner: developerUser._id,
        amount: 1000,
        vintage: new Date('2023-01-01'),
        serialNumber: 'TT-20230101-1001',
        status: 'active',
        price: 15.50,
        forSale: true,
        verificationStatus: 'verified',
        metadata: {
          ipfsHash: 'ipfs_mock_1000001'
        },
        transactionHistory: [
          {
            transactionType: 'issuance',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: developerUser.walletAddress,
            amount: 1000,
            transactionHash: 'demo_tx_1000001',
            date: new Date('2023-05-01')
          }
        ]
      },
      {
        tokenId: '1000002',
        project: createdProjects[0]._id,
        owner: developerUser._id,
        amount: 500,
        vintage: new Date('2023-01-01'),
        serialNumber: 'TT-20230101-1002',
        status: 'active',
        price: 16.25,
        forSale: true,
        verificationStatus: 'verified',
        metadata: {
          ipfsHash: 'ipfs_mock_1000002'
        },
        transactionHistory: [
          {
            transactionType: 'issuance',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: developerUser.walletAddress,
            amount: 500,
            transactionHash: 'demo_tx_1000002',
            date: new Date('2023-05-01')
          }
        ]
      },
      {
        tokenId: '1000003',
        project: createdProjects[1]._id,
        owner: developerUser._id,
        amount: 800,
        vintage: new Date('2022-12-01'),
        serialNumber: 'TT-20221201-1003',
        status: 'active',
        price: 12.75,
        forSale: true,
        verificationStatus: 'verified',
        metadata: {
          ipfsHash: 'ipfs_mock_1000003'
        },
        transactionHistory: [
          {
            transactionType: 'issuance',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: developerUser.walletAddress,
            amount: 800,
            transactionHash: 'demo_tx_1000003',
            date: new Date('2023-01-15')
          }
        ]
      },
      {
        tokenId: '1000004',
        project: createdProjects[1]._id,
        owner: regularUser._id,
        amount: 200,
        vintage: new Date('2022-12-01'),
        serialNumber: 'TT-20221201-1004',
        status: 'active',
        price: 0,
        forSale: false,
        verificationStatus: 'verified',
        metadata: {
          ipfsHash: 'ipfs_mock_1000004'
        },
        transactionHistory: [
          {
            transactionType: 'issuance',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: developerUser.walletAddress,
            amount: 200,
            transactionHash: 'demo_tx_1000004_1',
            date: new Date('2023-01-15')
          },
          {
            transactionType: 'transfer',
            fromAddress: developerUser.walletAddress,
            toAddress: regularUser.walletAddress,
            amount: 200,
            transactionHash: 'demo_tx_1000004_2',
            date: new Date('2023-02-20')
          }
        ]
      },
      {
        tokenId: '1000005',
        project: createdProjects[0]._id,
        owner: regularUser._id,
        amount: 300,
        vintage: new Date('2023-01-01'),
        serialNumber: 'TT-20230101-1005',
        status: 'retired',
        price: 0,
        forSale: false,
        verificationStatus: 'verified',
        retirementDate: new Date('2023-04-22'),
        retirementBeneficiary: 'TerraToken Demo Company',
        retirementReason: 'Annual carbon footprint offset',
        metadata: {
          ipfsHash: 'ipfs_mock_1000005'
        },
        transactionHistory: [
          {
            transactionType: 'issuance',
            fromAddress: '0x0000000000000000000000000000000000000000',
            toAddress: developerUser.walletAddress,
            amount: 300,
            transactionHash: 'demo_tx_1000005_1',
            date: new Date('2023-02-10')
          },
          {
            transactionType: 'transfer',
            fromAddress: developerUser.walletAddress,
            toAddress: regularUser.walletAddress,
            amount: 300,
            transactionHash: 'demo_tx_1000005_2',
            date: new Date('2023-03-15')
          },
          {
            transactionType: 'retirement',
            fromAddress: regularUser.walletAddress,
            toAddress: '0x0000000000000000000000000000000000000000',
            amount: 300,
            transactionHash: 'demo_tx_1000005_3',
            date: new Date('2023-04-22')
          }
        ]
      }
    ];
    
    for (const credit of carbonCredits) {
      await CarbonCredit.create(credit);
    }
    
    console.log('Created demo carbon credits');
    console.log('Mock data generation complete');
    
  } catch (error) {
    console.error('Error generating mock data:', error);
  }
};

module.exports = {
  seedMockData
};
