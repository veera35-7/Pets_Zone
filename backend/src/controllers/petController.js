const Pet = require('../models/Pet');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc  Get approved pets (public)
// @route GET /api/pets
// @access Public
const getPets = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, search, city, minPrice, maxPrice, sort = 'newest' } = req.query;

    const filter = { status: 'approved' };
    if (type && type !== 'all') filter.petType = type;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 }
    };

    const pets = await Pet.find(filter)
      .populate('seller', 'fullName mobile')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Pet.countDocuments(filter);

    res.json({
      success: true,
      pets,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get featured pets
// @route GET /api/pets/featured
// @access Public
const getFeaturedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'approved', featured: true })
      .populate('seller', 'fullName mobile')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get trending pets (most views)
// @route GET /api/pets/trending
// @access Public
const getTrendingPets = async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'approved' })
      .populate('seller', 'fullName mobile')
      .sort({ views: -1, enquiryCount: -1 })
      .limit(8)
      .lean();

    res.json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single pet
// @route GET /api/pets/:id
// @access Public
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('seller', 'fullName mobile email');

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (pet.status !== 'approved') {
      // Allow owner and admin to see their own listings
      if (!req.user || (req.user._id.toString() !== pet.seller._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'This listing is not available' });
      }
    }

    // Increment view count if user is anonymous OR (user is not seller AND user is not admin/superadmin)
    const isOwnerOrAdmin = req.user && (
      req.user._id.toString() === pet.seller._id.toString() ||
      ['admin', 'superadmin'].includes(req.user.role)
    );
    const shouldCountView = !isOwnerOrAdmin;
    if (shouldCountView) {
      await Pet.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
      pet.views += 1;
    }

    res.json({ success: true, pet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Submit pet listing
// @route POST /api/pets
// @access Private (User)
const createPet = async (req, res) => {
  try {
    const {
      petName, petType, breed, gender, ageValue, ageUnit,
      price, city, state, pincode, description, vaccinationStatus
    } = req.body;

    // Check for duplicate pet listing
    const duplicate = await Pet.findOne({
      seller: req.user._id,
      petName: petName.trim(),
      petType,
      breed: breed.trim(),
      price: Number(price),
      'location.city': city.trim()
    });

    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A listing with these exact details already exists!' });
    }

    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      images = results.map(r => ({ url: r.secure_url, publicId: r.public_id }));
    } else {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const pet = await Pet.create({
      seller: req.user._id,
      petName,
      petType,
      breed,
      gender,
      age: { value: Number(ageValue), unit: ageUnit || 'Months' },
      price: Number(price),
      location: { city, state, pincode },
      description,
      vaccinationStatus,
      images,
      status: 'pending'
    });

    await pet.populate('seller', 'fullName mobile');

    res.status(201).json({
      success: true,
      message: 'Pet listing submitted for admin review',
      pet
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get my listings
// @route GET /api/pets/my
// @access Private
const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, pets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update my pet
// @route PUT /api/pets/:id
// @access Private (Owner)
const updateMyPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (pet.status === 'approved') {
      // Allow ONLY updating availability
      if (req.body.availability !== undefined) {
        const updatedPet = await Pet.findByIdAndUpdate(
          req.params.id,
          { availability: req.body.availability },
          { new: true }
        );
        return res.json({ success: true, message: 'Pet availability updated', pet: updatedPet });
      }
      return res.status(400).json({ success: false, message: 'Approved listings cannot be edited. Contact admin.' });
    }

    const updates = req.body;
    delete updates.status;
    delete updates.featured;

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: 'Pet updated', pet: updatedPet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete my pet
// @route DELETE /api/pets/:id
// @access Private (Owner)
const deleteMyPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    const deletePromises = pet.images.map(img => {
      if (img.publicId) return deleteFromCloudinary(img.publicId);
    });
    await Promise.all(deletePromises);

    await pet.deleteOne();
    res.json({ success: true, message: 'Pet listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI Pet Matchmaker Recommendation Engine (Scoring algorithm)
// @route GET /api/pets/recommendations
// @access Public
const getRecommendations = async (req, res) => {
  try {
    const { budget, space, experience, city } = req.query;

    // Fetch all approved and available pets
    const pets = await Pet.find({ status: 'approved', availability: 'Available' })
      .populate('seller', 'fullName mobile email')
      .lean();

    const scoredPets = pets.map((pet) => {
      let score = 0;
      const matchDetails = [];

      // 1. Budget scoring
      if (budget === 'low') {
        if (pet.price <= 2000) {
          score += 25;
          matchDetails.push('Perfect budget match (Low)');
        } else if (pet.price <= 5000) {
          score += 10;
          matchDetails.push('Slightly over budget');
        } else {
          score -= 10;
        }
      } else if (budget === 'medium') {
        if (pet.price > 2000 && pet.price <= 8000) {
          score += 25;
          matchDetails.push('Perfect budget match (Medium)');
        } else if (pet.price <= 2000) {
          score += 15;
          matchDetails.push('Within budget (Economy choice)');
        } else {
          score -= 5;
        }
      } else if (budget === 'high') {
        if (pet.price > 8000) {
          score += 25;
          matchDetails.push('Perfect budget match (Premium)');
        } else {
          score += 15;
          matchDetails.push('Within budget');
        }
      }

      // 2. Space scoring
      const petType = pet.petType;
      if (space === 'apartment') {
        if (['Rabbit', 'Guinea Pig', 'Cat', 'Fish', 'Hamster'].includes(petType)) {
          score += 25;
          matchDetails.push('Excellent space suitability (Apartment-friendly)');
        } else if (['Bird', 'Other'].includes(petType)) {
          score += 10;
          matchDetails.push('Moderate space suitability');
        } else {
          score -= 20; // goats, cows, ducks, chickens are bad for apartment
        }
      } else if (space === 'house') {
        if (['Rabbit', 'Guinea Pig', 'Chicken', 'Duck', 'Cat', 'Bird', 'Hamster'].includes(petType)) {
          score += 25;
          matchDetails.push('Excellent space suitability (House with yard)');
        } else if (['Goat'].includes(petType)) {
          score += 10;
          matchDetails.push('Moderate space suitability');
        } else {
          score += 5;
        }
      } else if (space === 'farm') {
        if (['Goat', 'Cow', 'Chicken', 'Duck'].includes(petType)) {
          score += 25;
          matchDetails.push('Perfect fit for farm/large acreage');
        } else {
          score += 15; // all pets fit on a farm
        }
      }

      // 3. Experience scoring
      if (experience === 'beginner') {
        if (['Rabbit', 'Guinea Pig', 'Hamster', 'Fish', 'Cat', 'Bird'].includes(petType)) {
          score += 25;
          matchDetails.push('Very beginner friendly');
        } else if (['Goat', 'Cow'].includes(petType)) {
          score -= 30; // hard deduction: goats/cows require expert handling
          matchDetails.push('High care requirement (Not recommended for beginners)');
        } else {
          score += 10;
        }
      } else if (experience === 'intermediate') {
        if (['Goat', 'Chicken', 'Duck'].includes(petType)) {
          score += 25;
          matchDetails.push('Good fit for intermediate experience');
        } else {
          score += 20;
        }
      } else if (experience === 'expert') {
        score += 25; // Experts can handle any pet
        matchDetails.push('Expert match (All care levels supported)');
      }

      // 4. Location scoring (City level match)
      if (city && pet.location && pet.location.city) {
        if (pet.location.city.toLowerCase() === city.toLowerCase()) {
          score += 30;
          matchDetails.push('Local listing (Same city)');
        } else {
          score += 5;
        }
      }

      return {
        ...pet,
        score,
        matchDetails
      };
    });

    // Filter out items with very negative score
    const filteredPets = scoredPets.filter(p => p.score > 0);

    // Sort by score descending
    filteredPets.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      results: filteredPets.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPets,
  getFeaturedPets,
  getTrendingPets,
  getPetById,
  createPet,
  getMyPets,
  updateMyPet,
  deleteMyPet,
  getRecommendations
};
