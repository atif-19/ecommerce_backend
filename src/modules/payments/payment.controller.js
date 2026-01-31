// using mongoose for the ACID transactions
const mongoose = require('mongoose');
// we require all related models here
// payment controller will need to interact with Order and Book models
const Payment = require('./payment.model');
// order for updating order status after payment
const Order = require('../orders/order.model');
// to decrease the stock of books after payment
const Book = require('../books/book.model');

// in every database operation we will pass the session
// whenever we find any error we will abort the transaction it will rollback all operations of database in that session


// @desc    Process a Payment with ACID Transaction
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
  // 2. Start the Session
  const session = await mongoose.startSession();
  // we start the transaction  here in the session
  session.startTransaction();

  try {
    const { orderId, paymentMethod } = req.body;
    // get user from token
    const userId = req.user._id;

    // 3. Find Order (We don't strictly need session for finding, but good practice)
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'PAID') {
      throw new Error('Order is already paid');
    }

    // --- MOCK GATEWAY LOGIC (Simulating a real payment) ---
    // In the future, this is where Stripe logic goes.
    // Let's assume it was successful for now.
    const isSuccess = true; 

    if (!isSuccess) {
      // If payment fails, we just abort and return
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment failed' });
    }

    // 4. Create Payment Record (Pass session!)
    // Note: .create() accepts an array as first arg when using options, 
    // OR we can use new Payment().save({ session })
    const payment = new Payment({
      orderId,
      userId,
      amount: order.totalAmount,
      status: 'SUCCESS',
      paymentMethod: paymentMethod || 'MOCK',
      transactionId: `TRX-${Date.now()}`,
    });
    // saving payment in the current session
    await payment.save({ session });

    // 5. Update Order Status (Pass session!)
    order.status = 'PAID';
    order.paymentId = payment._id;
    // data will be saved in the same session
    await order.save({ session });

    

    


    // 6. REDUCE STOCK (The Critical Part)
    // If this fails (e.g., stock is somehow 0), EVERYTHING above gets undone.
    for (const item of order.items) {
        // finding the book
      const book = await Book.findById(item.bookId).session(session);
      
      // if no book found, throw error to abort transaction
      if (!book) {
        throw new Error(`Book not found: ${item.bookId}`);
      }

      // Double check stock inside the transaction
      if (book.stockQuantity < item.quantity) {
        throw new Error(`Not enough stock for ${book.title}`);
      }

      book.stockQuantity -= item.quantity;
      await book.save({ session });
    }

    // 7. Commit the Transaction (Save everything permanently)
    await session.commitTransaction();
    
    res.status(200).json({ 
      message: 'Payment successful', 
      payment, 
      orderStatus: 'PAID' 
    });

  } catch (error) {
    // 8. If ANY error occurs (Stock low, DB fail), UNDO EVERYTHING
    await session.abortTransaction();
    console.error('Transaction Aborted:', error.message);
    res.status(500).json({ message: error.message || 'Payment Process Failed' });
  } finally {
    // 9. Always end the session even if transaction succeeded or failed
    session.endSession();
  }
};
module.exports = { processPayment };