const express = require('express');
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")


const router = express.Router()


/** 
 * - POST /api/accounts
 * - Create a new account
 */

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/ 
 * - Get all accounts of the logged-in/authenticated user
 */

router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)


/**
 * GET /api/accounts/balance/:accountId
 * - Get current balance of an account by deriving from ledger entries
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)


module.exports = router 