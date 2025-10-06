const mongoose = require('mongoose');
require('dotenv').config();  // needed to read variables from .env files

// gather variables from env setttings if possible - provide defaults 
const MONGODB_URI = process.env.MONGODB_URI;
const CONNECTION_TIMEOUT = parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000;
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES) || 5;
const RETRY_DELAY = parseInt(process.env.DB_RETRY_DELAY) || 2000;

let connectionAttempts = 0;
let isConnected = false;

const connectWithRetry = async () => {
  try {
    console.log(`Attempting MongoDB connection (${connectionAttempts + 1}/${MAX_RETRIES})...`);
    
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: CONNECTION_TIMEOUT,
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // bufferMaxEntries: 0,   This is deprecated in mongoose since version 5.x. This will throw a connection error if activated
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    connectionAttempts = 0;
    console.log('MongoDB connected successfully');
    
    // Handle the various connection events
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection re-established');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
      // Auto-reconnect after delay
      setTimeout(() => {
        if (!isConnected) connectWithRetry();
      }, RETRY_DELAY);
    });

  } catch (error) {   // failed to connect 
    connectionAttempts++;  //increment attempt count
    isConnected = false;  
    
    if (connectionAttempts >= MAX_RETRIES) {
      console.error('MongoDB connection failed after maximum retries');
      console.error('Connection Error:', error.message);
      process.exit(1);
    }

    console.error(`Connection attempt ${connectionAttempts} failed:`, error.message);
    console.log(`Retrying in ${RETRY_DELAY}ms...`);
    
    setTimeout(connectWithRetry, RETRY_DELAY); // recursive - try to connect after delay
  }
};

// Perform a graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down MongoDB connection...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

// Signal interupt listener for Ctrl +C - runs callback for shutdown
process.on('SIGINT', gracefulShutdown);

// Signal terminate listener - runs callback for shutdown
process.on('SIGTERM', gracefulShutdown);

module.exports = { connectWithRetry, isConnected: () => isConnected };