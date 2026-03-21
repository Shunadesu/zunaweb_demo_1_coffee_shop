const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profileController');
const { auth } = require('../../middleware/auth');

// All routes require auth
router.use(auth);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/address', profileController.updateAddress);
router.get('/favorites', profileController.getFavorites);
router.post('/favorites/:productId', profileController.addFavorite);
router.delete('/favorites/:productId', profileController.removeFavorite);

module.exports = router;
