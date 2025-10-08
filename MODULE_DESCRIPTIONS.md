## Connection module
db/connection.js

The connection module handles all the connection needs for mongoDB and the mongoose ORM
- Handles graceful shutdowns from terminations and Ctl C actions
- pulls environment variables to set connection retries and delays between them


## ProductManager module
productManager.js
This module has functions to handle the crud operations for the Product entity
- getProducts
- addProduct
- updateProduct
- removeProduct


There are two additional functions that perform support needs.
- getProductByCode - This function does extactly what it says. It gets the Product by the productCode which is used for validation and managing orders
- initializeProducts - This adds a bunch of Products into the database if there are none present. it is run when the project server starts up


## orderManager module
orderManager.js
This module has functions to handle the crud operations for the Order entity
- getOrders
- addOrder
- updateOrder
- removeOrder

NOTE: Only a copy or "snapshot" of the product is added to the order when the order is created. This is so that when orders are complete and stored away, any changes to prices in the future will not inadvertantly change the values in orders from a timer period before any changes to products. or if an actual product was deleted.
TO do this, there is a mongoose schema added specifically to handle the "snapshot"

## Routing

**<span style="color:green">README for API usage</span>** [README](README.md)
- routes/order.js
- routes/products.js

I decided to break out products and order routing separately and each have almost identical API signatures.
- GET, POST, PUT, DELETE 
- almost all of the validation is performed in the routing, but down the road this should be moved to a behavior/buiness logic layer insead of clogging up the routes

## Testing
 Screenshots of the results of each of the orders API endpoints

- [POSTMAN Orders GET](POSTMAN_GET_Orders.png)
- [POSTMAN Orders POST](POSTMAN_POST_Orders.png)
- [POSTMAN Orders PUT](POSTMAN_PUT_Orders.png)
- [POSTMAN Orders DELETE](POSTMAN_DELETE_Orders.png)

Screenshots of the results of each of the products API endpoints

- [POSTMAN Products GET](POSTMAN_GET_Products.png)
- [POSTMAN Products POST](POSTMAN_POST_Products.png)
- [POSTMAN Products PUT](POSTMAN_PUT_Products.png)
-  [POSTMAN Products DELETE](POSTMAN_DELETE_Products.png)

Screenshot of Health Monitor endpoint:
- [POSTMAN Health GET](POSTMAN_GET_Health.png)
