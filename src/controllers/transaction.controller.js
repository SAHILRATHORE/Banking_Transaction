const transactionModel = require("../models/transaction.model")
const legderModel = require("../models/ledger.model")
const emailService = require("../services/email.service")
const accountModel = require('../models/account.model')
const mongoose = require("mongoose")
const ledgerModel = require("../models/ledger.model")

/**
 * * - Create a new transaction
 * THE 10 STEPS TO CREATE A TRANSACTION
    * 1. Validate the request body to ensure all required fields are present and valid.
    * 2. Validate idempotency key to prevent duplicate transactions.
    * 3. Check account status
    * 4. Derive sender's current balance from ledger entries
    * 5. Create a new transaction with status PENDING
    * 6. Create a DEBIT ledger entry for sender's account
    * 7. Create a CREDIT ledger entry for receiver's account
    * 8. Update transaction status to COMPLETED
    * 9. Commit MongoDB session to save transaction and ledger entries atomically
    * 10. Send email notifications about the transaction. 
*/                     

async function createTransaction(req, res){

    /**
     * 1. Validate Request
     */
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            messgae: "All fields are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or Toaccount"
        })
    }

    /**
     * - 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status == "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status == "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }
        if(isTransactionAlreadyExists.status == "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed",
            })
        }
        if(isTransactionAlreadyExists.status == "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please try again"
            })
        }
    }

    /**
     * - 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both accounts must be active to process transaction"
        })  
    }

    /**
     * - 4. Derive sender's current balance from ledger entries
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * - 5. Create a new transaction with status PENDING
     */
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session })

    /**
     * - 6. Create a DEBIT ledger entry for sender's account
     */
    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        type: "DEBIT",
        transaction: transaction._id
    }, { session })

    /**
     * - 7. Create a CREDIT ledger entry for receiver's account
     */
    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        type: "CREDIT",
        transaction: transaction._id
    }, { session })

    /**
     * - 8. Update transaction status to COMPLETED
     */
    transaction.status = "COMPLETED"

    /**
     * - 9. Commit MongoDB session to save transaction and ledger entries atomically
     */
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    /**
     * - 10. Send email notifications about the transaction.
     */

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })
}

async function createInitialFundTransaction(req, res){
    const {toAccount, amount, idempotencyKey} = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            messgae: "All fields are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })
    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid Toaccount"
        })  
    }

    const fromUserAccount = await accountModel.findOne({
        // systemUser: true,
        user: req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message: "System account not found for the user"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        type: "DEBIT",
        transaction: transaction._id
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        type: "CREDIT",
        transaction: transaction._id
    }], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session }) 

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial fund transaction completed successfully",
        transaction: transaction
    })

}

module.exports = {
    createTransaction,
    createInitialFundTransaction
}
