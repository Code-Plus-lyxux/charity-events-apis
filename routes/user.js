const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Update user profile
router.put('/profile', authenticate, updateProfile);

module.exports = router;
