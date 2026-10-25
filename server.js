import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import connectDB from './src/config/db.js'

connectDB()

const port = process.env.PORT || 5000

app.listen(port , () => {
    console.log(`server is connected ${port}`)
})

