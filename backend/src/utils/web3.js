const { ethers } = require("ethers");
require('dotenv').config();

const initializeWeb3 = () => {
  try {
    // Validate environment variables
    const requiredEnvVars = [
      'ALCHEMY_RPC_URL',
      'PRIVATE_KEY',
      'CARBON_CREDIT_ADDRESS',
      'VERIFICATION_ADDRESS'
    ];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
    
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL);
    
    // Validate provider connection
    provider.getNetwork().then(network => {
      console.log('Connected to network:', network.name);
    }).catch(err => {
      console.error('Error connecting to network:', err);
    });
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Load contract ABIs
    let CarbonCreditABI, CarbonCreditMarketABI, VerificationABI;
    try {
      CarbonCreditABI = require('../../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json').abi;
      CarbonCreditMarketABI = require('../../../artifacts/contracts/CarbonCreditMarket.sol/CarbonCreditMarket.json').abi;
      VerificationABI = require('../../../artifacts/contracts/Verification.sol/Verification.json').abi;
    } catch (error) {
      console.error(`Error loading contract ABIs:`, error);
      
      // Fallback to empty ABIs if files can't be loaded
      CarbonCreditABI = [];
      CarbonCreditMarketABI = [];
      VerificationABI = [];
    }
    
    const carbonCreditContract = new ethers.Contract(
      process.env.CARBON_CREDIT_ADDRESS,
      CarbonCreditABI,
      wallet
    );
    
    const carbonMarketContract = new ethers.Contract(
      process.env.CARBON_CREDIT_ADDRESS,
      CarbonCreditMarketABI,
      wallet
    );
    
    const verificationContract = new ethers.Contract(
      process.env.VERIFICATION_ADDRESS,
      VerificationABI,
      wallet
    );
    
    return {
      provider,
      wallet,
      carbonCreditContract,
      carbonMarketContract,
      verificationContract
    };
  } catch (error) {
    console.error('Error initializing Web3:', error);
    throw error;
  }
};

const verifyContractAddresses = async () => {
  try {
    const { provider } = initializeWeb3();
    
    const carbonCodeExists = await provider.getCode(process.env.CARBON_CREDIT_ADDRESS);
    const verificationCodeExists = await provider.getCode(process.env.VERIFICATION_ADDRESS);
    
    console.log('\nContract Deployment Status:');
    console.log('---------------------------');
    console.log('Carbon Credit Contract:', carbonCodeExists !== '0x' ? 'Deployed' : 'Not Deployed');
    console.log('Verification Contract:', verificationCodeExists !== '0x' ? 'Deployed' : 'Not Deployed');
    
    return {
      carbonCreditDeployed: carbonCodeExists !== '0x',
      verificationDeployed: verificationCodeExists !== '0x'
    };
  } catch (error) {
    console.error('Error verifying contract addresses:', error);
    return {
      carbonCreditDeployed: false,
      verificationDeployed: false,
      error: error.message
    };
  }
};

module.exports = {
  initializeWeb3,
  verifyContractAddresses
};