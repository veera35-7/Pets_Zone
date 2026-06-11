const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFavorites);
router.post('/:petId', toggleFavorite);
router.get('/check/:petId', checkFavorite);

module.exports = router;
