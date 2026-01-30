// src/modules/payments/payment.model.js
const mongoose = require('mongoose');

// we are doing mock payment processing for now
const paymentSchema = new mongoose.Schema(
  {
    // we need orderId to link payment to order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    // user who made the payment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // how much was paid
    amount: {
      type: Number,
      required: true,
    },
    // status of the payment
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    // method used for payment
    paymentMethod: {
      type: String,
      enum: ['STRIPE', 'PAYPAL', 'MOCK'], // 'MOCK' for our testing
      default: 'MOCK',
    },
    // transaction identifier from payment gateway
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;