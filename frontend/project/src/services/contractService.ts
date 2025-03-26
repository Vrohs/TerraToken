import { ethers } from 'ethers';
import CarbonCreditABI from '../contracts/CarbonCredit.json';
import CarbonCreditMarketABI from '../contracts/CarbonCreditMarket.json';

// Contract addresses (would come from environment variables in production)
const CARBON_CREDIT_ADDRESS = '0x123...'; // Replace with actual address
const CARBON_CREDIT_MARKET_ADDRESS = '0x456...'; // Replace with actual address

// Initialize connection to the blockchain
const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  // Fallback to a read-only provider if MetaMask isn't available
  return new ethers.providers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY');
};

// Get signer for authenticated transactions
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
export const fetchCreditDetails = async (tokenId) => {
  try {
    const contract = await getCarbonCreditContract();
    const creditDetails = await contract.getCreditDetails(tokenId);
    return {
      owner: creditDetails.owner,
      amount: parseInt(creditDetails.amount),
      projectType: creditDetails.projectType,
      validUntil: new Date(parseInt(creditDetails.validUntil) * 1000),
      metadataURI: creditDetails.metadataURI,
      isRetired: creditDetails.isRetired
    };
  } catch (error) {
    console.error("Error fetching credit details:", error);
    throw error;
  }
};

export const listCreditForSale = async (tokenId, priceInEther) => {
  try {
    const marketContract = await getCarbonMarketContract(true);
    const creditContract = await getCarbonCreditContract(true);
    
    // First approve the market contract to transfer the token
    const approveTx = await creditContract.approve(CARBON_CREDIT_MARKET_ADDRESS, tokenId);
    await approveTx.wait();
    
    // Then list the credit for sale
    const priceInWei = ethers.utils.parseEther(priceInEther.toString());
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

export const buyCarbonCredit = async (tokenId, priceInEther) => {
  try {
    const marketContract = await getCarbonMarketContract(true);
    
    // Execute purchase
    const priceInWei = ethers.utils.parseEther(priceInEther.toString());
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

export const retireCredit = async (tokenId) => {
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
    const marketContract = await getCarbonMarketContract();
    const creditContract = await getCarbonCreditContract();
    
    // In a production app, you'd use events or The Graph to fetch listings
    // Here we'll simulate fetching active listings
    const activeListings = [];
    
    // This is a placeholder - in a real app, you'd implement proper listing retrieval
    // using contract events or subgraphs
    
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