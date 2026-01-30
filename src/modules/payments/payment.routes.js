// src/modules/payments/payment.routes.js
const express = require('express');
const { processPayment } = require('./payment.controller');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, processPayment);

module.exports = router;