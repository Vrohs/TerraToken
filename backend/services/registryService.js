const { config } = require('../config');

// This is a mock external registry service for demo purposes
// In a production environment, this would connect to actual registry APIs

// Mock Verra registry interaction
const verifyProjectWithVerra = async (projectData) => {
  if (!config.verraMockEnabled) {
    // Implementation for actual Verra API would go here
    throw new Error('Real Verra API integration not implemented');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo, always return success
  return {
    success: true,
    registryId: `VCS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    verificationDate: new Date().toISOString(),
    message: 'Project verification successful (mock data)'
  };
};

// Mock Gold Standard registry interaction
const verifyProjectWithGoldStandard = async (projectData) => {
  if (!config.goldStandardMockEnabled) {
    // Implementation for actual Gold Standard API would go here
    throw new Error('Real Gold Standard API integration not implemented');
  }
  
  // Check if Gold Standard integration is enabled
  if (!config.goldStandardIntegrationEnabled) {
    return {
      success: false,
      message: 'Gold Standard registry integration is disabled'
    };
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo, always return success
  return {
    success: true,
    registryId: `GS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    verificationDate: new Date().toISOString(),
    message: 'Project verification successful (mock data)'
  };
};

// Select the appropriate registry based on project type
const verifyProjectWithRegistry = async (projectData) => {
  // Simple logic for demo - in real world this would be more complex
  if (projectData.projectType === 'reforestation' || projectData.projectType === 'avoided_deforestation') {
    return await verifyProjectWithVerra(projectData);
  } else if (projectData.projectType === 'renewable_energy') {
    return await verifyProjectWithGoldStandard(projectData);
  } else {
    // Default to Verra for other project types
    return await verifyProjectWithVerra(projectData);
  }
};

// Check credit status in registry
const verifyCreditWithRegistry = async (creditData, registryId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo, always return success
  return {
    success: true,
    verified: true,
    status: 'active',
    lastVerified: new Date().toISOString(),
    message: 'Credit verification successful (mock data)'
  };
};

module.exports = {
  verifyProjectWithVerra,
  verifyProjectWithGoldStandard,
  verifyProjectWithRegistry,
  verifyCreditWithRegistry
};
