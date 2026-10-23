import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register',authController.registerController)

authRouter.post('/login',authController.loginController)

authRouter.post('/refresh-token',authController.refreshToken)

authRouter.post('/logout', authController.logoutController)

authRouter.get('/me' ,authMiddleware , async(req , res) =>{
    return res.status(200).json({
        message:"Authorized",
        userId : req.user
    })

})


export default authRouter

