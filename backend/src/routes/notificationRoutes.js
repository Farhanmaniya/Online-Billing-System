const express = require('express');
const router = express.Router();
// FIX: Import protect correctly (it's a default export, not named)
const protect = require('../middleware/authMiddleware'); 
const { getUserNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.route('/')
  .get(protect, getUserNotifications);

router.route('/read-all')
  .patch(protect, markAllAsRead);

router.route('/:id/read')
  .patch(protect, markAsRead); // Changed to PATCH per requirements

module.exports = router;
