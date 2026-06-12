const express = require('express');
const router = express.Router();
const {
  getStats, getAllPets, approvePet, rejectPet, toggleFeatured,
  editPet, deletePet, getAllUsers, getAllEnquiries, toggleUserStatus,
  getPendingSellers, verifySeller
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require auth + admin role
router.use(protect, adminAuth);

router.get('/stats', getStats);
router.get('/pets', getAllPets);
router.put('/pets/:id/approve', approvePet);
router.put('/pets/:id/reject', rejectPet);
router.put('/pets/:id/feature', toggleFeatured);
router.put('/pets/:id', editPet);
router.delete('/pets/:id', deletePet);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/enquiries', getAllEnquiries);

// Seller Verification routes
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/verify', verifySeller);

module.exports = router;
