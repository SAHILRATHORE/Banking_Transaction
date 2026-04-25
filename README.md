# Banking Transaction System

A Node.js banking transaction system built with Express and MongoDB. This repository provides user authentication, account management, ledger-style transaction handling, and support for system-generated initial fund transactions.

## Key Features

- User registration and login with JWT authentication
- Protected account creation and account retrieval for authenticated users
- Account balance calculation via ledger entries
- Transaction creation for transfers between accounts
- System-only endpoint for initial funding transactions
- Token blacklist support for logout/revoked sessions

## API Endpoints

### Authentication
- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — authenticate a user and issue JWT
- `POST /api/auth/logout` — logout and blacklist token

### Accounts
- `POST /api/accounts` — create a new account (authenticated)
- `GET /api/accounts` — get all accounts for the authenticated user
- `GET /api/accounts/balance/:accountId` — get balance for an account

### Transactions
- `POST /api/transactions` — create a new transaction (authenticated)
- `POST /api/transactions/system/initial-fund` — create an initial fund transaction (system user only)

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Banking_Transaction_system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET_KEY=<your-jwt-secret>
   ```

## Running the App

- Start in development mode:
  ```bash
  npm run dev
  ```
- Start in production mode:
  ```bash
  npm start
  ```

The server runs on port `3000` by default.

## Project Structure

- `server.js` — application entrypoint
- `src/app.js` — Express app configuration and route mounting
- `src/config/db.js` — MongoDB connection logic
- `src/routes/` — API route definitions
- `src/controllers/` — request handlers
- `src/middleware/` — authentication middleware
- `src/models/` — Mongoose models for users, accounts, transactions, ledger entries, and token blacklist
- `src/services/` — supporting services such as email notifications

## Dependencies

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cookie-parser`
- `dotenv`
- `nodemailer`

## Notes

- Ensure MongoDB is available before starting the server.
- The `systemUser` role is required for the initial funds transaction endpoint.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Sahil Rathore**

- 🔗 GitHub: https://github.com/SAHILRATHORE
- 🔗 LinkedIn: https://www.linkedin.com/in/sahil-rathore-641119245/

## 🙌 Acknowledgements

This project was built as part of learning and implementing real-world banking transaction workflows including authentication, ledger systems, and secure API design.


⭐ If you find this project useful, consider giving it a star on GitHub!