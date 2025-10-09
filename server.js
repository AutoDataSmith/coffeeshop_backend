require('dotenv').config();  // This will Load .env variables into process.env

const express = require('express');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const port = process.env.PORT || 3000;
const appName = process.env.APPNAME || 'Titan Coffee Shop API';

const apiOrderRoutes = require('./routes/orders'); 
const apiProductsRoutes = require('./routes/products'); 
const { connectWithRetry, isConnected } = require('./db/connection');

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'https://yourfrontend.com']
    }
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Set up Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Adds rate limit headers (e.g., X-RateLimit-Limit)
  legacyHeaders: false // Disable older X-RateLimit headers
});
app.use(limiter); // Apply to all routes

// Middleware for JSON parsing
app.use(express.json());

// API routes
app.use('/api', apiOrderRoutes);
app.use('/api', apiProductsRoutes);

// Home - Root route
app.get('/', (req, res) => {
  res.send(`Welcome to ${appName}!`);
});

// Health check api endpoint - NOTE: This could be added to the routes folder
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isConnected() ? 'Connected' : 'Disconnected'
  });
});

// badmath - route to generate a 500 Error - only for testng purposes
app.get('/badmath', (req, res) => {
  throw('tried to process some bad Math ');
});

// 404 Error handling
app.use((req, res, next) => {   
  res.status(404).json({ error: 'Oh No! - 404 - Resource Not Found' });
});

// 500 Error handling
app.use((err, req, res, next) => {

  // Log error to the server console
  console.error(err);

  // Return message as the response   
  res.status(500).json({ error: "It's our fault... Internal Server Error" });

});

// This is called in the initializeApp to actually start the server
const startServer = () => {
  app.listen(port, () => {

    // outputs the current environment deployment and server status to the console
    console.log(`The current deployment environment is set to: ${process.env.NODE_ENV}`); 
    console.log(`The ${appName} Server is now running at http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);

  });
};

// Initialize database and start server
const initializeApp = async () => {
  try {
    await connectWithRetry();  // This makes attempts to connect to the database

    // Explicitly verify connection state (defensive check)
    let connectionReady = isConnected();
    let readyAttempts = 0;
    const maxReadyChecks = 5; // Poll up to 5 times (1s total)
    
    // This loops to make sure there is a successful connection before proceeding on to other initialization steps that require a connection 
    while (!connectionReady && readyAttempts < maxReadyChecks) {
      console.log(`Waiting for full DB readiness... (attempt ${readyAttempts + 1}/${maxReadyChecks})`);
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      connectionReady = isConnected();
      readyAttempts++;
    }
    
    if (!connectionReady) {
      throw new Error('MongoDB connection not ready after verification attempts');
    }
    
    console.log('MongoDB connection verified - proceeding with initialization');

    const { initializeProducts } = require('./productManager');
    await initializeProducts(); // This makes sure there an initial products in the DB
    
    startServer();  

  } catch (error) {
    console.error(`Failed to initialize the ${appName} application:`, error);
    process.exit(1);
  }
};

// Start the backend API application
initializeApp();
