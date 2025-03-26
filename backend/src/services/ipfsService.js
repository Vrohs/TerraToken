const { create } = require('ipfs-http-client');
const { Buffer } = require('buffer');

class IPFSService {
  constructor() {
    // Connect to IPFS (via Infura in this example)
    this.ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: `Basic ${Buffer.from(
          `${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_PROJECT_SECRET}`
        ).toString('base64')}`
      }
    });
  }

  // Upload file to IPFS
  async uploadFile(fileBuffer) {
    try {
      const result = await this.ipfs.add(fileBuffer);
      return result.path; // IPFS hash/CID
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  // Upload JSON to IPFS
  async uploadJSON(jsonData) {
    try {
      const jsonString = JSON.stringify(jsonData);
      const result = await this.ipfs.add(Buffer.from(jsonString));
      return result.path; // IPFS hash/CID
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  // Get file from IPFS
  async getFile(cid) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('IPFS download error:', error);
      throw new Error('Failed to retrieve file from IPFS');
    }
  }

  // Pin file to ensure it stays on IPFS
  async pinFile(cid) {
    try {
      await this.ipfs.pin.add(cid);
      return { success: true, cid };
    } catch (error) {
      console.error('IPFS pin error:', error);
      throw new Error('Failed to pin file on IPFS');
    }
  }
}

module.exports = new IPFSService();