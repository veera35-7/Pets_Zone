const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All payment endpoints are protected
router.use(protect);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
