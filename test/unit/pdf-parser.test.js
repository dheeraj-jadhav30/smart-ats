import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { extractTextFromPDF } from '../../src/services/resume-parser.service.js'

describe('Unit Test: PDF Resume Parser Security & Validation', () => {
    it('should reject a text file disguised as PDF (missing %PDF- magic bytes)', async () => {
        const fakeBuffer = Buffer.from('This is a plain text file pretending to be a PDF.')

        await assert.rejects(
            async () => {
                await extractTextFromPDF(fakeBuffer)
            },
            {
                name: 'Error',
                message: 'Invalid file format : not a legitimate PDF file'
            }
        )
    })

    it('should reject a binary JPEG image buffer with incorrect header', async () => {
        // JPEG magic bytes: FF D8 FF
        const fakeImageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])

        await assert.rejects(
            async () => {
                await extractTextFromPDF(fakeImageBuffer)
            },
            {
                name: 'Error',
                message: 'Invalid file format : not a legitimate PDF file'
            }
        )
    })

    it('should reject an empty buffer', async () => {
        const emptyBuffer = Buffer.alloc(0)

        await assert.rejects(
            async () => {
                await extractTextFromPDF(emptyBuffer)
            },
            {
                name: 'Error',
                message: 'Invalid file format : not a legitimate PDF file'
            }
        )
    })
})
