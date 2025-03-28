import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeftRight, Shield, Globe2 } from 'lucide-react';

// Add interface for FeatureCard props
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Add interface for StatsCard props
interface StatsCardProps {
  value: string;
  label: string;
}

// Add interface for TestimonialCard props
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const Home = () => {
  return (
    <div>
      {/* Hero Section with Background Image */}
      <section className="relative py-36 text-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: "url('/assets/wallpaperflare.com_wallpaper.jpg')",
            backgroundAttachment: "fixed" 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black/50"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-green-500/20 backdrop-blur-sm p-3 rounded-full mb-6">
              <Leaf className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              <span className="text-green-400">Transparent</span> Carbon Credit Trading
            </h1>
            <p className="text-xl mb-10 text-gray-200 max-w-2xl mx-auto">
              Buy, sell, and retire carbon credits with complete transparency and trust,
              powered by blockchain technology.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/marketplace" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
                Browse Marketplace
              </Link>
              <Link to="/submit-project" className="bg-white text-green-800 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition shadow-lg">
                Register a Project
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L80,117.3C160,139,320,181,480,186.7C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatsCard value="1.2M+" label="Tons of CO₂ Offset" />
            <StatsCard value="500+" label="Verified Projects" />
            <StatsCard value="10K+" label="Active Users" />
            <StatsCard value="98%" label="Transparency Score" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold mb-3">How It Works</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionizing Carbon Credit Trading</h2>
            <p className="text-gray-600 text-lg">Our blockchain platform ensures transparency, security, and efficiency in the carbon credit marketplace.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Globe2 className="h-10 w-10 text-green-500" />}
              title="Create Carbon Credits"
              description="Project owners register their carbon reduction initiatives and receive verified credits through our rigorous certification process."
            />
            <FeatureCard 
              icon={<ArrowLeftRight className="h-10 w-10 text-green-500" />}
              title="Trade Securely"
              description="Buy and sell carbon credits with transparent blockchain verification, ensuring authenticity and preventing double-counting."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-green-500" />}
              title="Retire Credits"
              description="Permanently retire credits to offset your carbon footprint and receive certification of your contribution to climate action."
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold mb-3">Testimonials</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-gray-600 text-lg">Hear from organizations that have successfully used our platform to meet their sustainability goals.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="TerraToken has transformed how we manage and verify our carbon offset initiatives. The transparency is unmatched."
              author="Sarah Johnson"
              role="Sustainability Director, GreenTech Inc."
            />
            <TestimonialCard
              quote="The blockchain verification gives us confidence that our investments are making a real environmental impact."
              author="Michael Chen"
              role="CEO, EcoFuture Solutions"
            />
            <TestimonialCard
              quote="We've reduced our verification costs by 40% while increasing stakeholder trust in our sustainability reports."
              author="Elena Rodriguez"
              role="CSO, Global Logistics Partners"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join our growing community of environmentally conscious organizations and individuals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="bg-white text-green-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition shadow-lg">
              Create Free Account
            </Link>
            <Link to="/contact" className="bg-transparent hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition border border-white">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
      
      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Trusted by Organizations Worldwide</h2>
          </div>
          <div className="flex justify-center items-center flex-wrap gap-12 opacity-70">
            {/* Add partner logos here */}
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
      <div className="bg-green-100 p-3 rounded-lg inline-block mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ value, label }: StatsCardProps) => {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role }: TestimonialCardProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="text-green-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
          <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
        </svg>
      </div>
      <p className="text-gray-700 mb-6 italic">{quote}</p>
      <div className="font-semibold">{author}</div>
      <div className="text-gray-500 text-sm">{role}</div>
    </div>
  );
};

export default Home;