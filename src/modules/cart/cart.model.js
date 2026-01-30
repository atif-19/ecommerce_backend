// src/modules/cart/cart.model.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [
      {

        //We use ref: 'Book'. This is powerful. It allows us to automatically "pull in" the book's title, price, and image when we look at the cart, so we don't have to save all that info inside the cart itself.
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;