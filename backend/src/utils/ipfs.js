const { create } = require('ipfs-http-client');
const logger = require('./logger');

// Connect to IPFS using Infura
const authorization = 'Basic ' + Buffer.from(
  process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
).toString('base64');

let ipfs;
try {
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization
    }
  });
} catch (error) {
  logger.error('IPFS client initialization error:', error);
}

// Upload file to IPFS
const uploadToIPFS = async (fileBuffer, options = {}) => {
  try {
    if (!ipfs) {
      throw new Error('IPFS client not initialized');
    }
    
    const result = await ipfs.add(fileBuffer, {
      pin: true,
      ...options
    });
    
    logger.info(`File uploaded to IPFS: ${result.path}`);
    return {
      cid: result.path,
      size: result.size,
      url: `https://ipfs.io/ipfs/${result.path}`
    };
  } catch (error) {
    logger.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

// Upload JSON metadata to IPFS
const uploadMetadataToIPFS = async (metadata) => {
  try {
    const metadataString = JSON.stringify(metadata);
    const metadataBuffer = Buffer.from(metadataString);
    
    return await uploadToIPFS(metadataBuffer);
  } catch (error) {
    logger.error('IPFS metadata upload error:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
  }
};

module.exports = {
  uploadToIPFS,
  uploadMetadataToIPFS
};