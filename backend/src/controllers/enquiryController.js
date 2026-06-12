const Enquiry = require('../models/Enquiry');
const Pet = require('../models/Pet');
const Notification = require('../models/Notification');

// @desc  Submit enquiry
// @route POST /api/enquiries
// @access Public
const createEnquiry = async (req, res) => {
  try {
    const { petId, name, mobile, email, message } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    if (pet.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot enquire about this listing' });
    }

    let alreadyEnquired = false;
    if (req.user) {
      alreadyEnquired = await Enquiry.exists({ pet: petId, enquirer: req.user._id });
    } else {
      alreadyEnquired = await Enquiry.exists({ pet: petId, email: email.trim().toLowerCase() });
    }

    const enquiry = await Enquiry.create({
      pet: petId,
      seller: pet.seller,
      enquirer: req.user?._id || null,
      name,
      mobile,
      email: email.trim().toLowerCase(),
      message
    });

    // Increment pet enquiry count ONLY if this is the first enquiry from this user/email
    if (!alreadyEnquired) {
      await Pet.findByIdAndUpdate(petId, { $inc: { enquiryCount: 1 } });
    }

    // Notify seller
    await Notification.create({
      user: pet.seller,
      title: '📩 New Enquiry Received',
      message: `${name} has enquired about your pet "${pet.petName}". Mobile: ${mobile}`,
      type: 'new_enquiry',
      relatedPet: petId
    });

    await enquiry.populate([
      { path: 'pet', select: 'petName petType breed' },
      { path: 'seller', select: 'fullName email' }
    ]);

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get enquiries for logged in user's listings
// @route GET /api/enquiries/my
// @access Private
const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ seller: req.user._id })
      .populate('pet', 'petName petType breed images')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get notifications for user
// @route GET /api/enquiries/notifications
// @access Private
const getNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Mark notifications as read
// @route PUT /api/enquiries/notifications/read
// @access Private
const markNotificationsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEnquiry, getMyEnquiries, getNotifications, markNotificationsRead };
