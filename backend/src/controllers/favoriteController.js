const Favorite = require('../models/Favorite');

// @desc  Toggle favorite
// @route POST /api/favorites/:petId
// @access Private
const toggleFavorite = async (req, res) => {
  try {
    const existing = await Favorite.findOne({ user: req.user._id, pet: req.params.petId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, isFavorited: false, message: 'Removed from favorites' });
    }

    await Favorite.create({ user: req.user._id, pet: req.params.petId });
    res.json({ success: true, isFavorited: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user favorites
// @route GET /api/favorites
// @access Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'pet',
        populate: { path: 'seller', select: 'fullName mobile' }
      })
      .sort({ createdAt: -1 })
      .lean();

    const pets = favorites.map(f => f.pet).filter(Boolean);
    res.json({ success: true, favorites: pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Check if pet is favorited
// @route GET /api/favorites/check/:petId
// @access Private
const checkFavorite = async (req, res) => {
  try {
    const existing = await Favorite.findOne({ user: req.user._id, pet: req.params.petId });
    res.json({ success: true, isFavorited: !!existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { toggleFavorite, getFavorites, checkFavorite };
