// Since I broke out the Product to it's own class, It needs to be imported here to use it to build orders
// uses a destructuring assignment - only uses the exported Product 
const { Product } = require('./productManager');

// TODO: Refactoring 
// 1) - size is an issue. there is a difference between the prices for small, medium and large.
//   Also, this may not apply to other products - Size should be moved to the product class
// 2) - The current Order class does not lump orders in a logical way. example: Customer A, B and C may have multiple orders
//      Current Order class should be renamed OrderItem
//      Another class should be added called Order with properties like: id, date, cashierid, status, orderItems

// Order class
class Order {
  constructor(date, product, size, quantity) {
    this.date = date;
    this.product = product; // Product object
    this.size = size; // 'small', 'medium', 'large'
    this.quantity = quantity;
  }
}

const orders = [];

// returns the orders array
function getOrders() {  
  return orders;
}
// Add one Order to the orders array
function addOrder(date, product, size, quantity) {
  //TODO:  Need to deal with duplicates, but this is a much bigger issue and should be dealt with during a factoring pass

  const order = new Order(date, product, size, quantity);
  orders.push(order);
  return order;
}

// EXTRA Function - This was added for later use and not part of this assignment
function removeOrder(index) {
  if (index >= 0 && index < orders.length) {
    return orders.splice(index, 1)[0];
  }
  return null;
}

// Export
module.exports = { Order, getOrders, addOrder, removeOrder };