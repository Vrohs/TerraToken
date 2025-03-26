export interface User {
  id: string;
  name: string;
  email?: string;
  walletAddress?: string;
  role: string;
}

export interface CarbonCredit {
  id: number;
  projectName: string;
  projectType: string;
  location: string;
  creditsAvailable: number;
  pricePerCredit: number;
  totalCO2Offset: number;
  verifiedBy: string;
  imageUrl: string;
}

export interface Project {
  id: string;
  projectName: string;
  projectType: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedCredits: number;
  methodology: string;
  status: 'Pending' | 'Under Review' | 'Verified' | 'Rejected';
  documents: {
    name: string;
    ipfsHash: string;
    uploadDate: string;
  }[];
}

export interface Transaction {
  id: string;
  type: 'Purchase' | 'Retirement' | 'Listing';
  projectName: string;
  date: string;
  amount: number;
  value: number;
}

// Add window.ethereum type
declare global {
  interface Window {
    ethereum: any;
  }
}