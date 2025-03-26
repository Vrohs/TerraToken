import React, { useState, useEffect } from 'react';
import { Search, Filter, Info } from 'lucide-react';

// Mock data for development - you'll replace this with API calls
const mockCarbonCredits = [
  {
    id: 1,
    projectName: "Amazon Rainforest Conservation",
    projectType: "Forest Conservation",
    location: "Brazil",
    creditsAvailable: 500,
    pricePerCredit: 12.50,
    totalCO2Offset: 500,
    verifiedBy: "Gold Standard",
    imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 2,
    projectName: "Solar Farm Project",
    projectType: "Renewable Energy",
    location: "Nevada, USA",
    creditsAvailable: 750,
    pricePerCredit: 9.25,
    totalCO2Offset: 750,
    verifiedBy: "Verra",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 3,
    projectName: "Wind Power Initiative",
    projectType: "Renewable Energy",
    location: "Scotland, UK",
    creditsAvailable: 325,
    pricePerCredit: 11.00,
    totalCO2Offset: 325,
    verifiedBy: "Carbon Trust",
    imageUrl: "https://images.unsplash.com/photo-1548337138-e87d889cc369?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  }
];

const Marketplace = () => {
  const [credits, setCredits] = useState(mockCarbonCredits);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const projectTypes = ['All', 'Forest Conservation', 'Renewable Energy', 'Methane Capture', 'Energy Efficiency'];

  // Filter credits based on search and type
  const filteredCredits = credits.filter((credit) => {
    return (
      credit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedType === 'All' || credit.projectType === selectedType)
    );
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Carbon Credit Marketplace</h1>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg w-full"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Carbon Credits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredits.map((credit) => (
          <CreditCard key={credit.id} credit={credit} />
        ))}
      </div>
    </div>
  );
};

// Carbon Credit Card Component
const CreditCard = ({ credit }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition">
      <div className="h-48 overflow-hidden">
        <img 
          src={credit.imageUrl} 
          alt={credit.projectName} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{credit.projectName}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {credit.projectType}
          </span>
        </div>
        <p className="text-gray-600 mb-4">Location: {credit.location}</p>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div>
            <p>Available</p>
            <p className="font-semibold text-gray-800">{credit.creditsAvailable} credits</p>
          </div>
          <div>
            <p>Price per credit</p>
            <p className="font-semibold text-gray-800">${credit.pricePerCredit.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <Info className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-xs text-gray-500">Verified by {credit.verifiedBy}</span>
        </div>
        
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
          Purchase Credits
        </button>
      </div>
    </div>
  );
};

export default Marketplace;