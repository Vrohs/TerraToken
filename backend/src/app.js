require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

// Import services
const eventListenerService = require('./services/eventListenerService');

// Import routes
const authRoutes = require('./api/routes/auth');
const userRoutes = require('./api/routes/users');
const projectRoutes = require('./api/routes/projects');
const carbonCreditsRoutes = require('./api/routes/carbonCredits');
const verificationRoutes = require('./api/routes/verification');
const marketplaceRoutes = require('./api/routes/marketplace');
const ipfsRoutes = require('./api/routes/ipfs');
const analyticsRoutes = require('./api/routes/analytics');
const registryRoutes = require('./api/routes/registry');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_CLIENT_URL 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Request parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/carbon-credits', carbonCreditsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/registry', registryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message,
      status: err.status || 500
    }
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
    
    // Verify blockchain contracts
    try {
      const { verifyContractAddresses } = require('./utils/web3');
      const contractStatus = await verifyContractAddresses();
      logger.info('Contract verification completed', contractStatus);
    } catch (error) {
      logger.warn('Contract verification failed:', error.message);
    }
    
    // Start blockchain event listeners
    try {
      await eventListenerService.start();
      logger.info('Blockchain event listeners started');
      
      // Process historical events if enabled
      if (process.env.PROCESS_HISTORICAL_EVENTS === 'true') {
        const fromBlock = parseInt(process.env.HISTORICAL_FROM_BLOCK || '0');
        eventListenerService.processHistoricalEvents(fromBlock).catch(err => {
          logger.error('Failed to process historical events:', err);
        });
      }
    } catch (error) {
      logger.error('Failed to start event listeners:', error);
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down server...');
  
  // Stop event listeners
  try {
    await eventListenerService.stop();
    logger.info('Event listeners stopped');
  } catch (error) {
    logger.error('Error stopping event listeners:', error);
  }
  
  // Close database connection
  try {
    await mongoose.disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
  
  process.exit(0);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

module.exports = app;