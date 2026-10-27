import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getJDFingerprint } from '../../src/services/jd-cache.service.js'

describe('Unit Test: Job Description Cache & Fingerprinting', () => {
    it('should generate a 64-character SHA-256 hex string', () => {
        const jd = 'Senior Backend Engineer with Node.js and Redis experience.'
        const fingerprint = getJDFingerprint(jd)

        assert.strictEqual(typeof fingerprint, 'string')
        assert.strictEqual(fingerprint.length, 64)
        assert.match(fingerprint, /^[a-f0-9]{64}$/)
    })

    it('should normalize casing so uppercase and lowercase JDs produce identical fingerprints', () => {
        const jdUpper = 'SOFTWARE ENGINEER WITH REACT AND NODE.JS'
        const jdLower = 'software engineer with react and node.js'

        const hash1 = getJDFingerprint(jdUpper)
        const hash2 = getJDFingerprint(jdLower)

        assert.strictEqual(hash1, hash2, 'Case differences must produce the same fingerprint')
    })

    it('should collapse whitespace and newlines so formatting differences produce identical fingerprints', () => {
        const jd1 = 'Node.js,  Express,   MongoDB,    and Redis.'
        const jd2 = 'Node.js,\nExpress,\t\tMongoDB,\r\nand Redis.'

        const hash1 = getJDFingerprint(jd1)
        const hash2 = getJDFingerprint(jd2)

        assert.strictEqual(hash1, hash2, 'Whitespace differences must produce the same fingerprint')
    })

    it('should produce different fingerprints for different job descriptions', () => {
        const jdFrontend = 'Frontend Developer with React, Vue, and CSS.'
        const jdBackend = 'Backend Engineer with Go, Kubernetes, and gRPC.'

        const hash1 = getJDFingerprint(jdFrontend)
        const hash2 = getJDFingerprint(jdBackend)

        assert.notStrictEqual(hash1, hash2, 'Different JDs must have distinct fingerprints')
    })
})
