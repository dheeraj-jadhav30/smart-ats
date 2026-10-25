import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { uploadResume } from '../middleware/upload.middleware.js'
import { analyzeResume } from '../controllers/resume.controller.js'
import { historyController , getReportByIdController , deleteReportController} from '../controllers/resume.controller.js'


const resumeRouter = express.Router()

resumeRouter.post('/analyze' , authMiddleware , uploadResume , analyzeResume)

resumeRouter.get('/history', authMiddleware , historyController )

resumeRouter.get('/report/:id', authMiddleware, getReportByIdController)

resumeRouter.delete('/report/:id', authMiddleware, deleteReportController)


export default resumeRouter