const { config } = require('../config');

// This is a mock IPFS service for demo purposes
// In a production environment, this would connect to a real IPFS node

const uploadToIPFS = async (data) => {
  if (!config.ipfsMockEnabled) {
    // Implementation for actual IPFS upload would go here
    throw new Error('Real IPFS integration not implemented');
  }

  // Create a mock IPFS hash
  const mockHash = `ipfs-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  console.log(`Mock IPFS upload successful: ${mockHash}`);
  
  return {
    success: true,
    hash: mockHash,
    url: `https://ipfs.io/ipfs/${mockHash}`
  };
};

const getFromIPFS = async (hash) => {
  if (!config.ipfsMockEnabled) {
    // Implementation for actual IPFS retrieval would go here
    throw new Error('Real IPFS integration not implemented');
  }

  // For demo, return mock data
  const mockData = {
    hash,
    name: `Carbon Credit ${hash.substring(5, 10)}`,
    description: 'This is a mock carbon credit NFT metadata',
    image: 'https://example.com/images/carbon-credit.png',
    attributes: [
      {
        trait_type: 'Project Type',
        value: ['Reforestation', 'Renewable Energy', 'Methane Capture'][Math.floor(Math.random() * 3)]
      },
      {
        trait_type: 'Vintage',
        value: `${2020 + Math.floor(Math.random() * 5)}`
      },
      {
        trait_type: 'Amount',
        value: `${1 + Math.floor(Math.random() * 100)} tCO2e`
      }
    ]
  };

  return {
    success: true,
    data: mockData
  };
};

// Generate metadata for carbon credit NFT
const generateCarbonCreditMetadata = (creditData, projectData) => {
  return {
    name: `${projectData.name} Carbon Credit`,
    description: projectData.description,
    image: 'https://example.com/images/carbon-credit.png', // Placeholder image
    external_url: `https://terratoken.example.com/credits/${creditData.serialNumber}`,
    attributes: [
      {
        trait_type: 'Project Type',
        value: projectData.projectType
      },
      {
        trait_type: 'Location',
        value: `${projectData.location.country}, ${projectData.location.region || ''}`
      },
      {
        trait_type: 'Vintage',
        value: new Date(creditData.vintage).getFullYear().toString()
      },
      {
        trait_type: 'Serial Number',
        value: creditData.serialNumber
      },
      {
        trait_type: 'Amount',
        value: `${creditData.amount} tCO2e`
      },
      {
        trait_type: 'Methodology',
        value: projectData.methodology
      }
    ],
    properties: {
      serialNumber: creditData.serialNumber,
      vintage: new Date(creditData.vintage).toISOString(),
      projectId: projectData._id.toString(),
      issuanceDate: new Date().toISOString(),
      status: creditData.status
    }
  };
};

module.exports = {
  uploadToIPFS,
  getFromIPFS,
  generateCarbonCreditMetadata
};
