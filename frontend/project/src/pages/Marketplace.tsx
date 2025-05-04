import { useState, useEffect } from 'react';
import { Search, Info, RefreshCw } from 'lucide-react';
import { marketplaceAPI } from '../services/api';

// Define TypeScript interface for carbon credit
interface CarbonCredit {
  id: number;
  projectName: string;
  projectType: string;
  location: string;
  creditsAvailable: number;
  pricePerCredit: number;
  totalCO2Offset: number;
  verifiedBy: string;
  imageUrl: string;
}

// Fallback image for when project images aren't available
const fallbackImages: {[key: string]: string} = {
  "Forest Conservation": "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "Renewable Energy": "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "Methane Capture": "https://images.unsplash.com/photo-1548337138-e87d889cc369?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "Energy Efficiency": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
  "default": "https://images.unsplash.com/photo-1552799446-159ba9523315?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
};

const Marketplace = () => {
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Fetch carbon credits from API
  useEffect(() => {
    fetchMarketplaceListings();
  }, []);

  const fetchMarketplaceListings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await marketplaceAPI.getListings();
      
      // Check if response has the expected structure
      if (!response?.data?.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from API');
      }
      
      // Transform backend data to match our interface
      const formattedCredits: CarbonCredit[] = response.data.data.map((item: any) => {
        const projectType = mapProjectType(item?.project?.projectType || 'default');
        return {
          id: item?.id || item?._id || Math.floor(Math.random() * 10000), // Ensure we have an ID
          projectName: item?.project?.name || 'Unnamed Project',
          projectType,
          location: (() => {
            const region = item?.project?.location?.region || '';
            const country = item?.project?.location?.country || '';
            if (region && country) return `${region}, ${country}`;
            if (region) return region;
            if (country) return country;
            return 'Unknown Location';
          })(),
          creditsAvailable: typeof item?.amount === 'number' ? item.amount : 0,
          pricePerCredit: typeof item?.price === 'number' ? item.price : 10.0,
          totalCO2Offset: typeof item?.amount === 'number' ? item.amount : 0,
          verifiedBy: item?.project?.validator?.name || 'Verified',
          imageUrl: item?.project?.imageUrl || (fallbackImages[projectType] ? fallbackImages[projectType] : fallbackImages.default)
        };
      });
      
      setCredits(formattedCredits);
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err);
      setError(`Failed to load marketplace listings. ${err?.message || ''} Using demo data instead.`);
      // Fallback to demo data if API fails
      setCredits([
        {
          id: 1,
          projectName: "Amazon Rainforest Conservation",
          projectType: "Forest Conservation",
          location: "Brazil",
          creditsAvailable: 500,
          pricePerCredit: 12.50,
          totalCO2Offset: 500,
          verifiedBy: "Gold Standard",
          imageUrl: fallbackImages["Forest Conservation"]
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
          imageUrl: fallbackImages["Renewable Energy"]
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
          imageUrl: fallbackImages["Renewable Energy"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to map backend project types to frontend display types
  const mapProjectType = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'reforestation': 'Forest Conservation',
      'avoided_deforestation': 'Forest Conservation',
      'renewable_energy': 'Renewable Energy',
      'energy_efficiency': 'Energy Efficiency',
      'methane_capture': 'Methane Capture',
      'default': 'Renewable Energy'
    };
    
    return typeMap[type] || typeMap.default;
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Carbon Credit Marketplace</h1>
        <button 
          onClick={fetchMarketplaceListings}
          className="flex items-center gap-2 text-green-600 hover:text-green-700"
          disabled={isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">No carbon credits found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredits.map((credit) => (
            <CreditCard key={credit.id} credit={credit} />
          ))}
        </div>
      )}
    </div>
  );
};

// Carbon Credit Card Component
const CreditCard = ({ credit }: { credit: CarbonCredit }) => {
  const handlePurchase = () => {
    // We'll implement this in future - could open a modal or navigate to purchase page
    console.log('Purchase initiated for:', credit.projectName);
    alert(`This would open the purchase flow for ${credit.projectName} (ID: ${credit.id})`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition">
      <div className="h-48 overflow-hidden">
        <img 
          src={credit.imageUrl} 
          alt={credit.projectName} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = fallbackImages.default;
          }}
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
        
        <button 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          onClick={handlePurchase}
        >
          Purchase Credits
        </button>
      </div>
    </div>
  );
};

export default Marketplace;