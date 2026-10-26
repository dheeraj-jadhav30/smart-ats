import crypto from 'crypto'
import redis from '../config/redis.js'

/**
 * 1. Generate a clean fingerprint for any Job Description text
 */
export const getJDFingerprint = (jobDescription) => {
    const normalized = jobDescription
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
    
    // Create SHA-256 hash
    return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * 2. Look up the JD in Redis
 */
export const getCachedJD = async (fingerprint) => {
    try {
        const key = `smartats:jd:v1:${fingerprint}`
        const cachedData = await redis.get(key)
        
        if (cachedData) {
            console.log('⚡ Redis Cache HIT for Job Description! (Saved Gemini Tokens)')
            return JSON.parse(cachedData)
        }

        console.log('🔍 Redis Cache MISS: First time seeing this Job Description.')
        return null
    } catch (error) {
        console.error('Cache read error:', error.message)
        return null
    }
}

/**
 * 3. Save the JD requirements in Redis with a 24-Hour TTL (86,400 seconds)
 */
export const setCachedJD = async (fingerprint, data) => {
    try {
        const key = `smartats:jd:v1:${fingerprint}`
        // 'EX', 86400 tells Redis to automatically delete this after 24 hours
        await redis.set(key, JSON.stringify(data), 'EX', 86400)
    } catch (error) {
        console.error('Cache write error:', error.message)
    }
}
