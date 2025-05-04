const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { config } = require('./config');
const connectDB = require('./config/db');
const { seedMockData } = require('./utils/mockData');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const carbonCreditRoutes = require('./routes/carbonCreditRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Initialize mock data for demo
    if (config.nodeEnv === 'development') {
      seedMockData().catch(err => console.error('Error seeding mock data:', err));
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/carbon-credits', carbonCreditRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TerraToken API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

module.exports = app;
