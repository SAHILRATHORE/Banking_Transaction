const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

const transactionRoutes = Router();

/**
 * - POST /api/transactions
 * - Create a new transaction
 */
transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transactions/system/initial-fund
 * - Create initial funds transaction from system usert
 */

transactionRoutes.post("/system/initial-fund", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundTransaction)

module.exports = transactionRoutes