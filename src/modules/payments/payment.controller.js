// using mongoose for the ACID transactions
const mongoose = require('mongoose');
// we require all related models here
// payment controller will need to interact with Order and Book models
const Payment = require('./payment.model');
// order for updating order status after payment
const Order = require('../orders/order.model');
// to decrease the stock of books after payment
const Book = require('../books/book.model');
// We use this to generate/verify real signatures (for mock razorpay simulation we use this)
const crypto = require('crypto'); 



// in every database operation we will pass the session
// whenever we find any error we will abort the transaction it will rollback all operations of database in that session


// @desc    Step 1: Create Mock Order
// @route   POST /api/payments/create-order
//  @access  Private
// This is just to simulate order creation in payment gateway
// In real scenario, we would call Stripe or PayPal API here

const createRazorpayOrder = async (req, res) => {
  try {
    // get orderId from request body
    const { orderId } = req.body;
    
    // find if  the order exists or not
    const order = await Order.findById(orderId);
    // order does not exist
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 1. Generate Mock IDs
    const mockOrderId = `order_mock_${Date.now()}`;
    const mockPaymentId = `pay_fake_${Date.now()}`;
    const amountInPaisa = Math.round(order.totalAmount * 100);

    // 2. Generate the Signature RIGHT HERE (Automated)
    const body = mockOrderId + "|" + mockPaymentId;
    const mockSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // 3. Send everything back so you can just copy-paste!
    res.status(200).json({
      id: mockOrderId,
      currency: "INR",
      amount: amountInPaisa,
      // We send these strictly for testing convenience:
      mock_payment_id: mockPaymentId,
      mock_signature: mockSignature 
    });
    // --- MOCK LOGIC ENDS ---
} catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Step 2: Verify Mock Payment & Reduce Stock (ACID Transaction)
// @route   POST /api/payments/verify

const verifyRazorpayPayment = async (req, res) => {
    // start a mongoose session for transaction
    // if something goes wrong we just abort the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // getting all required fields for payment from body
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    // --- 1. SECURITY CHECK (Real HMAC Verification) ---
    // we use HMAC with SHA256 to verify the signature
    // Logic: The signature must be the Hash of (Order ID + "|" + Payment ID)

    // we create the expected signature on our server
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    // using crypto to create HMAC SHA256 hash
    const expectedSignature = crypto // using our PAYMENT_KEY_SECRET to create the hash
      .createHmac('sha256', process.env.PAYMENT_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    console.log("Expected:", expectedSignature);
    console.log("Received:", razorpay_signature);
    // if signatures do not match, possible hack attempt
    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid Payment Signature (Hack Attempt)' });
    }

    // --- 2. DATABASE UPDATES (ACID) ---
    // getting userId from req.user set by jwt middleware
    const userId = req.user._id;

    // Create Payment Record
    const payment = new Payment({
      orderId,
      userId,
      amount: 0, // Placeholder
      status: 'SUCCESS',
      paymentMethod: 'MOCK_RAZORPAY',
      transactionId: razorpay_payment_id,
    }); // this is acid transaction so we pass session
    await payment.save({ session });

    // Update Order
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');
    
    if (order.status === 'PAID') {
        throw new Error('Order already paid');
    }

    order.status = 'PAID';
    order.paymentId = payment._id;
    await order.save({ session });

    // Reduce Stock
    for (const item of order.items) {
      // database operation with session
      const book = await Book.findById(item.bookId).session(session);
      if (book.stockQuantity < item.quantity) {
        // transaction will be aborted in catch block
        throw new Error(`Not enough stock for ${book.title}`);
      }
      book.stockQuantity -= item.quantity;
      await book.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json({ message: 'Payment verified and Order processed' });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    // we always end the session even if commit or abort
    session.endSession();
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };