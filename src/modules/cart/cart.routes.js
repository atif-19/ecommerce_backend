// src/modules/cart/cart.routes.js
const express = require('express');
const { addToCart, getCart, removeFromCart } = require('./cart.controller');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, addToCart) // Add item
  .get(protect, getCart);   // View cart

router.delete('/:bookId', protect, removeFromCart); // Remove specific item

module.exports = router;