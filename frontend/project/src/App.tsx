// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Leaf, ArrowLeftRight, Shield, BarChart2, Globe2 } from 'lucide-react';
import { ClerkProvider } from '@clerk/clerk-react';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import ProjectSubmission from './pages/ProjectSubmission';
import Login from './pages/Login';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Contexts
import { Web3Provider } from './context/Web3Context';
import { ClerkAuthProvider } from './context/ClerkAuthContext';

function App() {
  // Get your Clerk publishable key from .env
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZXZvbHZlZC1vY3RvcHVzLTg4LmNsZXJrLmFjY291bnRzLmRldiQ';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ClerkAuthProvider>
        <Web3Provider>
          <Router>
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/submit-project" element={
                    <ProtectedRoute>
                      <ProjectSubmission />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </Web3Provider>
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}

export default App;