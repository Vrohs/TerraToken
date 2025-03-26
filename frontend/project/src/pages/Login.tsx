import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to your authentication endpoint
      // For this demo, we'll simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, name: 'Demo User' }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskAvailable) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }
    
    setIsWalletConnecting(true);
    setError('');
    
    try {
      // Request accounts access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      
      // In a real app, you would now verify ownership of this wallet
      // by asking the user to sign a message, then verify the signature on your backend
      
      // For this demo, we'll simulate a successful wallet authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('authToken', 'mock-wallet-jwt-token');
      localStorage.setItem('user', JSON.stringify({ 
        walletAddress: address, 
        name: 'Wallet User'
      }));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 4001) {
        // User rejected the request
        setError('Please connect your wallet to continue.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
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
          
          {/* Email Login Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400"
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="text-green-600 hover:text-green-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="#" className="text-green-600 hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          )}
          
          {/* Wallet Connect */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Connect your wallet to sign in securely without a password
              </p>
              
              <button
                onClick={connectWallet}
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