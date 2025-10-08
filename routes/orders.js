const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// destructuring assignment: function references from productManager Module - only provide the functions that are needed for the assignment
const {  getProductByCode } = require('../productManager');

// destructuring assignment: function references from orderManager Module - only provide the functions that are needed for the assignment
const { Order, getOrders, addOrder, updateOrder, removeOrder } = require('../orderManager');

// GET /api/orders- using async
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await getOrders(); // must await the asyncronous call
    res.json(orders);
  } catch (error) {
    next(error); // Pass to Express error handler
  }
});

// POST /api/orders -  using async - RESTful Add -  Handles single or multiple orders
router.post('/orders', async (req, res, next) => {
  try {
    // checks if the POST body is an array, if not, it wraps the body in an array
    const ordersPOSTData = Array.isArray(req.body) ? req.body : [req.body];

    // initialize arrays to store results of each order as they are validated
    const invalidOrders = [];
    const savedOrders = [];   
   
    
      // Fill local variables with POST data 
    for (let i = 0; i < ordersPOSTData.length; i++) {
      const { date, productCode, size, quantity } = ordersPOSTData[i];
      
      // Use current date if not provided
      const orderDate = date ? new Date(date) : new Date();

      // Validate required fields 
      // - NOTE BUG WAS FOUND a quantity of 0 triggers this error when using the conditions below
      // if (!productCode || !size || !quantity) {}
      
      // This is the fix - Thank you Grok!
      if (typeof productCode === 'undefined' || typeof size === 'undefined' || typeof quantity === 'undefined'){
        invalidOrders.push({ index: i, error: 'Missing required fields: productCode, size, quantity' });
        continue;
      }
      
      // Validate productCode
      const product = await getProductByCode(productCode);
      if (!product) {        
        invalidOrders.push({ index: i, error: `Invalid productCode: ${productCode} not found` });
        continue;
      }
      
      // Validate size
      if (!['small', 'medium', 'large'].includes(size)) {
        invalidOrders.push({ index: i, error: `Invalid size: ${size} must be small, medium, or large` });
        continue;
      }

      // Validate quantity 
      if (!Number.isInteger(quantity) || quantity <= 0) {
        invalidOrders.push({ index: i, error: `Invalid quantity: ${quantity} must be a positive integer greater than 0` });
        continue;
      }

      // Save valid order -  using aysync
      const order = await addOrder(orderDate, productCode, size, quantity);
      // Add valid order to the savedOrders status array
      savedOrders.push(order);
    }

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

// PUT /api/orders/:id - Update order by id
router.put('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params; // Extract from URL parameter
    const { size, quantity} = req.body; // From request body
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }    

    // Validate body fields 
    if (typeof size === 'undefined' || typeof quantity === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: size, quantity' });
    }

    // Validate size
    if (!['small', 'medium', 'large'].includes(size)) {
        return res.status(400).json({ error: `Invalid size: ${size} must be small, medium, or large`  });    
    }

    // Validate quantity 
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: `Invalid quantity: ${quantity} must be a positive integer greater than 0` });     
    }

    const updatedOrder = await updateOrder(id, size, quantity);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: `Order with ID ${id} not found` });
    }

    res.status(200).json({
      message: 'Order updated successfully',
      updatedOrder  // Include details for confirmation
    });

  } catch (error) {
   
    console.error('Update Order error:', error.message);
    next(error); // Pass to Express error handler
  }
});

// DELETE /api/orders/:id - Remove order by the id
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params; // Extract from URL param
   
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    
    const deletedOrder = await removeOrder(id);   

    if (!deletedOrder) {
      return res.status(404).json({ error: `Order with ID ${id} not found` });
    }

    res.status(200).json({
      message: 'Order deleted successfully',
      deletedOrder  // Include details for confirmation
    });

  } catch (error) {     
    console.error('Delete order error:', error.message);
    next(error); // Pass to Express error handler
  }
});


module.exports = router;