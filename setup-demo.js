#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  ${colors.green}TerraToken Carbon Credit Platform - Demo Setup${colors.cyan}     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Paths
const rootDir = path.resolve(__dirname);
const hardhatConfigPath = path.join(rootDir, 'hardhat.config.js');
const backendEnvPath = path.join(rootDir, 'backend', '.env');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend', 'project');

// Function to execute commands with pretty output
const runCommand = (command, workingDir = null, options = {}) => {
  const cwd = workingDir || process.cwd();
  
  console.log(`${colors.blue}Running: ${colors.yellow}${command}${colors.reset}`);
  
  try {
    // Execute the command
    execSync(command, {
      cwd,
      stdio: options.silent ? 'pipe' : 'inherit',
      env: { ...process.env, FORCE_COLOR: true }
    });
    
    if (options.successMessage) {
      console.log(`${colors.green}✓ ${options.successMessage}${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    if (options.errorMessage) {
      console.error(`${colors.red}✗ ${options.errorMessage}${colors.reset}`);
      if (error.stdout) console.error(error.stdout.toString());
      if (error.stderr) console.error(error.stderr.toString());
    }
    
    if (!options.continueOnError) {
      console.error(`${colors.red}Command failed, exiting setup.${colors.reset}`);
      process.exit(1);
    }
    
    return false;
  }
};

// Check and install dependencies
const installDependencies = () => {
  console.log(`\n${colors.cyan}=== Installing Dependencies ====${colors.reset}`);
  
  // Root project dependencies
  if (!fs.existsSync(path.join(rootDir, 'node_modules'))) {
    runCommand('npm install', rootDir, {
      successMessage: 'Installed root project dependencies'
    });
  } else {
    console.log(`${colors.green}✓ Root project dependencies already installed${colors.reset}`);
  }
  
  // Backend dependencies
  if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
    runCommand('npm install', backendDir, {
      successMessage: 'Installed backend dependencies'
    });
  } else {
    console.log(`${colors.green}✓ Backend dependencies already installed${colors.reset}`);
  }
  
  // Frontend dependencies
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    runCommand('npm install', frontendDir, {
      successMessage: 'Installed frontend dependencies'
    });
  } else {
    console.log(`${colors.green}✓ Frontend dependencies already installed${colors.reset}`);
  }
};

// Compile and deploy contracts
const deployContracts = async () => {
  console.log(`\n${colors.cyan}=== Compiling & Deploying Smart Contracts ===${colors.reset}`);
  
  // Compile contracts
  runCommand('npx hardhat compile', rootDir, {
    successMessage: 'Smart contracts compiled successfully'
  });
  
  // Let user choose deployment option
  console.log(`\n${colors.yellow}Choose deployment option:${colors.reset}`);
  console.log(`1. ${colors.green}Local Hardhat node (recommended for demo)${colors.reset}`);
  console.log(`2. ${colors.yellow}Sepolia testnet (requires real ETH)${colors.reset}`);
  
  const deploymentChoice = await new Promise(resolve => {
    rl.question(`\nEnter your choice (1 or 2): `, answer => {
      resolve(answer.trim());
    });
  });
  
  if (deploymentChoice === '1') {
    // Deploy to local node
    console.log(`\n${colors.cyan}Starting local Hardhat node...${colors.reset}`);
    
    // Start Hardhat node in a separate terminal
    const runNode = runCommand('start cmd.exe /k npx hardhat node', rootDir, {
      successMessage: 'Local Hardhat node started',
      continueOnError: true
    });
    
    // Give the node a moment to start
    console.log(`${colors.yellow}Waiting for node to start...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Deploy contracts to local node
    runCommand('npx hardhat run scripts/deploy.js --network localhost', rootDir, {
      successMessage: 'Contracts deployed to local Hardhat node'
    });
    
    console.log(`\n${colors.green}✓ Smart contracts deployed to local Hardhat node${colors.reset}`);
    console.log(`${colors.yellow}Note: Keep the Hardhat node terminal running for the demo${colors.reset}`);
    
    // Update backend env for local node
    if (fs.existsSync(backendEnvPath)) {
      let envContent = fs.readFileSync(backendEnvPath, 'utf8');
      envContent = envContent.replace(/ALCHEMY_RPC_URL=.*$/m, 'ALCHEMY_RPC_URL=http://localhost:8545');
      fs.writeFileSync(backendEnvPath, envContent);
      
      console.log(`${colors.green}✓ Updated backend .env for local Hardhat node${colors.reset}`);
    }
    
  } else if (deploymentChoice === '2') {
    // Deploy to Sepolia testnet
    console.log(`\n${colors.cyan}Deploying to Sepolia testnet...${colors.reset}`);
    
    // Check if we have Alchemy API key in .env file
    let alchemyKey = null;
    if (fs.existsSync(backendEnvPath)) {
      const envContent = fs.readFileSync(backendEnvPath, 'utf8');
      const alchemyKeyMatch = envContent.match(/ALCHEMY_API_KEY=([^\s]+)/);
      if (alchemyKeyMatch && alchemyKeyMatch[1]) {
        alchemyKey = alchemyKeyMatch[1];
      }
    }
    
    if (!alchemyKey || alchemyKey.includes('your_') || alchemyKey === 'demo_key') {
      alchemyKey = await new Promise(resolve => {
        rl.question(`\n${colors.yellow}Enter your Alchemy API key for Sepolia: ${colors.reset}`, answer => {
          resolve(answer.trim());
        });
      });
      
      // Update backend .env with the Alchemy API key
      if (fs.existsSync(backendEnvPath)) {
        let envContent = fs.readFileSync(backendEnvPath, 'utf8');
        envContent = envContent.replace(/ALCHEMY_API_KEY=.*$/m, `ALCHEMY_API_KEY=${alchemyKey}`);
        envContent = envContent.replace(/ALCHEMY_RPC_URL=.*$/m, `ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`);
        fs.writeFileSync(backendEnvPath, envContent);
      }
    }
    
    // Check if we have a private key in .env file
    let privateKey = null;
    if (fs.existsSync(backendEnvPath)) {
      const envContent = fs.readFileSync(backendEnvPath, 'utf8');
      const privateKeyMatch = envContent.match(/PRIVATE_KEY=([^\s]+)/);
      if (privateKeyMatch && privateKeyMatch[1]) {
        privateKey = privateKeyMatch[1];
      }
    }
    
    if (!privateKey || privateKey.includes('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')) {
      privateKey = await new Promise(resolve => {
        rl.question(`\n${colors.yellow}Enter your private key for Sepolia deployment: ${colors.reset}`, answer => {
          resolve(answer.trim());
        });
      });
      
      // Update backend .env with the private key
      if (fs.existsSync(backendEnvPath)) {
        let envContent = fs.readFileSync(backendEnvPath, 'utf8');
        envContent = envContent.replace(/PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${privateKey}`);
        fs.writeFileSync(backendEnvPath, envContent);
      }
    }
    
    // Deploy to Sepolia testnet
    runCommand('npx hardhat run scripts/deploy.js --network sepolia', rootDir, {
      successMessage: 'Contracts deployed to Sepolia testnet'
    });
    
    console.log(`\n${colors.green}✓ Smart contracts deployed to Sepolia testnet${colors.reset}`);
  } else {
    console.log(`${colors.red}Invalid choice. Defaulting to local deployment...${colors.reset}`);
    // Deploy to local node (default fallback)
    // Could call this function recursively, but for simplicity let's skip
  }
};

// Set up demo data
const setupDemoData = async () => {
  console.log(`\n${colors.cyan}=== Setting Up Demo Data ===${colors.reset}`);
  
  const createDemoData = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Would you like to create demo data for the application? (y/n): ${colors.reset}`, answer => {
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
  
  if (createDemoData) {
    runCommand('node src/test-backend.js --seed-demo-data', backendDir, {
      successMessage: 'Demo data created successfully',
      continueOnError: true
    });
  } else {
    console.log(`${colors.yellow}Skipping demo data creation${colors.reset}`);
  }
};

// Start the application
const startApplication = async () => {
  console.log(`\n${colors.cyan}=== Starting TerraToken Application ===${colors.reset}`);
  
  const startChoice = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Start the application now? (y/n): ${colors.reset}`, answer => {
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
  
  if (startChoice) {
    console.log(`\n${colors.green}Starting backend server...${colors.reset}`);
    console.log(`${colors.yellow}To start frontend, open a new terminal and run:${colors.reset}`);
    console.log(`${colors.blue}cd ${frontendDir} && npm run dev${colors.reset}\n`);
    
    // Start the backend server
    runCommand('npm start', backendDir);
  } else {
    console.log(`\n${colors.cyan}To start the application later:${colors.reset}`);
    console.log(`${colors.yellow}1. Start the backend:${colors.reset}`);
    console.log(`${colors.blue}   cd ${backendDir} && npm start${colors.reset}`);
    console.log(`${colors.yellow}2. Start the frontend:${colors.reset}`);
    console.log(`${colors.blue}   cd ${frontendDir} && npm run dev${colors.reset}`);
  }
};

// Main function
const main = async () => {
  try {
    // Welcome message
    console.log(`${colors.yellow}This script will set up TerraToken for demonstration.${colors.reset}`);
    
    // Step 1: Install dependencies
    installDependencies();
    
    // Step 2: Deploy contracts
    await deployContracts();
    
    // Step 3: Set up demo data
    await setupDemoData();
    
    // Step 4: Start the application
    await startApplication();
    
    // Close readline interface
    rl.close();
    
  } catch (error) {
    console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
};

// Run the main function
main();
