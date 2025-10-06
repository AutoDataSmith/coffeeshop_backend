
const express = require('express');
const router = express.Router();

// destructuring assignment: function references from productManager Module - only provide the functions that are needed for the assignment
const { getProducts, getProductByCode } = require('../productManager');

// destructuring assignment: function references from orderManager Module - only provide the functions that are needed for the assignment
const { getOrders, addOrder, Order } = require('../orderManager');

// GET /api/products - using async
router.get('/products', async (req, res, next) => {
  try {
    const products = await getProducts();  // must await the asyncronous call
    res.json(products);
  } catch (error) {
    next(error); // Pass to Express error handler
  }
});

// GET /api/orders
router.get('/orders', (req, res, next) => {
  try {
    const orders = getOrders();
    res.json(orders);
  } catch (error) {
    next(error); // Pass to Express error handler
  }
});

// POST /api/orders - RESTful Add -  Handles single or multiple orders
router.post('/orders', (req, res, next) => {
  try {
    // checks if the POST body is an array, if not, it wraps the body in an array
    const ordersPOSTData = Array.isArray(req.body) ? req.body : [req.body];

    // initialize arrays to store results of each order as they are validated
    const invalidOrders = [];
    const savedOrders = [];

    ordersPOSTData.forEach((orderPOSTData, index) => {
      const { date, productCode, size, quantity } = orderPOSTData;
      
      // Use current date if not provided
      const orderDate = date ? new Date(date) : new Date();

      // Validate required fields 
      // - NOTE BUG WAS FOUND a quantity of 0 triggers this error when using the conditions below
      // if (!productCode || !size || !quantity) {}
      
      // This is the fix - Thank you Grok!
      if (typeof productCode === 'undefined' || typeof size === 'undefined' || typeof quantity === 'undefined'){
        invalidOrders.push({ index, error: 'Missing required fields: productCode, size, quantity' });
        return;
      }
      
      // Validate productCode
      const product = getProductByCode(productCode);
      if (!product) {
        invalidOrders.push({ index, error: `Invalid productCode: ${productCode} not found` });
        return;
      }
      
      // Validate size
      if (!['small', 'medium', 'large'].includes(size)) {
        invalidOrders.push({ index, error: `Invalid size: ${size} must be small, medium, or large` });
        return;
      }

      // Validate quantity 
      if (!Number.isInteger(quantity) || quantity <= 0) {
        invalidOrders.push({ index, error: `Invalid quantity: ${quantity} must be a positive integer greater than 0` });
        return;
      }

      // Save valid order
      const order = addOrder(orderDate, product, size, quantity);
      // Add valid order to the savedOrders status array
      savedOrders.push(order);
    });

    // Respond based on validation results
    if (invalidOrders.length > 0) {
      return res.status(400).json({
        message: 'Some orders failed validation',
        errors: invalidOrders,
        savedOrders
      });
    }

    // send RESTful response code 201 - Resource Created successfully
    res.status(201).json({       
      message: 'All orders saved successfully',
      savedOrders
    });
    
  } catch (error) {
    next(error); // Pass to Express error handler
  }

});

module.exports = router;