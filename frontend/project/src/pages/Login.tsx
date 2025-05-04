import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, AlertCircle } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';
import { useClerkAuth } from '../context/ClerkAuthContext';
import { authAPI } from '../services/api';

// TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: () => void;
      isMetaMask?: boolean;
    }
  }
}

interface WalletError extends Error {
  code?: number;
}

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useClerkAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [error, setError] = useState('');

  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleWalletLogin = async () => {
    if (!isMetaMaskAvailable) {
      setError('Please install MetaMask to connect your wallet');
      return;
    }

    setIsWalletConnecting(true);
    setError('');

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available');
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        
        // For demo purposes, create a mock response instead of calling the backend
        // This ensures the demo works without requiring a complete backend setup
        const mockAuthData = {
          success: true,
          data: {
            id: '123',
            name: 'Demo Wallet User',
            email: `${walletAddress.substring(2, 8)}@example.com`,
            walletAddress: walletAddress,
            role: 'user',
          },
          token: `mock_jwt_token_${Date.now()}`
        };
        
        // Store the token in localStorage
        localStorage.setItem('token', mockAuthData.token);
        localStorage.setItem('user', JSON.stringify(mockAuthData.data));
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      const walletError = error as WalletError;
      if (walletError.code === 4001) {
        setError('You rejected the connection request');
      } else {
        setError('Failed to connect wallet: ' + walletError.message);
      }
      console.error('Wallet connection error:', error);
    } finally {
      setIsWalletConnecting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Sign in to TerraToken
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button 
              className={`flex-1 py-2 text-center font-medium border-b-2 transition ${
                activeTab === 'email' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('email')}
            >
              <span className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </span>
            </button>
            
            <button 
              className={`flex-1 py-2 text-center font-medium border-b-2 transition ${
                activeTab === 'wallet' 
                  ? 'border-green-600 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('wallet')}
            >
              <span className="flex items-center justify-center">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </span>
            </button>
          </div>
          
          {/* Clerk Sign In */}
          {activeTab === 'email' && (
            <div className="clerk-sign-in-container">
              <SignIn 
                routing="path" 
                path="/login" 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-green-600 hover:bg-green-700',
                    footerAction: 'text-green-600',
                    card: 'border-0 shadow-none',
                  }
                }}
                afterSignInUrl="/dashboard"
                signUpUrl="/login"
              />
            </div>
          )}
          
          {/* Wallet Connect */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Connect your wallet to sign in securely without a password
              </p>
              
              <button
                onClick={handleWalletLogin}
                disabled={isWalletConnecting}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                <Wallet className="h-5 w-5 mr-2" />
                {isWalletConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {!isMetaMaskAvailable && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">MetaMask not detected</p>
                  <a 
                    href="https://metamask.io/download.html" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline text-sm"
                  >
                    Install MetaMask
                  </a>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="text-center text-sm text-gray-600">
                  Don't have a wallet?{' '}
                  <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    Create one
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;