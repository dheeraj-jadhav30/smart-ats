import mongoose from 'mongoose'
import redis from '../config/redis.js'

// Liveness probe: returns 200 if the process is alive
export const livenessCheck = (req, res) => {
    return res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
}

// Readiness probe: verifies MongoDB AND Redis
export const readinessCheck = (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1
    const isRedisConnected = redis.status === 'ready' || redis.status === 'connect'

    const checks = {
        mongodb: isDbConnected ? 'up' : 'down',
        redis: isRedisConnected ? 'up' : 'down'
    }

    const isAllReady = isDbConnected && isRedisConnected

    if (!isAllReady) {
        return res.status(503).json({
            status: 'degraded',
            checks,
            timestamp: new Date().toISOString()
        })
    }

    return res.status(200).json({
        status: 'ready',
        checks,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
}
