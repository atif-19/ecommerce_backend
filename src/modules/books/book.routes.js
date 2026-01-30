// src/modules/books/book.routes.js
const express = require('express');
const { protect, admin } = require('../../middlewares/authMiddleware');
const { 
  createBook, 
  getBooks, 
  getBookById, 
  updateBook, 
  deleteBook 
} = require('./book.controller');

const router = express.Router();

// Public Route: Get all books
router.get('/', getBooks);

// Admin Route: Create a book
// Notice we chain the middleware: First check if logged in (protect), THEN check if admin (admin)
router.post('/', protect, admin, createBook);


// Route: /api/books/:id
// This handles GET, PUT, and DELETE for a specific ID (new syntax using router.route)
// 
router.route('/:id')
  .get(getBookById)                  // Public
  .put(protect, admin, updateBook)   // Admin only
  .delete(protect, admin, deleteBook); // Admin only

module.exports = router;