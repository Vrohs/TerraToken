import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Submit Project', path: '/submit-project' },
  ];

  const connectWallet = async () => {
    // For development only - in production this would use Web3 to connect to MetaMask
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      setWalletAddress('0x21aB7d4CB1dc4D0b4c5A11A09feF461930cF1114');
      setIsWalletConnected(true);
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  return (
    <nav className="bg-white dark:bg-dark-primary shadow-sm border-b border-gray-200 dark:border-dark-accent">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-green-800 dark:text-terragreen-400">TerraToken</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-green-600 font-semibold dark:text-terragreen-400'
                    : 'text-gray-600 hover:text-green-600 dark:text-dark-text dark:hover:text-terragreen-400'
                } transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Dark Mode Toggle & Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-accent"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {isWalletConnected ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-3 dark:text-dark-text">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-600 hover:text-red-600 text-sm dark:text-dark-text dark:hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-accent"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-green-600 dark:text-dark-text dark:hover:text-terragreen-400"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-primary px-4 pt-2 pb-4 border-t dark:border-dark-accent">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-green-600 font-semibold dark:text-terragreen-400'
                    : 'text-gray-600 dark:text-dark-text'
                } py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t dark:border-dark-accent">
              {isWalletConnected ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-text">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-gray-600 hover:text-red-600 text-sm dark:text-dark-text dark:hover:text-red-400"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;