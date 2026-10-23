import jwt from 'jsonwebtoken'

export const authMiddleware =  async (req , res , next) =>{
    try{
        const accessToken = req.headers.authorization?.split(' ')[1] 

         const decoded = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET)

    req.user = decoded.id 

    next()
    }catch(error) {
         console.log("authmiddleware error" , error.message)
        return res.status(401).json({
            message:"Invalid or expired access token"
        })
    }

   
}

