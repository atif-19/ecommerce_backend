// src/modules/books/book.model.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,// using for faster search
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
      index: true,// using for price range queries
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,// using for category based search
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
// If users often search for "Category" AND "Price" together, we index them together.
// 1 = Ascending, -1 = Descending
bookSchema.index({ category: 1, price: 1 });
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;