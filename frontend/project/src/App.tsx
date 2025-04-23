import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import ProjectSubmission from './pages/ProjectSubmission';
import Login from './pages/Login';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <Router>
          <div className="flex flex-col min-h-screen dark:bg-dark-primary">
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
    </ThemeProvider>
  );
}

export default App;