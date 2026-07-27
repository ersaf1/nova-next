import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET all bookings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(bookings)
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// POST create booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const { packageId, packageName, country, name, email, phone, travelDate, participants } = req.body
    if (!packageId || !packageName || !country || !name || !email || !phone || !travelDate || !participants) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    const booking = await prisma.booking.create({ data: req.body })
    res.status(201).json(booking)
  } catch {
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// PATCH update status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (!status) {
      res.status(400).json({ error: 'Missing status field' })
      return
    }
    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status },
    })
    res.json(booking)
  } catch {
    res.status(500).json({ error: 'Failed to update booking status' })
  }
})

// DELETE booking
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.booking.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Deleted successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to delete booking' })
  }
})

export default router
