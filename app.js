import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './src/routes/auth.route.js'
import resumeRouter from './src/routes/resume.route.js'
import healthRouter from './src/routes/health.route.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/health' , healthRouter)

app.use('/api/auth',authRouter)

app.use('/api/resume' , resumeRouter)


export default app 