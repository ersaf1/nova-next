import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import heroRouter from './routes/hero'
import destinationsRouter from './routes/destinations'
import packagesRouter from './routes/packages'
import testimonialsRouter from './routes/testimonials'
import faqsRouter from './routes/faqs'
import bookingsRouter from './routes/bookings'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/hero', heroRouter)
app.use('/api/destinations', destinationsRouter)
app.use('/api/packages', packagesRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/faqs', faqsRouter)
app.use('/api/bookings', bookingsRouter)

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../dist')
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
