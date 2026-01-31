// src/modules/payments/payment.routes.js
const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment } = require('./payment.controller');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;