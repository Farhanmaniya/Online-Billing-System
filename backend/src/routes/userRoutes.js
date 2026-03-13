const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// All routes are protected
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.get('/dashboard-stats', userController.getDashboardStats);
router.put('/profile', upload.single('companyLogo'), userController.updateProfile);

module.exports = router;
