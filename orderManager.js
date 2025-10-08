const mongoose = require('mongoose');
const { Product, getProductByCode } = require('./productManager');

// Embedded Product Snapshot Schema fron a selected productCode  
const productSnapshotSchema = new mongoose.Schema({
  productCode: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true }
}, { _id: false }); // No _id for embedded doc

// Order Schema
const orderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  product: { 
    type: productSnapshotSchema,  // This is the snapshot schema of a selected productCode  
    required: true 
  },
  size: { 
    type: String, 
    required: true, 
    enum: ['small', 'medium', 'large'] 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  }
}, { timestamps: true });  // the timestamps directive adds created and updated timestamps to the database

// Order Model
const Order = mongoose.model('Order', orderSchema);

const orders = [];

// returns all orders from database - using async
const getOrders = async () => {
  try {
    return await Order.find({})      
      .sort({ date: -1 })
      .lean(); // Raw objects for performance
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const addOrder = async (date, productCode, size, quantity) => {
  try {
    const product = await getProductByCode(productCode);
    if (!product) {
      throw new Error(`Product with productCode ${productCode} not found`);
    }

  // Create order with embedded snapshot
    const order = new Order({
      date: date || new Date(),
      product: {  // ← Embed snapshot of selected Product
        productCode: product.productCode,
        name: product.name,
        price: product.price,  // Locks in price at order time
        category: product.category
      },
      size,
      quantity
    });
    
    const savedOrder = await order.save();
    return savedOrder;

  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

// Updates an order by the mongoDB-assigned id (returns an updated object or null)
const updateOrder = async (id, size, quantity) => {
  try {
    return await Order.findByIdAndUpdate(
      id,
      {size, quantity },
      { new: true, runValidators: true }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// removes an order by the mongoDB-assigned id (returns a deleted object or null)
const removeOrder = async (id) => {
  try {
    return await Order.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error removing order:', error);
    throw error;
  }
};

module.exports = { Order, getOrders, addOrder, updateOrder, removeOrder };
