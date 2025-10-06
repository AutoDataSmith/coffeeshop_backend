require('dotenv').config();  // This will Load .env variables into process.env

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRoutes = require('./routes/orders'); 

// Middleware for JSON parsing
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Home - Root route
app.get('/', (req, res) => {
  res.send('Welcome to Titan Coffee Shop API!');
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

// Start server
app.listen(port, () => {
  console.log(process.env.NODE_ENV); // outputs the current environment to the console
  console.log(`The Titan Coffe Shop API Server is now running at http://localhost:${port}`);
});