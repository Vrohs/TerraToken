import { ethers } from 'ethers';

// Try to load contract ABIs and addresses from our preconfigured files
let CarbonCreditABI: any;
let CarbonCreditMarketABI: any;
let VerificationABI: any;
let contractAddresses: any = {};

// Function to load ABI files with error handling
const loadABIs = () => {
  try {
    // First, try to load from the local abi directory (created during deployment)
    try {
      CarbonCreditABI = require('../abi/CarbonCredit.json');
      CarbonCreditMarketABI = require('../abi/CarbonCreditMarket.json');
      VerificationABI = require('../abi/Verification.json');
      
      // Also try to load contract addresses
      contractAddresses = require('../abi/contract-addresses.json');
      console.log('Loaded contract ABIs and addresses from local abi directory');
    } catch (error) {
      console.warn('Failed to load from local abi directory, trying artifacts directory...');
      
      // Fall back to artifacts directory (from hardhat compilation)
      CarbonCreditABI = require('../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json');
      CarbonCreditMarketABI = require('../../artifacts/contracts/CarbonCreditMarket.sol/CarbonCreditMarket.json');
      VerificationABI = require('../../artifacts/contracts/Verification.sol/Verification.json');
      console.log('Loaded contract ABIs from artifacts directory');
    }
  } catch (error) {
    console.error('Failed to load contract ABIs:', error);
    // Provide minimal ABIs for demo functionality
    CarbonCreditABI = {
      abi: [
        "event CreditMinted(uint256 indexed tokenId, address indexed recipient, uint256 amount, uint8 projectType, uint256 validUntil, string metadataURI)",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
        "event CreditRetired(uint256 indexed tokenId, address indexed owner, uint256 amount, string retirementReason)",
        "function mintCredit(address to, uint256 amount, uint8 projectType, uint256 validUntil, string memory metadataURI) external returns (uint256)",
        "function retireCredit(uint256 tokenId, uint256 amount, string memory reason) external",
        "function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory data) external",
        "function getCreditDetails(uint256 tokenId) external view returns (address owner, uint256 amount, uint8 projectType, uint256 validUntil, string memory metadataURI, bool isRetired)"
      ]
    };
    CarbonCreditMarketABI = {
      abi: [
        "event CreditListed(uint256 indexed tokenId, address indexed owner, uint256 price, uint256 amount)",
        "event CreditSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price, uint256 amount)",
        "function listCredit(uint256 tokenId, uint256 amount, uint256 price) external",
        "function buyCredit(uint256 tokenId, uint256 amount) external payable",
        "function getListingDetails(uint256 tokenId) external view returns (address owner, uint256 amount, uint256 price, bool isActive)"
      ]
    };
    VerificationABI = {
      abi: [
        "function verifyProject(string memory ipfsHash, bool approved) external",
        "function isProjectVerified(string memory ipfsHash) external view returns (bool)"
      ]
    };
  }
};

// Load ABIs on module initialization
loadABIs();

// Type definitions for contract return types
export interface CreditDetails {
  owner: string;
  amount: bigint;
  projectType: number | string;
  validUntil: bigint;
  metadataURI: string;
  isRetired: boolean;
}

export interface ListingDetails {
  owner: string;
  amount: bigint;
  price: bigint;
  isActive: boolean;
}

// Contract addresses - prioritize addresses from configuration
const ADDRESSES = {
  CARBON_CREDIT: contractAddresses.carbonCredit || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CARBON_MARKET: contractAddresses.carbonCreditMarket || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  VERIFICATION: contractAddresses.verification || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
};

// Initialize connection to the blockchain - Updated for ethers v6
const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  // Check if we're in a development environment (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return new ethers.JsonRpcProvider('http://localhost:8545');
  }
  
  // Fallback to a read-only Sepolia provider
  return new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/T0qIBsLD5-rVNXm-gJ-dEF1J8ayyVQMM');
};

// Get signer for authenticated transactions - Updated for ethers v6
const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// Create contract instances
const getCarbonCreditContract = async (needSigner = false) => {
  const connection = needSigner ? await getSigner() : getProvider();
  return new ethers.Contract(ADDRESSES.CARBON_CREDIT, CarbonCreditABI.abi, connection);
};

const getCarbonMarketContract = async (needSigner = false) => {
  const connection = needSigner ? await getSigner() : getProvider();
  return new ethers.Contract(ADDRESSES.CARBON_MARKET, CarbonCreditMarketABI.abi, connection);
};

const getVerificationContract = async (needSigner = false) => {
  const connection = needSigner ? await getSigner() : getProvider();
  return new ethers.Contract(ADDRESSES.VERIFICATION, VerificationABI.abi, connection);
};

// Contract functions
export const fetchCreditDetails = async (tokenId: number): Promise<CreditDetails> => {
  try {
    const contract = await getCarbonCreditContract();
    const details = await contract.getCreditDetails(tokenId);
    
    // Map the returned details to our interface
    return {
      owner: details[0],
      amount: details[1],
      projectType: Number(details[2]),
      validUntil: details[3],
      metadataURI: details[4],
      isRetired: details[5]
    };
  } catch (error) {
    console.error('Error fetching credit details:', error);
    throw error;
  }
};

export const fetchListingDetails = async (tokenId: number): Promise<ListingDetails> => {
  try {
    const contract = await getCarbonMarketContract();
    const details = await contract.getListingDetails(tokenId);
    
    // Map the returned details to our interface
    return {
      owner: details[0],
      amount: details[1],
      price: details[2],
      isActive: details[3]
    };
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw error;
  }
};

export const mintCredit = async (
  to: string,
  amount: number,
  projectType: number,
  validUntil: number,
  metadataURI: string
): Promise<{ success: boolean; tokenId?: number; error?: string }> => {
  try {
    const contract = await getCarbonCreditContract(true);
    
    // Call the mint function
    const tx = await contract.mintCredit(
      to,
      amount,
      projectType,
      validUntil,
      metadataURI
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Find the CreditMinted event to get the tokenId
    const event = receipt.events?.find(e => e.event === 'CreditMinted');
    const tokenId = event?.args?.[0] || 0;
    
    return {
      success: true,
      tokenId: Number(tokenId)
    };
  } catch (error: any) {
    console.error('Error minting credit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const retireCredit = async (
  tokenId: number,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const contract = await getCarbonCreditContract(true);
    
    // Call the retire function
    const tx = await contract.retireCredit(tokenId, amount, reason);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error retiring credit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const listCredit = async (
  tokenId: number,
  amount: number,
  price: bigint
): Promise<{ success: boolean; error?: string }> => {
  try {
    const contract = await getCarbonMarketContract(true);
    
    // Call the list function
    const tx = await contract.listCredit(tokenId, amount, price);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error listing credit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const buyCredit = async (
  tokenId: number,
  amount: number,
  price: bigint
): Promise<{ success: boolean; error?: string }> => {
  try {
    const contract = await getCarbonMarketContract(true);
    
    // Call the buy function with the required Ether value
    const valueToSend = price * BigInt(amount);
    const tx = await contract.buyCredit(tokenId, amount, { value: valueToSend });
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error buying credit:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyProject = async (
  ipfsHash: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const contract = await getVerificationContract(true);
    
    // Call the verify function
    const tx = await contract.verifyProject(ipfsHash, approved);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error verifying project:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const isProjectVerified = async (ipfsHash: string): Promise<boolean> => {
  try {
    const contract = await getVerificationContract();
    return await contract.isProjectVerified(ipfsHash);
  } catch (error) {
    console.error('Error checking project verification:', error);
    return false;
  }
};

export default {
  fetchCreditDetails,
  fetchListingDetails,
  mintCredit,
  retireCredit,
  listCredit,
  buyCredit,
  verifyProject,
  isProjectVerified,
  ADDRESSES
};