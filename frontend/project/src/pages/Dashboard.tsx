import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, Award, RefreshCw, ArrowDown, User, Wallet } from 'lucide-react';
import { useClerkAuth } from '../context/ClerkAuthContext';

// Define interfaces for better type safety
interface CreditItem {
  id: number;
  projectName: string;
  amount: number;
  purchaseDate: string;
  status: string;
  co2Offset: number;
}

interface TransactionItem {
  id: number;
  type: string;
  projectName: string;
  date: string;
  amount: number;
  value: number;
}

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
}

// Mock data for development - replace with API calls in production
const mockPortfolio: CreditItem[] = [
  {
    id: 1,
    projectName: "Amazon Rainforest Conservation",
    amount: 25,
    purchaseDate: "2025-02-15",
    status: "Active",
    co2Offset: 25
  },
  {
    id: 2,
    projectName: "Solar Farm Project",
    amount: 10,
    purchaseDate: "2025-01-20",
    status: "Active",
    co2Offset: 10
  },
  {
    id: 3,
    projectName: "Wind Power Initiative",
    amount: 15,
    purchaseDate: "2024-12-05",
    status: "Retired",
    co2Offset: 15
  }
];

const mockTransactions: TransactionItem[] = [
  {
    id: 101,
    type: "Purchase",
    projectName: "Amazon Rainforest Conservation",
    date: "2025-02-15",
    amount: 25,
    value: 312.50
  },
  {
    id: 102,
    type: "Purchase",
    projectName: "Solar Farm Project",
    date: "2025-01-20",
    amount: 10,
    value: 92.50
  },
  {
    id: 103,
    type: "Retirement",
    projectName: "Wind Power Initiative",
    date: "2025-03-01",
    amount: 15,
    value: 165.00
  }
];

// User Profile Section Component
const UserProfileSection = () => {
  const { user, isLoading } = useClerkAuth();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 flex items-center">
        <div className="animate-pulse flex space-x-4 w-full">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
          )}
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'TerraToken User'}
          </h2>
          <div className="mt-1 flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              {user?.email || 'No email provided'}
            </span>
            {user?.walletAddress && (
              <div className="flex items-center text-sm text-gray-500">
                <Wallet className="h-4 w-4 mr-1" />
                {`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <p>Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(mockPortfolio);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditItem | null>(null);
  const [retireAmount, setRetireAmount] = useState(1);

  // Calculate total impact
  const totalCredits = portfolio.reduce((sum, credit) => sum + credit.amount, 0);
  const totalOffset = portfolio.reduce((sum, credit) => sum + credit.co2Offset, 0);
  const activeCredits = portfolio.filter(credit => credit.status === 'Active');

  const openRetireModal = (credit: CreditItem) => {
    setSelectedCredit(credit);
    setRetireAmount(1);
    setIsRetireModalOpen(true);
  };

  const handleRetire = () => {
    // Here you would call your smart contract's retire function
    // For mock purposes, we'll update the local state
    setPortfolio(prevPortfolio => 
      prevPortfolio.map(credit => 
        credit.id === selectedCredit!.id 
          ? { ...credit, status: 'Retired', amount: credit.amount - retireAmount } 
          : credit
      )
    );
    
    setTransactions(prevTransactions => [
      {
        id: Date.now(),
        type: "Retirement",
        projectName: selectedCredit!.projectName,
        date: new Date().toISOString().split('T')[0],
        amount: retireAmount,
        value: 0 // Value doesn't apply to retirements
      },
      ...prevTransactions
    ]);
    
    setIsRetireModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <UserProfileSection />
      </div>
      
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Carbon Credits" 
          value={totalCredits} 
          unit="credits"
          icon={<Award className="h-8 w-8 text-green-500" />}
        />
        <StatCard 
          title="CO₂ Offset" 
          value={totalOffset} 
          unit="tonnes"
          icon={<BarChart2 className="h-8 w-8 text-green-500" />}
        />
        <StatCard 
          title="Active Credits" 
          value={activeCredits.length} 
          unit="projects"
          icon={<RefreshCw className="h-8 w-8 text-green-500" />}
        />
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'portfolio' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('portfolio')}
        >
          My Portfolio
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'transactions' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
      </div>
      
      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO₂ Offset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolio.map((credit) => (
                <tr key={credit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{credit.projectName}</div>
                    <div className="text-sm text-gray-500">Purchased: {credit.purchaseDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credit.amount} credits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credit.co2Offset} tonnes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      credit.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {credit.status === 'Active' && (
                      <button 
                        onClick={() => openRetireModal(credit)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <ArrowDown className="h-4 w-4 mr-1" /> Retire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.amount} credits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type === 'Purchase' ? `$${transaction.value.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Retire Modal */}
      {isRetireModalOpen && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Retire Carbon Credits</h3>
            <p className="text-gray-600 mb-4">
              Retiring credits permanently removes them from circulation and generates a certificate for your offset.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <div className="text-gray-900">{selectedCredit.projectName}</div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Retire</label>
              <input
                type="number"
                min="1"
                max={selectedCredit.amount}
                value={retireAmount}
                onChange={(e) => setRetireAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-sm text-gray-500 mt-1">You have {selectedCredit.amount} credits available</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRetireModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRetire}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Retire Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, unit, icon }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {value} <span className="text-gray-500 text-sm font-normal">{unit}</span>
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
};

export default Dashboard;