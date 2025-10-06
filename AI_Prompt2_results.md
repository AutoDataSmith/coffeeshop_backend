### Setting Up Environment Variables in Node.js

Environment variables (env vars) are a secure way to manage configuration like API keys, database URLs, or ports without hardcoding them. In Node.js, you access them via `process.env.VARIABLE_NAME`. For your student project deploying to Render, we'll cover local development and production setup.

#### 1. **Local Development Setup**
Use the `dotenv` package to load env vars from a `.env` file.

- **Install dotenv**:
  ```bash:disable-run
  npm install dotenv
  ```

- **Load it in your entry file** (e.g., `server.js` or `app.js`):
  ```javascript
  require('dotenv').config(); // At the very top, before any other code
  ```

- **Create a `.env` file** in your project root (don't commit this to Git!):
  ```
  PORT=3000
  DATABASE_URL=your_local_db_connection_string
  API_KEY=your_secret_key
  NODE_ENV=development
  ```

- **Access vars in your code**:
  ```javascript
  const port = process.env.PORT || 3000; // Fallback for undefined
  console.log(`Server running on port ${port}`);
  ```

- **Add to `.gitignore`** to avoid committing secrets:
  ```
  .env
  node_modules/
  ```

- **Share a template**: Create `.env.example` for teammates:
  ```
  PORT=3000
  DATABASE_URL=your_db_connection_string_here
  API_KEY=your_api_key_here
  NODE_ENV=development
  ```
  Instruct them to copy it to `.env` and fill in values.

#### 2. **Production Setup on Render**
Render handles env vars via their dashboard—no `.env` file needed in production. This keeps secrets out of your repo.

- **Deploy your app** (assuming you have a Git repo connected to Render):
  - Go to your Render dashboard > Create a new Web Service > Connect your repo.
  - Set the runtime to `Node`.
  - In **Build Command**: `npm install`
  - In **Start Command**: `node server.js` (or whatever starts your app).

- **Set env vars in Render**:
  - In your service settings > **Environment** tab.
  - Add key-value pairs, e.g.:
    | Key          | Value                          |
    |--------------|--------------------------------|
    | PORT        | 10000 (Render assigns this)   |
    | DATABASE_URL| postgres://... (your prod DB) |
    | API_KEY     | your_prod_secret              |
    | NODE_ENV    | production                    |
  - Render auto-sets `PORT`, but override if needed. Vars are encrypted and scoped to your service.

- **Test it**: After deploying, check logs in Render to confirm vars load (e.g., log `process.env.NODE_ENV`).

#### Tips for Your Student Project
- **Validation**: Use a lib like `joi` or `zod` to validate env vars on startup:
  ```javascript
  const requiredEnvVars = ['DATABASE_URL', 'API_KEY'];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`Missing env var: ${varName}`);
    }
  });
  ```
- **Security**: Never log sensitive vars. For databases, use Render's Postgres add-on and set its URL as an env var.
- **Debugging**: In dev, `console.log(process.env)` (but mask secrets). On Render, use their logs.
- **Common vars for Render**: Include `NODE_ENV=production` to switch behaviors (e.g., disable dev middleware).

This setup is lightweight and Render-friendly. If you hit issues (e.g., with a specific DB), share more details!
```