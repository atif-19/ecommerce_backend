// src/modules/users/user.routes.js
const express = require('express');
const { getUserProfile } = require('./user.controller');
const { protect } = require('../../middlewares/authMiddleware'); // Import the guard

const router = express.Router();

// We add 'protect' before 'getUserProfile'
// This means: Run protect first. If it passes, run getUserProfile.
router.get('/me', protect, getUserProfile);

module.exports = router;