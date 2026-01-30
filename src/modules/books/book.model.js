// src/modules/books/book.model.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
// Indexes help us search faster later (e.g. searching by title or category)
bookSchema.index({ title: 1 });
bookSchema.index({ category: 1 });

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;