import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-primary border-t border-gray-200 dark:border-dark-accent pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-green-800 dark:text-terragreen-400">TerraToken</span>
            </Link>
            <p className="mt-4 text-gray-600 dark:text-dark-muted text-sm">
              Building a transparent carbon credit marketplace using blockchain technology.
            </p>
            <div className="mt-4 flex space-x-4">
              {/* <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text">
                <GitHub className="h-5 w-5" />
              </a> */}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/marketplace" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/submit-project" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Submit Project
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/Vrohs/TerraToken/tree/master" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Carbon Standards
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Verification Process
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-accent">
          <p className="text-center text-gray-500 dark:text-dark-muted text-sm">
            &copy; {new Date().getFullYear()} TerraToken. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;