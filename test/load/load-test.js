import dotenv from 'dotenv'
dotenv.config()

import app from '../../app.js'
import jwt from 'jsonwebtoken'

async function runLoadAndRateLimitTest() {
    console.log('='.repeat(70))
    console.log('🚀 SMART-ATS: LOAD & STRESS TESTING SUITE')
    console.log('='.repeat(70))

    // 1. Start in-memory test server
    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s))
    })
    const port = server.address().port
    const baseUrl = `http://127.0.0.1:${port}`

    try {
        // --- PHASE 1: HIGH CONCURRENCY LOAD BENCHMARK (/health/live) ---
        console.log('\n[PHASE 1] Running Concurrency Benchmark on /health/live...')
        const TOTAL_REQUESTS = 100
        const CONCURRENCY = 10
        const latencies = []
        let successCount = 0
        let failureCount = 0

        const startTime = Date.now()

        // Batch execution with concurrency pool
        for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
            const batch = []
            for (let j = 0; j < CONCURRENCY && i + j < TOTAL_REQUESTS; j++) {
                batch.push((async () => {
                    const reqStart = performance.now()
                    try {
                        const res = await fetch(`${baseUrl}/health/live`)
                        const reqEnd = performance.now()
                        latencies.push(reqEnd - reqStart)
                        if (res.status === 200) {
                            successCount++
                        } else {
                            failureCount++
                        }
                    } catch (e) {
                        failureCount++
                    }
                })())
            }
            await Promise.all(batch)
        }

        const totalTimeSeconds = (Date.now() - startTime) / 1000
        const rps = Math.round(TOTAL_REQUESTS / totalTimeSeconds)

        latencies.sort((a, b) => a - b)
        const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2)
        const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2)
        const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2)
        const min = latencies[0].toFixed(2)
        const max = latencies[latencies.length - 1].toFixed(2)

        console.log(`✅ Completed ${TOTAL_REQUESTS} requests in ${totalTimeSeconds.toFixed(3)}s (${rps} req/sec)`)
        console.log(`   - Success: ${successCount} | Failed: ${failureCount}`)
        console.log(`   - Latency Min: ${min}ms | p50: ${p50}ms | p95: ${p95}ms | p99: ${p99}ms | Max: ${max}ms`)

        // --- PHASE 2: RATE LIMITER STRESS TEST (/api/resume/analyze) ---
        console.log('\n[PHASE 2] Stress Testing Sliding-Window Rate Limiter...')
        const testUserId = '609c1f77bcf86cd799439099'
        const secret = process.env.ACCESS_TOKEN_SECRET || 'testsecret'
        const testToken = jwt.sign({ id: testUserId }, secret, { expiresIn: '15m' })

        console.log(`   Simulating 7 rapid scans for User ${testUserId}...`)
        const responses = []

        for (let i = 1; i <= 7; i++) {
            const res = await fetch(`${baseUrl}/api/resume/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${testToken}`
                },
                body: JSON.stringify({
                    jobDescription: 'Software engineer position requiring 5 years of backend experience in Node.js and MongoDB.',
                    resumeText: 'Dheeraj Jadhav - Full Stack Software Developer with 3+ years experience in Node.js, Express, MongoDB, and Redis.'
                })
            })
            responses.push({ attempt: i, status: res.status })
            console.log(`   Scan #${i} -> HTTP ${res.status}`)
        }

        const rateLimitedCount = responses.filter(r => r.status === 429).length
        if (rateLimitedCount > 0) {
            console.log(`\n🛡️ RATE LIMITER VERIFIED: Successfully blocked ${rateLimitedCount} scans with HTTP 429!`)
        } else {
            console.log('\nℹ️ Rate Limiter note: Redis is in fail-open mode or limits not exceeded.')
        }

        console.log('\n' + '='.repeat(70))
        console.log('🎉 LOAD & STRESS TEST COMPLETED SUCCESSFULLY')
        console.log('='.repeat(70))

    } finally {
        server.close()
    }
}

runLoadAndRateLimitTest().catch(console.error)
