import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeftRight, Shield, BarChart2, Globe2 } from 'lucide-react';

const Home = () => {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Leaf className="h-16 w-16 mx-auto text-green-500 mb-6" />
          <h1 className="text-5xl font-bold mb-6">Transparent Carbon Credit Trading</h1>
          <p className="text-xl mb-8 text-gray-600">
            Buy, sell, and retire carbon credits with complete transparency and trust,
            powered by blockchain technology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/marketplace" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Browse Marketplace
            </Link>
            <Link to="/submit-project" className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold transition">
              Register a Project
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Globe2 className="h-10 w-10 text-green-500" />}
            title="Create Carbon Credits"
            description="Project owners register their carbon reduction initiatives and receive verified credits."
          />
          <FeatureCard 
            icon={<ArrowLeftRight className="h-10 w-10 text-green-500" />}
            title="Trade Securely"
            description="Buy and sell carbon credits with transparent blockchain verification."
          />
          <FeatureCard 
            icon={<Shield className="h-10 w-10 text-green-500" />}
            title="Retire Credits"
            description="Permanently retire credits to offset your carbon footprint and receive certification."
          />
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Home;