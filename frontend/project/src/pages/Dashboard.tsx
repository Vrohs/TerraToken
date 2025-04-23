import React, { useState, useEffect } from 'react';
import { BarChart2, Clock, Award, RefreshCw, ArrowDown } from 'lucide-react';

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

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(mockPortfolio);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditItem | null>(null);
  const [retireAmount, setRetireAmount] = useState(1);
  const [isWalletConnected, setIsWalletConnected] = useState(true);

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

  if (!isWalletConnected) {
    return (
      <div className="container mx-auto px-4 py-12 text-center dark:bg-dark-primary min-h-screen">
        <div className="max-w-lg mx-auto bg-white dark:bg-dark-secondary p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 dark:text-dark-text">Connect Wallet to View Dashboard</h2>
          <p className="text-gray-600 dark:text-dark-muted mb-6">Please connect your wallet to access your carbon credit portfolio and transaction history.</p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 dark:bg-dark-primary min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-dark-text">My Dashboard</h1>
      
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
      <div className="flex border-b border-gray-200 dark:border-dark-accent mb-6">
        <button
          className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'portfolio' ? 'text-green-600 dark:text-terragreen-400 border-green-600 dark:border-terragreen-400' : 'text-gray-600 dark:text-dark-muted border-transparent'}`}
          onClick={() => setActiveTab('portfolio')}
        >
          My Portfolio
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'transactions' ? 'text-green-600 dark:text-terragreen-400 border-green-600 dark:border-terragreen-400' : 'text-gray-600 dark:text-dark-muted border-transparent'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
      </div>
      
      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-accent">
            <thead className="bg-gray-50 dark:bg-dark-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">CO₂ Offset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-accent">
              {portfolio.map((credit) => (
                <tr key={credit.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-text">{credit.projectName}</div>
                    <div className="text-sm text-gray-500 dark:text-dark-muted">Purchased: {credit.purchaseDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
                    {credit.amount} credits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
                    {credit.co2Offset} tonnes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      credit.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-terragreen-900/30 dark:text-terragreen-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-dark-accent dark:text-dark-muted'
                    }`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {credit.status === 'Active' && (
                      <button 
                        onClick={() => openRetireModal(credit)}
                        className="text-green-600 dark:text-terragreen-400 hover:text-green-900 dark:hover:text-terragreen-300 flex items-center"
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
        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-accent">
            <thead className="bg-gray-50 dark:bg-dark-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-accent">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'Purchase' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-green-100 text-green-800 dark:bg-terragreen-900/30 dark:text-terragreen-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                    {transaction.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
                    {transaction.amount} credits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-muted">
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
          <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 dark:text-dark-text">Retire Carbon Credits</h3>
            <p className="text-gray-600 dark:text-dark-muted mb-4">
              Retiring credits permanently removes them from circulation and generates a certificate for your offset.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">Project</label>
              <div className="text-gray-900 dark:text-dark-text">{selectedCredit.projectName}</div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">Amount to Retire</label>
              <input
                type="number"
                min="1"
                max={selectedCredit.amount}
                value={retireAmount}
                onChange={(e) => setRetireAmount(Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-dark-accent rounded-md px-3 py-2 dark:bg-dark-primary dark:text-dark-text"
              />
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">You have {selectedCredit.amount} credits available</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRetireModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-accent rounded-md text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-accent"
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
    <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 dark:text-dark-muted text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1 dark:text-dark-text">
            {value} <span className="text-gray-500 dark:text-dark-muted text-sm font-normal">{unit}</span>
          </p>
        </div>
        <div className="dark:text-terragreen-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;