const { ethers } = require('ethers');
const { config } = require('../config');
const fs = require('fs');
const path = require('path');

// Load ABIs
const loadContract = (contractName) => {
  try {
    const abiPath = path.join(__dirname, '../../frontend/project/src/abi', `${contractName}.json`);
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
    return abi;
  } catch (error) {
    console.error(`Error loading ${contractName} ABI:`, error);
    return null;
  }
};

// Create provider and signer
const getProvider = () => {
  return new ethers.JsonRpcProvider(config.alchemyRpcUrl);
};

const getSigner = () => {
  const provider = getProvider();
  return new ethers.Wallet(config.privateKey, provider);
};

// Get contract instances
const getCarbonCreditContract = () => {
  const abi = loadContract('CarbonCredit');
  if (!abi) return null;
  
  const signer = getSigner();
  return new ethers.Contract(config.carbonCreditAddress, abi, signer);
};

const getVerificationContract = () => {
  const abi = loadContract('Verification');
  if (!abi) return null;
  
  const signer = getSigner();
  return new ethers.Contract(config.verificationAddress, abi, signer);
};

const getCarbonMarketContract = () => {
  const abi = loadContract('CarbonCreditMarket');
  if (!abi) return null;
  
  const signer = getSigner();
  return new ethers.Contract(config.carbonMarketAddress, abi, signer);
};

// Blockchain helper functions
const mintCarbonToken = async (to, tokenId, amount, uri) => {
  try {
    const carbonContract = getCarbonCreditContract();
    if (!carbonContract) {
      throw new Error('Failed to load carbon credit contract');
    }

    const tx = await carbonContract.mint(to, tokenId, amount, uri);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transaction: receipt
    };
  } catch (error) {
    console.error('Error minting carbon token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const verifyProject = async (projectId, verified) => {
  try {
    const verificationContract = getVerificationContract();
    if (!verificationContract) {
      throw new Error('Failed to load verification contract');
    }

    const tx = await verificationContract.verifyProject(projectId, verified);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transaction: receipt
    };
  } catch (error) {
    console.error('Error verifying project:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const listTokenForSale = async (tokenId, price) => {
  try {
    const marketContract = getCarbonMarketContract();
    if (!marketContract) {
      throw new Error('Failed to load market contract');
    }

    const tx = await marketContract.listToken(tokenId, price);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transaction: receipt
    };
  } catch (error) {
    console.error('Error listing token for sale:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const purchaseToken = async (tokenId, price) => {
  try {
    const marketContract = getCarbonMarketContract();
    if (!marketContract) {
      throw new Error('Failed to load market contract');
    }

    const tx = await marketContract.purchaseToken(tokenId, { value: price });
    const receipt = await tx.wait();
    
    return {
      success: true,
      transaction: receipt
    };
  } catch (error) {
    console.error('Error purchasing token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const retireToken = async (tokenId, amount) => {
  try {
    const carbonContract = getCarbonCreditContract();
    if (!carbonContract) {
      throw new Error('Failed to load carbon credit contract');
    }

    const tx = await carbonContract.retire(tokenId, amount);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transaction: receipt
    };
  } catch (error) {
    console.error('Error retiring token:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getProvider,
  getSigner,
  getCarbonCreditContract,
  getVerificationContract,
  getCarbonMarketContract,
  mintCarbonToken,
  verifyProject,
  listTokenForSale,
  purchaseToken,
  retireToken
};
