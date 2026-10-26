import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times > 3) {
            console.log('⚠️ Redis offline. Server continuing in fail-open mode...')
            return null // Stop reconnecting after 3 tries
        }
        return Math.min(times * 1000, 3000)
    }
})

redis.on('connect', () => {
    console.log('⚡ Redis connected successfully')
})

redis.on('error', (error) => {
    console.error('Redis error:', error.message)
})

export default redis
