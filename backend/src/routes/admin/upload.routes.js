const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/admin/uploadController');
const uploadMiddleware = require('../../middleware/upload');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

router.use(auth, admin);

router.post('/image', uploadMiddleware('misc').single('image'), uploadController.uploadImage);
router.post('/images', uploadMiddleware('misc').array('images', 10), uploadController.uploadImages);

module.exports = router;
