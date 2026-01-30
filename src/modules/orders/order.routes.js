// src/modules/orders/order.routes.js
const express = require('express');
const { createOrder, getMyOrders, getOrderById } = require('./order.controller');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// Create Order (Checkout)
router.post('/', protect, createOrder);

// Get My Orders
router.get('/myorders', protect, getMyOrders);

// Get Single Order (Must be at the bottom to avoid conflict with /myorders)
router.get('/:id', protect, getOrderById);

module.exports = router;