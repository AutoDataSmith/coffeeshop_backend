
const express = require('express');
const router = express.Router();

// destructuring assignment: function references from productManager Module - only provide the functions that are needed for the assignment
const { 
  getProducts, 
  getProductByCode, 
  addProduct,  
  updateProduct,
  removeProduct
} = require('../productManager');


// GET /api/products - using async
router.get('/products', async (req, res, next) => {
  try {
    const products = await getProducts();  // must await the asyncronous call
    res.json(products);
  } catch (error) {
    next(error); // Pass to Express error handler
  }
});

// POST /api/products -  using async - RESTful Add -  Handles single or multiple product inserts
router.post('/products', async (req, res, next) => {
  try {
    // checks if the POST body is an array, if not, it wraps the body in an array
    const productsPOSTData = Array.isArray(req.body) ? req.body : [req.body];

    // initialize arrays to store results of each order as they are validated
    const invalidProducts = [];
    const savedProducts = [];   
   
    
      // Fill local variables with POST data 
    for (let i = 0; i < productsPOSTData.length; i++) {
      const { productCode, name, price, category } = productsPOSTData[i];     
   

      // Validate required fields
      if (typeof productCode === 'undefined' || typeof name === 'undefined' || 
          typeof price === 'undefined' || typeof category === 'undefined') {
        invalidProducts.push({ index: i, error: 'Missing required fields: productCode, name, price, category' });
        continue;
      }

      // Validate types and constraints
      if (typeof productCode !== 'string' || productCode.trim() === '') {
        invalidProducts.push({ index: i, error: 'productCode must be a non-empty string' });
        continue;
      }

      if (typeof name !== 'string' || name.trim() === '') {
        invalidProducts.push({ index: i, error: 'name must be a non-empty string' });
        continue;
      }

      if (typeof price !== 'number' || price <= 0 || !Number.isFinite(price)) {
        invalidProducts.push({ index: i, error: 'price must be a positive number' });
        continue;
      }

      if (typeof category !== 'string' || !['beverage', 'pantry', 'bakery', 'snacks', 'merch'].includes(category)) {
        invalidProducts.push({ index: i, error: 'category must be one of: beverage, pantry, bakery, snacks, merch' });
        continue;
      }

      // Attempt to save (will throw on duplicate code)
      try {
        const product = await addProduct(productCode, name, price, category);
        savedProducts.push(product);
      } catch (saveError) {
        invalidProducts.push({ index: i, error: saveError.message }); // e.g., "Product code ESP01 already exists"
      }      
    }

    // Respond based on validation results
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        message: 'Some products failed validation or creation',
        errors: invalidProducts,
        savedProducts
      });
    }

    // send RESTful response code 201 - Resource Created successfully
    res.status(201).json({       
      message: 'All products saved successfully',
      savedProducts
    });
    
  } catch (error) {
    next(error); // Pass to Express error handler
  }

});

// PUT /api/products/:productCode - Update product by code
router.put('/products/:productCode', async (req, res, next) => {
  try {
    const { productCode } = req.params; // Extract from URL parameter
    const { name, price, category } = req.body; // From request body
    
    if (!productCode || typeof productCode !== 'string') {
      return res.status(400).json({ error: 'Invalid productCode in URL' });
    }

    // Check if productCode Exists - if not, send 404
    const product = await getProductByCode(productCode);
    if (!product) {
      return res.status(404).json({ error: `Product with productCode ${productCode} not found` });   
    }

    // Validate body fields (basic check; full validation in manager)
    if (typeof name === 'undefined' || typeof price === 'undefined' || typeof category === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields: name, price, category' });
    }

    if (typeof name !== 'string' || name.trim() === '') { 
      return res.status(400).json({ error: 'name must be a non-empty string'});
    }

    if (typeof price !== 'number' || price <= 0 || !Number.isFinite(price)) {      
      return res.status(400).json({ error: 'price must be a positive number'});
    }

    if (typeof category !== 'string' || !['beverage', 'pantry', 'bakery', 'snacks', 'merch'].includes(category)) {   
      return res.status(400).json({ error: 'category must be one of: beverage, pantry, bakery, snacks, merch'});
    }

    const updatedProduct = await updateProduct(product._id, name, price, category);
    
    if (!updatedProduct) {
      throw new Error('Error removing product: No Product Object returned from Manager');
    }

    res.status(200).json({
      message: 'Product updated successfully',
      updatedProduct  // Include details for confirmation
    });

  } catch (error) {
   
    console.error('Update product error:', error.message);
    next(error); // Bubble to global handler (500)
  }
});

// DELETE /api/products/:productCode - Remove product by code
router.delete('/products/:productCode', async (req, res, next) => {
  try {
    const { productCode } = req.params; // Extract from URL param
    
    if (!productCode || typeof productCode !== 'string') {
      return res.status(400).json({ error: 'Invalid productCode provided' });
    }

     // Check if productCode Exists - if not, send 404
    const product = await getProductByCode(productCode);
    if (!product) {
      return res.status(404).json({ error: `Product with productCode ${productCode} not found` });   
    }

    const deletedProduct = await removeProduct(product._id);
    
    res.status(200).json({
      message: 'Product deleted successfully',
      deletedProduct  // Include details for confirmation
    });

  } catch (error) {
    // this checks if the manager threw an error becuase the Code was not found. "not found" is in the orginal thrown msg
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete product error:', error.message);
    next(error); // Bubble to global handler (500)
  }
});

module.exports = router;