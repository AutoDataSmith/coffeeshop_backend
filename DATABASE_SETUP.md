# Database Setup
The database for this project uses a hosted mongoDB Atlas
- To add a mongoDB database connection to this project, You will need to add a .env file to add in the proper variables
- There is a .env.example file that lists each of the variables needed
```
MONGODB_URI=
# this needs to be your connection string to your mongDB instance or hosted platform

DB_CONNECTION_TIMEOUT=30000
# this sets the maximum time in milliseconds that Mongoose will wait for the initial connection to the MongoDB server  to be established before throwing a timeout error

DB_MAX_RETRIES=5
# this tells the connection how many time to try to connect - will fail completely after this value

DB_RETRY_DELAY=2000
# this is the delay in milliseconds between each retry that makes an attempt to connect

```