import express from 'express'
import { livenessCheck, readinessCheck } from '../controllers/health.controller.js'

const healthRouter = express.Router()

// Note: Health probes are public endpoints (no authMiddleware)
healthRouter.get('/live', livenessCheck)
healthRouter.get('/ready', readinessCheck)

export default healthRouter
