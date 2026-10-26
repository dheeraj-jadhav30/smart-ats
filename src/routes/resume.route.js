import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { uploadResume } from '../middleware/upload.middleware.js'
import { analyzeResume, emailReportController } from '../controllers/resume.controller.js'
import { historyController , getReportByIdController , deleteReportController} from '../controllers/resume.controller.js'
import { rateLimitMiddleware } from '../middleware/rate-limiting.middleware.js'


const resumeRouter = express.Router()

resumeRouter.post('/analyze' , authMiddleware , rateLimitMiddleware , uploadResume , analyzeResume)

resumeRouter.get('/history', authMiddleware , historyController )

resumeRouter.get('/report/:id', authMiddleware, getReportByIdController)

resumeRouter.delete('/report/:id', authMiddleware, deleteReportController)

resumeRouter.post('/email-report/:id' , authMiddleware , emailReportController)


export default resumeRouter