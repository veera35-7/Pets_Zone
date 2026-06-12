const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Pet = require('../models/Pet');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholderSecret'
});

// @desc  Create Razorpay Order
// @route POST /api/payments/order
// @access Private
const createOrder = async (req, res) => {
  try {
    const { petId } = req.body;
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet listing not found.' });

    if (pet.availability !== 'Available') {
      return res.status(400).json({ success: false, message: 'This listing is no longer available.' });
    }

    const amountInPaise = pet.price * 100;

    // Use mock mode if keys are not defined
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = '';
    if (!keySecret || keyId === 'rzp_test_mockKeyId') {
      orderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
    } else {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_pet_${pet._id}_${Date.now()}`
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Save transaction
    await Transaction.create({
      user: req.user._id,
      pet: petId,
      razorpayOrderId: orderId,
      amount: pet.price,
      status: 'created'
    });

    res.json({
      success: true,
      keyId,
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      petName: pet.petName,
      petBreed: pet.breed
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify Razorpay Payment Signature
// @route POST /api/payments/verify
// @access Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const transaction = await Transaction.findOne({ razorpayOrderId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found.' });
    }

    const isMock = razorpayOrderId.startsWith('mock_order_');
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let verified = false;
    if (isMock || !keySecret) {
      // Automatic mock verification
      verified = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      verified = generatedSignature === razorpaySignature;
    }

    if (!verified) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Update transaction to paid
    transaction.razorpayPaymentId = razorpayPaymentId || `mock_pay_${crypto.randomBytes(6).toString('hex')}`;
    transaction.status = 'paid';
    await transaction.save();

    // Mark Pet as Reserved
    await Pet.findByIdAndUpdate(transaction.pet, { availability: 'Reserved' });

    res.json({
      success: true,
      message: 'Payment verified successfully and listing marked as Reserved!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
