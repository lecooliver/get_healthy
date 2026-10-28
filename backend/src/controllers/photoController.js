const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getPhotos = async (req, res) => {
  const { category } = req.query
  
  const where = { userId: req.userId }
  if (category && category !== 'all') {
    where.category = category
  }
  
  const photos = await prisma.photo.findMany({
    where,
    orderBy: { takenAt: 'desc' }
  })
  
  res.json(photos)
}

const getPhotoCategories = async (req, res) => {
  const photos = await prisma.photo.findMany({
    where: { userId: req.userId },
    select: { category: true }
  })
  
  const categories = [...new Set(photos.map(p => p.category).filter(Boolean))]
  res.json(categories)
}

const getPhoto = async (req, res) => {
  const { id } = req.params
  
  const photo = await prisma.photo.findFirst({
    where: { id, userId: req.userId }
  })
  
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' })
  }
  
  res.json(photo)
}

const createPhoto = async (req, res) => {
  const { category, notes, takenAt } = req.body
  
  if (!req.file) {
    return res.status(400).json({ error: 'Photo file is required' })
  }
  
  const photo = await prisma.photo.create({
    data: {
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      category: category || null,
      notes: notes || null,
      takenAt: takenAt ? new Date(takenAt) : new Date()
    }
  })
  
  res.status(201).json(photo)
}

const updatePhoto = async (req, res) => {
  const { id } = req.params
  const { category, notes, takenAt } = req.body
  
  const existing = await prisma.photo.findFirst({
    where: { id, userId: req.userId }
  })
  
  if (!existing) {
    return res.status(404).json({ error: 'Photo not found' })
  }
  
  const photo = await prisma.photo.update({
    where: { id },
    data: {
      category: category !== undefined ? category : existing.category,
      notes: notes !== undefined ? notes : existing.notes,
      takenAt: takenAt ? new Date(takenAt) : existing.takenAt
    }
  })
  
  res.json(photo)
}

const deletePhoto = async (req, res) => {
  const { id } = req.params
  
  const photo = await prisma.photo.findFirst({
    where: { id, userId: req.userId }
  })
  
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' })
  }
  
  await prisma.photo.delete({
    where: { id }
  })
  
  res.json({ message: 'Photo deleted successfully' })
}

const getPhotosByCategory = async (req, res) => {
  const { category } = req.params
  
  const photos = await prisma.photo.findMany({
    where: {
      userId: req.userId,
      category: category === 'uncategorized' ? null : category
    },
    orderBy: { takenAt: 'asc' }
  })
  
  res.json(photos)
}

module.exports = {
  getPhotos,
  getPhotoCategories,
  getPhoto,
  createPhoto,
  updatePhoto,
  deletePhoto,
  getPhotosByCategory
}
