import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut } from 'lucide-react';
import { useClerkAuth } from '../../context/ClerkAuthContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useClerkAuth();

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
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-green-800">TerraToken</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-green-600'
                } transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Wallet Connection Button */}
          <div className="hidden md:block">
            {isWalletConnected ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-3">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-gray-600 hover:text-red-600 text-sm"
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
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-green-600"
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
        <div className="md:hidden bg-white px-4 pt-2 pb-4 border-t">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600'
                } py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <div className="py-2">
                  <div className="flex items-center mb-3">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-gray-200 mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <span className="text-lg font-semibold text-green-600">
                          {(user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {user?.firstName || user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-red-600 py-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;