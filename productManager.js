// Product class - I decided to break out Products from the orders class 
// I added a category property so that other types of product other than coffee can be available
class Product {
  constructor(productCode, name, price, category) {
    this.productCode = productCode; // This is the Unique identifier for a product
    this.name = name;
    this.price = price;
    this.category = category; // used to group products
  }
}

// Mock a few products - This should eventually be moved to a persistence layer  
const products = [
    new Product('ESP01', 'Espresso', 4.99, 'beverage'),
    new Product('LAT01', 'Latte', 5.29, 'beverage'),
    new Product('REG01','Regular Coffee', 2.99, 'beverage'),   
    new Product('DBT01','Dillberry Tea', 2.99, 'beverage'),
    new Product('TDC01','Titan Dark Coffee Beans', 7.99, 'pantry'),
    new Product('TVC01','Titan Vanilla Creamer', 2.49, 'pantry'),
    new Product('CRO01','Croissant', 2.49, 'bakery'),
    new Product('BBM01','Blueberry Muffin', 3.29, 'bakery'),
    new Product('TRM01','Trail Mix', 2.19, 'snacks'),
    new Product('PTB01','Protein Bar', 1.99, 'snacks'),
    new Product('MUG01','Titan Mug', 12.49, 'merch'),
    new Product('TEE01','Titan T-Shirt', 19.99, 'merch')
];

// Function - This one is required by the assignment 
function getProducts() {
  return products;
}

// function = to find product by productCode
// looks for productCode in the products array and returns it if foundn, else returns null
function getProductByCode(productCode) { 
  return products.find(product => product.productCode === productCode) || null;
}


function addProduct(productCode, name, price, category) {
  const product = new Product(productCode, name, price, category);
  products.push(product);
  return product;
}

function saveProduct(index, name, price, category) {
  if (index >= 0 && index < products.length) {
    products[index] = new Product(name, price, category);
    return products[index];
  }
  // bad index given, return null or maybe some other error - maybe throw an error
  return null;
}

function removeProduct(index) {
  if (index >= 0 && index < products.length) {
    return products.splice(index, 1)[0];
  }
  // bad index given, return null or maybe some other error - maybe throw an error
  return null;
}

// Export    
module.exports = { Product, getProducts, getProductByCode, addProduct, saveProduct, removeProduct };