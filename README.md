# Quick Start Quide
The coffeeshop_backend API can be tested with the POSTMAN application.

## Deployment and Configuration
Set up a hosting account using Render

## The Products API

Test 1: GET https://coffeeshop-backend-4qlh.onrender.com/api/products
-  Returns the list of all products

Test 2: POST https://coffeeshop-backend-4qlh.onrender.com/api/products
- adds 1 or more products
- returns a list of saved and/or invaild products 

**Add 1 Product:** 

sample post data: - This should return a saved product
```json    
    { "productCode": "RSA01", "name": "Roasted Almonds", "price": 7.99, "category": "snacks" } 
```

**Add multiple Products:**

sample post data:  only index 1 is valid - index 0, 2, 3 should return a specific validation error
```json
[   
    { "productCode": "RSA01", "name": "Roasted Almonds", "price": 7.99, "category": "snacks" },
    { "productCode": "CCO01", "name": "Choc Chip Cookie", "price": 1.29, "category": "bakery" },
    { "productCode": "STI01", "name": "Titan Stickers", "price": 1.29, "category": "stuff" },
    { "productCode": "TCP01", "name": "Titan Cap", "price": 0, "categoryz": "merch" }
]
```

Test 3: DELETE https://coffeeshop-backend-4qlh.onrender.com/api/products/PRODUCTCODE

- Example: DELETE https://coffeeshop-backend-4qlh.onrender.com/api/products/TRM01
- must provide a product code in the url
- deletes 1 product with the given PRODUCTCODE
- returns the deleted product object


## The Orders API

Test 1: POST https://coffeeshop-backend-4qlh.onrender.com/api/orders
 - adds 1 or more orders
 - returns a list of saved and/or invaild orders 

**Add 1 Order:** 
sample post data: - This should return a saved order
```json    
    {"productCode":"TEE01","size":"large","quantity":2}
```

**Add multiple Orders:**
// sample post data: - Indexes 2,3, and 4 should fail validation bad quantity, Bad Code, and bad size
```json
[
    {"productCode":"DBT01","size":"small","quantity":1},
    {"productCode":"TRM01","size":"small","quantity":3},
    {"productCode":"LAT01","size":"small","quantity":0},   
    {"productCode":"xxz01","size":"small","quantity":1},
    {"productCode":"TEE01","size":"xxl","quantity":1}
]
```

Test 2: GET https://coffeeshop-backend-4qlh.onrender.com/api/orders
-  Returns the list of all orders

Test 3: DELETE https://coffeeshop-backend-4qlh.onrender.com/api/orders/
-  Returns the list of all orders

