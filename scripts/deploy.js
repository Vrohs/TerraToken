  const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  // Deploy CarbonCredit
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy();
  await carbonCredit.waitForDeployment();
  const carbonCreditAddress = await carbonCredit.getAddress();
  console.log("CarbonCredit deployed to:", carbonCreditAddress);

  // Deploy CarbonCreditMarket
  const CarbonCreditMarket = await hre.ethers.getContractFactory("CarbonCreditMarket");
  const carbonCreditMarket = await CarbonCreditMarket.deploy(carbonCreditAddress);
  await carbonCreditMarket.waitForDeployment();
  const carbonCreditMarketAddress = await carbonCreditMarket.getAddress();
  console.log("CarbonCreditMarket deployed to:", carbonCreditMarketAddress);

  // Deploy Verification
  const Verification = await hre.ethers.getContractFactory("Verification");
  const verification = await Verification.deploy(carbonCreditAddress);
  await verification.waitForDeployment();
  const verificationAddress = await verification.getAddress();
  console.log("Verification deployed to:", verificationAddress);
  
  // Set up contract relationships if needed
  // Note: CarbonCredit is using Ownable pattern, not AccessControl with roles.
  // The Verification contract should have some way to call functions on CarbonCredit
  // For now, we'll transfer ownership of the CarbonCredit contract to the Verification contract
  await carbonCredit.transferOwnership(verificationAddress);
  console.log("Transferred ownership of CarbonCredit to Verification contract");
  
  // Update the .env file with contract addresses
  try {
    console.log("Updating contract addresses in environment files...");
    
    // Backend .env
    const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
    if (fs.existsSync(backendEnvPath)) {
      let envContent = fs.readFileSync(backendEnvPath, 'utf8');
      
      // Replace or add contract addresses
      envContent = envContent.replace(/CARBON_CREDIT_ADDRESS=.*$/m, `CARBON_CREDIT_ADDRESS=${carbonCreditAddress}`);
      envContent = envContent.replace(/VERIFICATION_ADDRESS=.*$/m, `VERIFICATION_ADDRESS=${verificationAddress}`);
      
      // Add CARBON_MARKET_ADDRESS if it doesn't exist
      if (!envContent.includes('CARBON_MARKET_ADDRESS=')) {
        envContent = envContent.replace(/VERIFICATION_ADDRESS=.*$/m, 
          `VERIFICATION_ADDRESS=${verificationAddress}\nCARBON_MARKET_ADDRESS=${carbonCreditMarketAddress}`);
      } else {
        envContent = envContent.replace(/CARBON_MARKET_ADDRESS=.*$/m, `CARBON_MARKET_ADDRESS=${carbonCreditMarketAddress}`);
      }
      
      fs.writeFileSync(backendEnvPath, envContent);
      console.log("Updated backend .env with contract addresses");
    }
    
    // Also copy ABIs to frontend if needed for demo UI
    const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
    const frontendAbiDir = path.join(__dirname, '..', 'frontend', 'project', 'src', 'abi');
    
    // Create the ABI directory if it doesn't exist
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
    }
    
    // Copy ABI files to frontend
    fs.copyFileSync(
      path.join(artifactsDir, 'CarbonCredit.sol', 'CarbonCredit.json'),
      path.join(frontendAbiDir, 'CarbonCredit.json')
    );
    
    fs.copyFileSync(
      path.join(artifactsDir, 'CarbonCreditMarket.sol', 'CarbonCreditMarket.json'),
      path.join(frontendAbiDir, 'CarbonCreditMarket.json')
    );
    
    fs.copyFileSync(
      path.join(artifactsDir, 'Verification.sol', 'Verification.json'),
      path.join(frontendAbiDir, 'Verification.json')
    );
    
    console.log("Copied contract ABIs to frontend");
    
    // Create a contract-addresses.json file in the frontend
    const contractAddresses = {
      carbonCredit: carbonCreditAddress,
      carbonCreditMarket: carbonCreditMarketAddress,
      verification: verificationAddress,
      network: hre.network.name
    };
    
    fs.writeFileSync(
      path.join(frontendAbiDir, 'contract-addresses.json'),
      JSON.stringify(contractAddresses, null, 2)
    );
    
    console.log("Created contract-addresses.json in frontend");
    
  } catch (error) {
    console.error("Error updating environment files:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });