// src/modules/cart/cart.controller.js
const Cart = require('./cart.model');
const Book = require('../books/book.model');


// @desc    Add book to cart
// @route   POST /api/cart
// @access  Private


const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user._id; // Comes from 'protect' middleware

    // 1. Check if the book actually exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // 2. Find the user's cart
    let cart = await Cart.findOne({ userId });

    // 3. If cart doesn't exist, create a new one
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ bookId, quantity }],
      });
      return res.status(201).json(cart);
    }

    // 4. If cart exists, check if the book is already in it
    const itemIndex = cart.items.findIndex(
      (item) => item.bookId.toString() === bookId
    );

    if (itemIndex > -1) {
      // Book exists in cart -> Update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Book not in cart -> Add new item
      cart.items.push({ bookId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // .populate() replaces 'bookId' with the actual Book object (title, price, etc.)
    const cart = await Cart.findOne({ userId }).populate('items.bookId', 'title price author category');

    if (!cart) {
      return res.status(200).json({ items: [] }); // Send empty cart if none exists
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out the item to remove it
    // we only keep items whose bookId does not match the one to be removed
    cart.items = cart.items.filter((item) => item.bookId.toString() !== bookId);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart };