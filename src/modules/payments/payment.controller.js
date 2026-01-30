// we require all related models here
// payment controller will need to interact with Order and Book models
const Payment = require('./payment.model');
// order for updating order status after payment
const Order = require('../orders/order.model');
// to decrease the stock of books after payment
const Book = require('../books/book.model');

// @desc    Process a Payment
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    // we get userId from the authenticated user
    const userId = req.user._id;
    // 1. Find the Order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Check if already paid
    if (order.status === 'PAID') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // 3. Create a Payment Record (Status: PENDING)
    const payment = await Payment.create({
      orderId,
      userId,
      amount: order.totalAmount,
      status: 'PENDING',
      paymentMethod: paymentMethod || 'MOCK',
    });

    // --- MOCK PAYMENT GATEWAY LOGIC ---
    // In real , here we will call Stripe.charge()
    // For now, we simulate a 100% success rate

    const isSuccess = true;

    if (isSuccess) {
      // 4. Update Payment Status
      payment.status = 'SUCCESS';
      payment.transactionId = `MOCK_TRX_${Date.now()}`;
      await payment.save();

      // 5. Update Order Status
      order.status = 'PAID';
      order.paymentId = payment._id;
      await order.save();

      // 6. REDUCE STOCK (Inventory Management)
      // We loop through every item in the order and subtract quantity
      for (const item of order.items) {
        const book = await Book.findById(item.bookId);
        if (book) {
          book.stockQuantity -= item.quantity;
          await book.save();
        }
      }

      res.status(200).json({ 
        message: 'Payment successful', 
        payment, 
        orderStatus: 'PAID' 
      });
      } else {
      payment.status = 'FAILED';
      await payment.save();
      res.status(400).json({ message: 'Payment failed' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { processPayment };