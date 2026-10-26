import redis from '../config/redis.js'

export const rateLimitMiddleware = async (req , res , next) => {

    try{

        const userId = req.user
        const userKey = `smartats:rateLimit:${userId}`

        const limit = 5 
        const now = Date.now()
        const oneHourAgo = now - (60*60*1000)

        await redis.zremrangebyscore(userKey , 0 , oneHourAgo)


        const currentScan = await redis.zcard(userKey)

        if(currentScan >= limit) {
            return res.status(429).json({
                success:false,
                message:"YOu have exceeded 5 scans in this hour , please try again later"
            })
        }

        await redis.zadd(userKey , now , `${now}`)
        await redis.expire(userKey , 3600)

        next()

    }catch(error){
        console.error("Rate Limit error :" , error.message)
        next()
    }
}


