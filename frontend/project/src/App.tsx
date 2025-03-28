// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Leaf, ArrowLeftRight, Shield, BarChart2, Globe2 } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import ProjectSubmission from './pages/ProjectSubmission';
import Login from './pages/Login';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

// Context
import { Web3Provider } from './context/Web3Context';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-project" element={<ProjectSubmission />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;