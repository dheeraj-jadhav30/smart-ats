import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import app from '../../app.js'

describe('Integration Test: Authentication & Route Security Guardrails', () => {
    let server
    let baseUrl

    before(async () => {
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

    it('POST /api/auth/register should return 400 when required fields are missing', async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' }) // Missing name & password
        })
        const data = await response.json()

        assert.strictEqual(response.status, 400)
        assert.strictEqual(data.message, 'All fields are required')
    })

    it('POST /api/auth/login should return 400 when credentials are empty', async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        const data = await response.json()

        assert.strictEqual(response.status, 400)
        assert.strictEqual(data.message, 'Email and password are required')
    })

    it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`)
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })

    it('POST /api/resume/analyze should reject unauthenticated calls with 401', async () => {
        const response = await fetch(`${baseUrl}/api/resume/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobDescription: 'Software engineer position requiring 5 years of backend experience.'
            })
        })
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })

    it('GET /api/resume/history should reject unauthenticated calls with 401', async () => {
        const response = await fetch(`${baseUrl}/api/resume/history`)
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })

    it('GET /api/resume/report/:id should reject unauthenticated calls with 401', async () => {
        const response = await fetch(`${baseUrl}/api/resume/report/609c1f77bcf86cd799439011`)
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })

    it('DELETE /api/resume/report/:id should reject unauthenticated calls with 401', async () => {
        const response = await fetch(`${baseUrl}/api/resume/report/609c1f77bcf86cd799439011`, {
            method: 'DELETE'
        })
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })

    it('POST /api/resume/email-report/:id should reject unauthenticated calls with 401', async () => {
        const response = await fetch(`${baseUrl}/api/resume/email-report/609c1f77bcf86cd799439011`, {
            method: 'POST'
        })
        const data = await response.json()

        assert.strictEqual(response.status, 401)
        assert.strictEqual(data.message, 'Invalid or expired access token')
    })
})
