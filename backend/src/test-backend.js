require('dotenv').config();
const mongoose = require('mongoose');
const { verifyContractAddresses } = require('./utils/web3');
const ipfsService = require('./services/ipfsService');

const testBackend = async () => {
  try {
    // Test MongoDB connection
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Test contract connections
    console.log('\nTesting smart contract connections...');
    await verifyContractAddresses();
    
    // Test IPFS connection
    console.log('\nTesting IPFS connection...');
    const testData = { test: 'TerraToken IPFS test', timestamp: Date.now() };
    const ipfsHash = await ipfsService.uploadJSON(testData);
    console.log('IPFS connection successful, uploaded test data with hash:', ipfsHash);
    
    console.log('\nAll tests passed! Backend setup is working correctly.');
  } catch (error) {
    console.error('\nBackend test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testBackend();