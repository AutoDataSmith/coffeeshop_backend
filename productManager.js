const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['beverage', 'pantry', 'bakery', 'snacks', 'merch'] }
}, { timestamps: true });

// Product Model
const Product = mongoose.model('Product', productSchema);

// Initialize products if collection is empty
const initializeProducts = async () => {
  try {
    let count = await Product.countDocuments();
    if (count === 0) {
      const initialProducts = [
        { productCode: 'ESP01', name: 'Espresso', price: 4.99, category: 'beverage' },
        { productCode: 'LAT01', name: 'Latte', price: 5.29, category: 'beverage' },
        { productCode: 'REG01', name: 'Regular Coffee', price: 2.99, category: 'beverage' },
        { productCode: 'DBT01', name: 'Dillberry Tea', price: 2.99, category: 'beverage' },
        { productCode: 'TDC01', name: 'Titan Dark Coffee Beans', price: 7.99, category: 'pantry' },
        { productCode: 'TVC01', name: 'Titan Vanilla Creamer', price: 2.49, category: 'pantry' },
        { productCode: 'CRO01', name: 'Croissant', price: 2.49, category: 'bakery' },
        { productCode: 'BBM01', name: 'Blueberry Muffin', price: 3.29, category: 'bakery' },
        { productCode: 'TRM01', name: 'Trail Mix', price: 2.19, category: 'snacks' },
        { productCode: 'PTB01', name: 'Protein Bar', price: 1.99, category: 'snacks' },
        { productCode: 'MUG01', name: 'Titan Mug', price: 12.49, category: 'merch' },
        { productCode: 'TEE01', name: 'Titan T-Shirt', price: 19.99, category: 'merch' }
      ];
      
      count = await Product.insertMany(initialProducts); // returns insertedProducts.length
      console.log(`Initialized ${count} base products in MongoDB`);
    }
    else{
       console.log(` ${count} base products already present in MongoDB`);
    }
  } catch (error) {
    console.error('Error initializing base products:', error);
  }
};

// CRUD Functions
const getProducts = async () => {
  try {
    const productList =  await Product.find({}).sort({ category: 1, name: 1 });    
    return productList;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

const getProductByCode = async (productCode) => {
  try {
    return await Product.findOne({ productCode });
  } catch (error) {
    console.error('Error fetching product by code:', error);
    throw error;
  }
};
const getProductCount = async () => {
  try {
    return await Product.countDocuments();
  } catch (error) {
    console.error('Error fetching product count:', error);
    throw error;
  }
};

const addProduct = async (productCode, name, price, category) => {
  try {
    const product = new Product({ productCode, name, price, category });
    const savedProduct = await product.save();
    return savedProduct;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error(`Product code ${productCode} already exists`);
    }
    console.error('Error adding product:', error);
    throw error;
  }
};

const saveProduct = async (id, name, price, category) => {
  try {
    return await Product.findByIdAndUpdate(
      id,
      { name, price, category },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

const removeProduct = async (id) => {
  try {
    return await Product.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error removing product:', error);
    throw error;
  }
};

module.exports = {
  Product,
  getProducts,
  getProductByCode,
  getProductCount,
  addProduct,
  saveProduct,
  removeProduct,
  initializeProducts
};