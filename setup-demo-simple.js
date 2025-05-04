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
  cyan: '\x1b[36m'
};

// Welcome message
console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  ${colors.green}TerraToken Carbon Credit Demo - Simplified Setup${colors.cyan}  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
${colors.reset}`);

// Paths
const rootDir = path.resolve(__dirname);
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend', 'project');

// Function to run commands
function runCommand(command, cwd = rootDir, silent = false) {
  console.log(`${colors.blue}Running: ${colors.yellow}${command}${colors.reset}`);
  
  try {
    execSync(command, { 
      cwd, 
      stdio: silent ? 'pipe' : 'inherit',
      env: { ...process.env, FORCE_COLOR: true }
    });
    return true;
  } catch (error) {
    console.error(`${colors.red}Command failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main setup function
async function setupDemo() {
  console.log(`\n${colors.green}=== Setting Up TerraToken Demo ===${colors.reset}`);
  
  // 1. Check if hardhat is running
  console.log(`\n${colors.yellow}Step 1: Setting up Ethereum development node${colors.reset}`);
  
  // Create an RL interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const hardhatPrompt = () => {
    return new Promise((resolve) => {
      rl.question(`${colors.yellow}Do you want to start a Hardhat node? (Y/n): ${colors.reset}`, (answer) => {
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  };

  const startHardhat = await hardhatPrompt();
  
  if (startHardhat) {
    console.log(`${colors.green}Starting Hardhat node in a new terminal...${colors.reset}`);
    
    // For Windows
    if (process.platform === 'win32') {
      runCommand('start cmd.exe /k "npx hardhat node"');
    } 
    // For Mac/Linux
    else {
      runCommand('gnome-terminal -- bash -c "npx hardhat node; exec bash" || xterm -e "npx hardhat node" || open -a Terminal.app npx hardhat node');
    }
    
    // Give hardhat a moment to start
    console.log(`${colors.yellow}Waiting for Hardhat node to start...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    console.log(`${colors.yellow}Skipping Hardhat node startup. Make sure you have a node running at http://localhost:8545${colors.reset}`);
  }

  // 2. Compile and deploy contracts
  console.log(`\n${colors.yellow}Step 2: Compiling and deploying smart contracts${colors.reset}`);
  
  // Compile contracts
  console.log(`${colors.blue}Compiling smart contracts...${colors.reset}`);
  if (runCommand('npx hardhat compile')) {
    console.log(`${colors.green}✓ Smart contracts compiled successfully${colors.reset}`);
  } else {
    console.log(`${colors.red}× Failed to compile smart contracts${colors.reset}`);
    const continuePrompt = () => {
      return new Promise((resolve) => {
        rl.question(`${colors.yellow}Continue anyway? (y/N): ${colors.reset}`, (answer) => {
          resolve(answer.toLowerCase() === 'y');
        });
      });
    };
    
    if (!await continuePrompt()) {
      rl.close();
      return;
    }
  }
  
  // Deploy contracts
  console.log(`${colors.blue}Deploying smart contracts to local Hardhat node...${colors.reset}`);
  if (runCommand('npx hardhat run scripts/deploy.js --network localhost')) {
    console.log(`${colors.green}✓ Smart contracts deployed successfully${colors.reset}`);
  } else {
    console.log(`${colors.red}× Failed to deploy smart contracts${colors.reset}`);
    rl.close();
    return;
  }

  // 3. Set up demo data
  console.log(`\n${colors.yellow}Step 3: Setting up demo data${colors.reset}`);
  
  const demoDataPrompt = () => {
    return new Promise((resolve) => {
      rl.question(`${colors.yellow}Do you want to generate demo data? (Y/n): ${colors.reset}`, (answer) => {
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  };

  const generateDemoData = await demoDataPrompt();
  
  if (generateDemoData) {
    console.log(`${colors.blue}Generating demo data...${colors.reset}`);
    if (runCommand('node src/utils/demo-data.js', backendDir)) {
      console.log(`${colors.green}✓ Demo data generated successfully${colors.reset}`);
    } else {
      console.log(`${colors.red}× Failed to generate demo data${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping demo data generation${colors.reset}`);
  }

  // 4. Start the application
  console.log(`\n${colors.yellow}Step 4: Starting the application${colors.reset}`);
  
  const startAppPrompt = () => {
    return new Promise((resolve) => {
      rl.question(`${colors.yellow}Do you want to start the application? (Y/n): ${colors.reset}`, (answer) => {
        resolve(answer.toLowerCase() !== 'n');
      });
    });
  };

  const startApp = await startAppPrompt();
  
  if (startApp) {
    console.log(`${colors.green}Starting backend and frontend servers...${colors.reset}`);
    
    // For Windows
    if (process.platform === 'win32') {
      runCommand('start cmd.exe /k "cd backend && npm start"');
      runCommand('start cmd.exe /k "cd frontend/project && npm run dev"');
    } 
    // For Mac/Linux
    else {
      runCommand('gnome-terminal -- bash -c "cd backend && npm start; exec bash" || xterm -e "cd backend && npm start" || open -a Terminal.app "cd backend && npm start"');
      runCommand('gnome-terminal -- bash -c "cd frontend/project && npm run dev; exec bash" || xterm -e "cd frontend/project && npm run dev" || open -a Terminal.app "cd frontend/project && npm run dev"');
    }
    
    console.log(`
${colors.green}✓ TerraToken demo is now running!${colors.reset}

${colors.cyan}Backend:${colors.reset} http://localhost:5000
${colors.cyan}Frontend:${colors.reset} http://localhost:5173

${colors.cyan}Demo Accounts:${colors.reset}
- Project Developer: developer@terratoken.com / password123
- Verifier: verifier@terratoken.com / password123
- Trader: trader@terratoken.com / password123

${colors.cyan}You can connect MetaMask to the local Hardhat node:${colors.reset}
- Network Name: Hardhat Local
- RPC URL: http://localhost:8545
- Chain ID: 31337
- Currency Symbol: ETH
    `);
  } else {
    console.log(`
${colors.cyan}To start the application manually:${colors.reset}

${colors.yellow}1. Start the backend:${colors.reset}
   ${colors.blue}cd backend && npm start${colors.reset}

${colors.yellow}2. Start the frontend:${colors.reset}
   ${colors.blue}cd frontend/project && npm run dev${colors.reset}
    `);
  }
  
  rl.close();
}

// Run the setup function
setupDemo().catch(error => {
  console.error(`${colors.red}Setup failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
