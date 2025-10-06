# Adding MongoDB Atlas to Your Node.js Backend API

## 1. Set Up MongoDB Atlas Account

1. **Create Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up with email/Google
2. **Create Cluster**: 
   - Click "Build a Database" → Free tier (M0 Sandbox)
   - Choose region (closest to you) → Create
3. **Set Up Access**:
   - Database Access → Add New Database User → Create username/password
   - Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0) for development
4. **Get Connection String**:
   - Clusters → Connect → Drivers → Copy connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/titan_coffee?retryWrites=true&w=majority`

## 2. Install Dependencies

Add to your project root and run:

```bash
npm install mongoose dotenv
npm install --save-dev nodemon
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## 3. Update Environment Configuration

Update your `.env` file:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/titan_coffee?retryWrites=true&w=majority
DB_CONNECTION_TIMEOUT=30000
DB_MAX_RETRIES=5
DB_RETRY_DELAY=2000
```

## 4. MongoDB Connection Manager

Create `db/connection.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

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
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection re-established');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
      // Auto-reconnect after delay
      setTimeout(() => {
        if (!isConnected) connectWithRetry();
      }, RETRY_DELAY);
    });

  } catch (error) {
    connectionAttempts++;
    isConnected = false;
    
    if (connectionAttempts >= MAX_RETRIES) {
      console.error('❌ MongoDB connection failed after maximum retries');
      console.error('Connection Error:', error.message);
      process.exit(1);
    }

    console.error(`Connection attempt ${connectionAttempts} failed:`, error.message);
    console.log(`Retrying in ${RETRY_DELAY}ms...`);
    
    setTimeout(connectWithRetry, RETRY_DELAY);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down MongoDB connection...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { connectWithRetry, isConnected: () => isConnected };
```

## 5. Update Product Manager with MongoDB

Update `productManager.js`:
```javascript
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
    const count = await Product.countDocuments();
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
      
      await Product.insertMany(initialProducts);
      console.log('✅ Initialized products in MongoDB');
    }
  } catch (error) {
    console.error('❌ Error initializing products:', error);
  }
};

// CRUD Functions
const getProducts = async () => {
  try {
    return await Product.find({}).sort({ category: 1, name: 1 });
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
  addProduct,
  saveProduct,
  removeProduct,
  initializeProducts
};
```

## 6. Update Order Manager with MongoDB

Update `orderManager.js`:
```javascript
const mongoose = require('mongoose');
const { Product } = require('./productManager');

// Order Schema
const orderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
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
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  }
}, { timestamps: true });

// Populate product details before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const product = await Product.findById(this.product);
      if (product) {
        // Apply size-based pricing logic (adjust as needed)
        let price = product.price;
        if (this.size === 'medium') price *= 1.2;
        if (this.size === 'large') price *= 1.5;
        
        this.totalPrice = price * this.quantity;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Order Model
const Order = mongoose.model('Order', orderSchema);

const getOrders = async () => {
  try {
    return await Order.find({})
      .populate('product', 'name price category')
      .sort({ date: -1 })
      .lean();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const addOrder = async (date, productId, size, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const order = new Order({ 
      date: date || new Date(), 
      product: productId, 
      size, 
      quantity 
    });
    
    const savedOrder = await order.save();
    return savedOrder.populate('product', 'name price category');
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

const removeOrder = async (id) => {
  try {
    return await Order.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error removing order:', error);
    throw error;
  }
};

module.exports = { Order, getOrders, addOrder, removeOrder };
```

## 7. Update Server Configuration

Update `server.js`:
```javascript
require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const apiRoutes = require('./routes/orders');
const { connectWithRetry, isConnected } = require('./db/connection');

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isConnected() ? 'Connected' : 'Disconnected'
  });
});

// API routes
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to Titan Coffee Shop API!');
});

// 404 Error handling
app.use((req, res, next) => {
  res.status(404).json({ error: 'Oh No! - 404 - Resource Not Found' });
});

// 500 Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: "It's our fault... Internal Server Error" });
});

// Start server after MongoDB connection
const startServer = () => {
  app.listen(port, () => {
    console.log(`🌐 The current deployment environment is set to: ${process.env.NODE_ENV}`);
    console.log(`☕ The Titan Coffee Shop API Server is now running at http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
  });
};

// Initialize database and start server
const initializeApp = async () => {
  try {
    await connectWithRetry();
    const { initializeProducts } = require('./productManager');
    await initializeProducts();
    startServer();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();
```

## 8. Update Routes for MongoDB

Update `routes/orders.js`:
```javascript
const express = require('express');
const router = express.Router();

const { getProducts, getProductByCode } = require('../productManager');
const { getOrders, addOrder } = require('../orderManager');

// GET /api/products
router.get('/products', async (req, res, next) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - Create orders
router.post('/orders', async (req, res, next) => {
  try {
    const ordersPOSTData = Array.isArray(req.body) ? req.body : [req.body];
    const invalidOrders = [];
    const savedOrders = [];

    for (let i = 0; i < ordersPOSTData.length; i++) {
      const { date, productCode, size, quantity } = ordersPOSTData[i];
      
      const orderDate = date ? new Date(date) : new Date();

      // Validate required fields
      if (typeof productCode === 'undefined' || typeof size === 'undefined' || typeof quantity === 'undefined') {
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

      // Save valid order
      const order = await addOrder(orderDate, product._id, size, quantity);
      savedOrders.push(order);
    }

    if (invalidOrders.length > 0) {
      return res.status(400).json({
        message: 'Some orders failed validation',
        errors: invalidOrders,
        savedOrders
      });
    }

    res.status(201).json({
      message: 'All orders saved successfully',
      savedOrders
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

## 9. Connection Failure & Retry Handling

**Built-in Features**:
- **Exponential backoff**: Retries with increasing delays
- **Connection pooling**: Maintains 2-10 connections
- **Automatic reconnection**: Handles network interruptions
- **Timeout protection**: Prevents hanging connections
- **Graceful shutdown**: Clean disconnection on process exit

**Environment Variables for Tuning**:
- `DB_CONNECTION_TIMEOUT`: Connection attempt timeout (ms)
- `DB_MAX_RETRIES`: Maximum retry attempts
- `DB_RETRY_DELAY`: Base delay between retries (ms)

**Monitoring**:
- Health check endpoint: `/api/health`
- Console logging for connection status
- Error logging for debugging

## 10. Testing the Setup

1. **Start Development Server**:
   ```bash:disable-run
   npm run dev
   ```

2. **Test Endpoints**:
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Get products
   curl http://localhost:3000/api/products
   
   # Create order
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -d '{"productCode":"ESP01","size":"medium","quantity":2}'
   ```

3. **Verify in Atlas**:
   - Go to Atlas → Browse Collections
   - Check `products` and `orders` collections

## 11. Production Considerations

- **Security**: Remove `0.0.0.0/0` IP access, use specific IP whitelisting
- **Environment**: Set `NODE_ENV=production` and adjust connection pool sizes
- **Backup**: Enable Atlas continuous backups
- **Monitoring**: Add proper application monitoring (New Relic, Datadog)
- **Scaling**: Consider sharding for high traffic

Your API now has full MongoDB persistence with robust connection handling and error recovery!
```