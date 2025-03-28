import { ethers } from 'ethers';
// Using require instead of import for JSON files to avoid TypeScript import errors
// @ts-ignore
const CarbonCreditABI = require('../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json');
// @ts-ignore
const CarbonCreditMarketABI = require('../../artifacts/contracts/CarbonCreditMarket.sol/CarbonCreditMarket.json');

// Type definitions for contract return types
interface CreditDetails {
  owner: string;
  amount: bigint;
  projectType: string;
  validUntil: bigint;
  metadataURI: string;
  isRetired: boolean;
}

// Contract addresses (would come from environment variables in production)
const CARBON_CREDIT_ADDRESS = '0x123...'; // Replace with actual address
const CARBON_CREDIT_MARKET_ADDRESS = '0x456...'; // Replace with actual address

// Initialize connection to the blockchain - Updated for ethers v6
const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a read-only provider if MetaMask isn't available
  return new ethers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY');
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
  return new ethers.Contract(CARBON_CREDIT_ADDRESS, CarbonCreditABI, connection);
};

const getCarbonMarketContract = async (needSigner = false) => {
  const connection = needSigner ? await getSigner() : getProvider();
  return new ethers.Contract(CARBON_CREDIT_MARKET_ADDRESS, CarbonCreditMarketABI, connection);
};

// Contract functions
export const fetchCreditDetails = async (tokenId: number): Promise<CreditDetails> => {
  try {
    const contract = await getCarbonCreditContract();
    const creditDetails = await contract.getCreditDetails(tokenId);
    return {
      owner: creditDetails.owner,
      amount: BigInt(creditDetails.amount),
      projectType: creditDetails.projectType,
      validUntil: BigInt(creditDetails.validUntil),
      metadataURI: creditDetails.metadataURI,
      isRetired: creditDetails.isRetired
    };
  } catch (error) {
    console.error("Error fetching credit details:", error);
    throw error;
  }
};

export const listCreditForSale = async (tokenId: number, priceInEther: string) => {
  try {
    const marketContract = await getCarbonMarketContract(true);
    const creditContract = await getCarbonCreditContract(true);
    
    // First approve the market contract to transfer the token
    const approveTx = await creditContract.approve(CARBON_CREDIT_MARKET_ADDRESS, tokenId);
    await approveTx.wait();
    
    // Then list the credit for sale
    const priceInWei = ethers.parseEther(priceInEther);
    const listingTx = await marketContract.listCredit(tokenId, priceInWei);
    const receipt = await listingTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error listing credit for sale:", error);
    throw error;
  }
};

export const buyCarbonCredit = async (tokenId: number, priceInEther: string) => {
  try {
    const marketContract = await getCarbonMarketContract(true);
    
    // Execute purchase
    const priceInWei = ethers.parseEther(priceInEther);
    const purchaseTx = await marketContract.buyCredit(tokenId, { value: priceInWei });
    const receipt = await purchaseTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error buying carbon credit:", error);
    throw error;
  }
};

export const retireCredit = async (tokenId: number) => {
  try {
    const creditContract = await getCarbonCreditContract(true);
    
    // Call the retire function
    const retireTx = await creditContract.retireCredit(tokenId);
    const receipt = await retireTx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error retiring carbon credit:", error);
    throw error;
  }
};

export const fetchActiveListings = async () => {
  try {
    // In a production app, you'd use events or The Graph to fetch listings
    // Here we'll simulate fetching active listings
    interface Listing {
      tokenId: number;
      seller: string;
      price: bigint;
      isActive: boolean;
    }
    
    const activeListings: Listing[] = [];
    
    // This is a placeholder - in a real app, you'd implement proper listing retrieval
    // using contract events or subgraphs with the marketContract
    
    return activeListings;
  } catch (error) {
    console.error("Error fetching active listings:", error);
    throw error;
  }
};

export default {
  fetchCreditDetails,
  listCreditForSale,
  buyCarbonCredit,
  retireCredit,
  fetchActiveListings
};