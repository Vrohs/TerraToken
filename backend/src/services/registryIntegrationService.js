const axios = require('axios');

class RegistryIntegrationService {
  constructor() {
    this.registries = {
      verra: {
        baseUrl: process.env.VERRA_API_URL,
        apiKey: process.env.VERRA_API_KEY
      },
      goldStandard: {
        baseUrl: process.env.GOLD_STANDARD_API_URL,
        apiKey: process.env.GOLD_STANDARD_API_KEY
      }
    };
  }
  
  // Verify a project with an external registry
  async verifyProjectWithRegistry(projectId, registryName, registryProjectId) {
    try {
      if (!this.registries[registryName]) {
        throw new Error(`Registry "${registryName}" not supported`);
      }
      
      console.log(`Verifying project ${projectId} with ${registryName} registry (ID: ${registryProjectId})`);
      
      // In a real implementation, this would make an actual API call
      // For this demo, we'll simulate the verification process
      
      const registry = this.registries[registryName];
      
      // Simulated API call
      // In production, this would be a real API call to the registry
      const verificationResult = await this.simulateRegistryApiCall(
        registry,
        'verify',
        { 
          projectId: registryProjectId 
        }
      );
      
      return {
        verified: verificationResult.verified,
        registryDetails: verificationResult.details,
        verificationId: verificationResult.verificationId
      };
    } catch (error) {
      console.error(`Error verifying project with ${registryName}:`, error);
      throw error;
    }
  }
  
  // Fetch project details from external registry
  async getProjectFromRegistry(registryName, registryProjectId) {
    try {
      if (!this.registries[registryName]) {
        throw new Error(`Registry "${registryName}" not supported`);
      }
      
      console.log(`Fetching project details from ${registryName} registry (ID: ${registryProjectId})`);
      
      const registry = this.registries[registryName];
      
      // Simulated API call
      const projectDetails = await this.simulateRegistryApiCall(
        registry,
        'getProject',
        { 
          projectId: registryProjectId 
        }
      );
      
      return projectDetails;
    } catch (error) {
      console.error(`Error fetching project from ${registryName}:`, error);
      throw error;
    }
  }
  
  // Import a registry project directly to our platform
  async importProjectFromRegistry(registryName, registryProjectId, userId) {
    try {
      const projectDetails = await this.getProjectFromRegistry(
        registryName,
        registryProjectId
      );
      
      // In a real implementation, you would transform the registry data
      // into your own project model format and save it to your database
      
      // For now, we'll return the transformed data format
      return {
        projectName: projectDetails.name,
        projectType: this.mapProjectType(projectDetails.type, registryName),
        location: projectDetails.location,
        description: projectDetails.description,
        startDate: projectDetails.startDate,
        endDate: projectDetails.endDate,
        estimatedCredits: projectDetails.credits,
        methodology: projectDetails.methodology,
        owner: userId,
        contactName: projectDetails.contactName,
        contactEmail: projectDetails.contactEmail,
        status: 'Under Review', // Imported projects start under review
        externalRegistryId: registryProjectId,
        externalRegistry: registryName,
        externalVerificationId: projectDetails.verificationId
      };
    } catch (error) {
      console.error(`Error importing project from ${registryName}:`, error);
      throw error;
    }
  }
  
  // Search for projects in an external registry
  async searchRegistryProjects(registryName, searchParams) {
    try {
      if (!this.registries[registryName]) {
        throw new Error(`Registry "${registryName}" not supported`);
      }
      
      console.log(`Searching for projects in ${registryName} registry with params:`, searchParams);
      
      const registry = this.registries[registryName];
      
      // Simulated API call
      const searchResults = await this.simulateRegistryApiCall(
        registry,
        'search',
        searchParams
      );
      
      return searchResults.projects;
    } catch (error) {
      console.error(`Error searching projects in ${registryName}:`, error);
      throw error;
    }
  }
  
  // Get the current registry carbon credit status
  async getCreditStatus(registryName, registrySerialNumber) {
    try {
      if (!this.registries[registryName]) {
        throw new Error(`Registry "${registryName}" not supported`);
      }
      
      console.log(`Checking credit status in ${registryName} registry (Serial: ${registrySerialNumber})`);
      
      const registry = this.registries[registryName];
      
      // Simulated API call
      const creditStatus = await this.simulateRegistryApiCall(
        registry,
        'getCreditStatus',
        { 
          serialNumber: registrySerialNumber 
        }
      );
      
      return creditStatus;
    } catch (error) {
      console.error(`Error getting credit status from ${registryName}:`, error);
      throw error;
    }
  }
  
  // Report credit retirement to external registry
  async reportCreditRetirement(registryName, registrySerialNumber, amount, retirementBeneficiary) {
    try {
      if (!this.registries[registryName]) {
        throw new Error(`Registry "${registryName}" not supported`);
      }
      
      console.log(`Reporting credit retirement to ${registryName} registry (Serial: ${registrySerialNumber})`);
      
      const registry = this.registries[registryName];
      
      // Simulated API call
      const retirementResult = await this.simulateRegistryApiCall(
        registry,
        'retireCredits',
        { 
          serialNumber: registrySerialNumber,
          amount,
          beneficiary: retirementBeneficiary
        }
      );
      
      return {
        success: retirementResult.success,
        transactionId: retirementResult.transactionId,
        retirementDate: retirementResult.retirementDate,
        confirmationCode: retirementResult.confirmationCode
      };
    } catch (error) {
      console.error(`Error reporting retirement to ${registryName}:`, error);
      throw error;
    }
  }
  
  // Map project types between different registries and our platform
  mapProjectType(externalType, registryName) {
    // Registry-specific mappings
    const mappings = {
      verra: {
        'AFOLU - REDD': 'Forest Conservation',
        'AFOLU - ARR': 'Reforestation',
        'Energy - Renewable': 'Renewable Energy',
        'Energy - Efficiency': 'Energy Efficiency',
        'Waste Management': 'Methane Capture'
      },
      goldStandard: {
        'Afforestation/Reforestation': 'Reforestation',
        'Agriculture': 'Agricultural Management',
        'Renewable Energy': 'Renewable Energy',
        'Energy Efficiency': 'Energy Efficiency',
        'Waste Management': 'Methane Capture'
      }
    };
    
    if (mappings[registryName] && mappings[registryName][externalType]) {
      return mappings[registryName][externalType];
    }
    
    // Default fallback
    return 'Other';
  }
  
  // Simulate API calls to external registries (for demo purposes)
  // In a real implementation, this would be replaced with actual API calls
  async simulateRegistryApiCall(registry, endpoint, params) {
    // Sleep to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulated responses based on endpoint
    switch (endpoint) {
      case 'verify':
        return {
          verified: true,
          details: {
            verificationDate: new Date(),
            verifierName: 'Registry Verification Body',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            methodologyVersion: '1.2.3'
          },
          verificationId: `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
        
      case 'getProject':
        return {
          id: params.projectId,
          name: `${params.projectId.includes('RE') ? 'Renewable Energy' : 'Forest Conservation'} Project ${params.projectId}`,
          type: params.projectId.includes('RE') ? 'Energy - Renewable' : 'AFOLU - REDD',
          location: params.projectId.includes('BRA') ? 'Brazil, Amazon' : 'Kenya, Nairobi',
          description: `This is a sample project description for ${params.projectId}. In a real implementation, this would contain detailed information about the project.`,
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2028, 11, 31),
          credits: 5000,
          methodology: params.projectId.includes('RE') ? 'AMS-I.D.: Grid connected renewable electricity generation' : 'VM0007: REDD Methodology Framework',
          contactName: 'John Smith',
          contactEmail: 'john.smith@example.com',
          verificationId: `VER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
        
      case 'search':
        return {
          projects: [
            {
              id: 'RE-2023-001',
              name: 'Solar Energy Project',
              type: 'Energy - Renewable',
              location: 'India, Gujarat',
              credits: 3500,
              status: 'Verified'
            },
            {
              id: 'REDD-BRA-002',
              name: 'Amazon Forest Protection',
              type: 'AFOLU - REDD',
              location: 'Brazil, Amazon',
              credits: 12000,
              status: 'Verified'
            },
            {
              id: 'RE-2023-003',
              name: 'Wind Farm Development',
              type: 'Energy - Renewable',
              location: 'Scotland, UK',
              credits: 8000,
              status: 'Verified'
            }
          ]
        };
        
      case 'getCreditStatus':
        return {
          serialNumber: params.serialNumber,
          projectId: params.serialNumber.split('-')[0],
          issued: 10000,
          available: 7500,
          retired: 2500,
          transferred: 0,
          status: 'Active'
        };
        
      case 'retireCredits':
        return {
          success: true,
          transactionId: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          retirementDate: new Date(),
          confirmationCode: `RC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
        
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
  }
}

module.exports = new RegistryIntegrationService();