// src/modules/auth/auth.routes.js
const express = require('express');
const { registerUser } = require('./auth.controller');
const { loginUser } = require('./auth.controller');
const router = express.Router();

// When a POST request comes to '/', run the registerUser function
// Note: The '/api/auth' prefix will be defined in app.js, so here we just use '/register'
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;