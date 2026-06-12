const Pet = require('../models/Pet');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPets, pendingPets, approvedPets, rejectedPets, totalEnquiries, unreadEnquiries] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Pet.countDocuments(),
      Pet.countDocuments({ status: 'pending' }),
      Pet.countDocuments({ status: 'approved' }),
      Pet.countDocuments({ status: 'rejected' }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ adminRead: false })
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalPets, pendingPets, approvedPets, rejectedPets, totalEnquiries, unreadEnquiries }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all pets (admin)
// @route GET /api/admin/pets
const getAllPets = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$text = { $search: search };

    const pets = await Pet.find(filter)
      .populate('seller', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Pet.countDocuments(filter);

    res.json({
      success: true, pets,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Approve pet
// @route PUT /api/admin/pets/:id/approve
const approvePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: null },
      { new: true }
    ).populate('seller', 'fullName email');

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    // Create notification for seller
    await Notification.create({
      user: pet.seller._id,
      title: '🎉 Your listing is approved!',
      message: `Your pet listing "${pet.petName}" has been approved and is now live on RV Pets Zone.`,
      type: 'pet_approved',
      relatedPet: pet._id
    });

    res.json({ success: true, message: 'Pet approved and published', pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Reject pet
// @route PUT /api/admin/pets/:id/reject
const rejectPet = async (req, res) => {
  try {
    const { reason } = req.body;

    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || 'Did not meet our listing standards.' },
      { new: true }
    ).populate('seller', 'fullName email');

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    // Create notification for seller
    await Notification.create({
      user: pet.seller._id,
      title: '❌ Listing not approved',
      message: `Your pet listing "${pet.petName}" was not approved. Reason: ${reason || 'Did not meet listing standards.'}`,
      type: 'pet_rejected',
      relatedPet: pet._id
    });

    res.json({ success: true, message: 'Pet rejected', pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle featured
// @route PUT /api/admin/pets/:id/feature
const toggleFeatured = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    pet.featured = !pet.featured;
    await pet.save();

    res.json({
      success: true,
      message: `Pet ${pet.featured ? 'featured' : 'unfeatured'}`,
      featured: pet.featured
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Edit pet (admin can edit any field)
// @route PUT /api/admin/pets/:id
const editPet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'fullName email');

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    res.json({ success: true, message: 'Pet updated', pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete pet (admin)
// @route DELETE /api/admin/pets/:id
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    // Delete images from Cloudinary
    const deletePromises = pet.images.map(img => {
      if (img.publicId) return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);

    await pet.deleteOne();
    res.json({ success: true, message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find({ role: { $nin: ['admin', 'superadmin'] } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments({ role: { $nin: ['admin', 'superadmin'] } });

    res.json({
      success: true, users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all enquiries (admin)
// @route GET /api/admin/enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const enquiries = await Enquiry.find()
      .populate('pet', 'petName petType breed images')
      .populate('seller', 'fullName email mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Enquiry.countDocuments();

    // Mark as admin read
    await Enquiry.updateMany({ adminRead: false }, { adminRead: true });

    res.json({
      success: true, enquiries,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle user active status
// @route PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    // Audit log
    const { logAction } = require('../utils/auditLogger');
    await logAction({
      action: user.isActive ? 'USER_UNBAN' : 'USER_BAN',
      actor: req.user,
      targetType: 'User',
      targetId: user._id,
      details: `Admin ${user.isActive ? 'unbanned' : 'banned'} user: ${user.fullName}`
    });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get users pending seller verification
// @route GET /api/admin/sellers/pending
const getPendingSellers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find({ aadhaarStatus: 'pending' })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments({ aadhaarStatus: 'pending' });

    res.json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify/Reject seller
// @route PUT /api/admin/sellers/:id/verify
const verifySeller = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.aadhaarStatus = status;
    if (status === 'approved') {
      user.isVerifiedSeller = true;
      user.role = 'seller'; // upgrade role to seller when approved
    } else {
      user.isVerifiedSeller = false;
    }
    await user.save();

    // Audit log
    const { logAction } = require('../utils/auditLogger');
    await logAction({
      action: status === 'approved' ? 'SELLER_VERIFICATION_APPROVED' : 'SELLER_VERIFICATION_REJECTED',
      actor: req.user,
      targetType: 'User',
      targetId: user._id,
      details: `Admin ${status} seller verification for user: ${user.fullName}`
    });

    // Notify user
    await Notification.create({
      user: user._id,
      title: status === 'approved' ? '🎉 Seller Profile Verified!' : '❌ Seller Verification Failed',
      message: status === 'approved' 
        ? 'Your Aadhaar verification is successful! You can now list pets for sale.' 
        : 'Your seller verification was rejected. Please upload a clear Aadhaar copy.',
      type: status === 'approved' ? 'seller_approved' : 'seller_rejected'
    });

    res.json({ success: true, message: `Seller verification status updated to ${status}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStats,
  getAllPets,
  approvePet,
  rejectPet,
  toggleFeatured,
  editPet,
  deletePet,
  getAllUsers,
  getAllEnquiries,
  toggleUserStatus,
  getPendingSellers,
  verifySeller
};
