const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [100, 'Pet name cannot exceed 100 characters']
  },
  petType: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Reptile', 'Cow', 'Goat', 'Chicken', 'Duck', 'Guinea Pig', 'Other'],
    trim: true
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true,
    maxlength: [100, 'Breed cannot exceed 100 characters']
  },
  availability: {
    type: String,
    enum: ['Available', 'Reserved', 'Sold Out'],
    default: 'Available'
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female']
  },
  age: {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['Days', 'Months', 'Years'], default: 'Months' }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  vaccinationStatus: {
    type: String,
    enum: ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'],
    required: true
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: null
  },
  adminNote: {
    type: String,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  enquiryCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Text index for search
petSchema.index({ petName: 'text', breed: 'text', description: 'text' });
petSchema.index({ status: 1, featured: 1 });
petSchema.index({ 'location.city': 1 });
petSchema.index({ petType: 1 });

module.exports = mongoose.model('Pet', petSchema);
