const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

console.log('MongoDB URI from env:', process.env.MONGODB_URI);

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://inforohsgaming536:TGrGzTlQ5acnVS82@terratoken.smubt6y.mongodb.net/?retryWrites=true&w=majority&appName=TerraToken',
  jwtSecret: process.env.JWT_SECRET || 'terratoken_demo_jwt_secret_key_2024',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  
  // Blockchain config
  alchemyApiKey: process.env.ALCHEMY_API_KEY,
  alchemyRpcUrl: process.env.ALCHEMY_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  
  // Contract addresses
  carbonCreditAddress: process.env.CARBON_CREDIT_ADDRESS,
  verificationAddress: process.env.VERIFICATION_ADDRESS,
  carbonMarketAddress: process.env.CARBON_MARKET_ADDRESS,

  // IPFS Configuration
  ipfsMockEnabled: process.env.IPFS_MOCK_ENABLED === 'true',
  ipfsApiUrl: process.env.IPFS_API_URL,
  ipfsApiKey: process.env.IPFS_API_KEY,
  ipfsApiSecret: process.env.IPFS_API_SECRET,

  // External Registry Integration
  verraMockEnabled: process.env.VERRA_MOCK_ENABLED === 'true',
  verraApiUrl: process.env.VERRA_API_URL,
  verraApiKey: process.env.VERRA_API_KEY,

  goldStandardMockEnabled: process.env.GOLD_STANDARD_MOCK_ENABLED === 'true',
  goldStandardApiUrl: process.env.GOLD_STANDARD_API_URL,
  goldStandardApiKey: process.env.GOLD_STANDARD_API_KEY,
  goldStandardIntegrationEnabled: process.env.GOLD_STANDARD_INTEGRATION_ENABLED === 'true'
};

module.exports = { config };