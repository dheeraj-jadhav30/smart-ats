import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../app.js'

describe('Integration Test: Health Probes (/health/live & /health/ready)', () => {
    let server
    let baseUrl

    before(async () => {
        // Start ephemeral in-memory test server
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const port = server.address().port
                baseUrl = `http://127.0.0.1:${port}`
                resolve()
            })
        })
    })

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve))
        }
    })

    it('GET /health/live should return 200 with status ok and uptime', async () => {
        const response = await fetch(`${baseUrl}/health/live`)
        const data = await response.json()

        assert.strictEqual(response.status, 200)
        assert.strictEqual(data.status, 'ok')
        assert.strictEqual(typeof data.uptime, 'number')
        assert.ok(data.timestamp, 'timestamp must be present')
    })

    it('GET /health/ready should return a structured checks object for dependencies', async () => {
        const response = await fetch(`${baseUrl}/health/ready`)
        const data = await response.json()

        // Status will be 200 (ready) or 503 (degraded) depending on active DB connection in test
        assert.ok([200, 503].includes(response.status))
        assert.ok(['ready', 'degraded'].includes(data.status))
        assert.ok(data.checks, 'checks object must be returned')
        assert.ok('mongodb' in data.checks, 'mongodb check must exist')
        assert.ok('redis' in data.checks, 'redis check must exist')
    })
})
