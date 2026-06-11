const express = require('express');
const router = express.Router();
const {
  getPets, getFeaturedPets, getTrendingPets, getPetById,
  createPet, getMyPets, updateMyPet, deleteMyPet
} = require('../controllers/petController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', getPets);
router.get('/featured', getFeaturedPets);
router.get('/trending', getTrendingPets);
router.get('/my', protect, getMyPets);
router.get('/:id', optionalAuth, getPetById);

// Protected routes
router.post('/', protect, uploadLimiter, upload.array('images', 6), createPet);
router.put('/:id', protect, updateMyPet);
router.delete('/:id', protect, deleteMyPet);

module.exports = router;
