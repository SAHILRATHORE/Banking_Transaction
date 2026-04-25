const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({
        token
    })
    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }
    
    try {

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await userModel.findById(decode.userId)

        req.user = user

        return next()

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }
}

async function authSystemUserMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }
    const isBlacklisted = await tokenBlacklistModel.findOne({
        token
    })
    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }
    
    try {

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await userModel.findById(decode.userId).select("+systemUser")

        console.log(user)

        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }   
        req.user = user

        return next()   
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}