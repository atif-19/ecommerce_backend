// src/modules/orders/order.controller.js

// we require all three for placing the order
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Book = require('../books/book.model');

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // Get user ID from the authenticated user we get this from jwt token
    const userId = req.user._id;

    // 1. Get the user's cart
    // We populate bookId to get book details like price,name etc.
    const cart = await Cart.findOne({ userId }).populate('items.bookId');

    // if cart is empty then return 
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    // 2. Calculate Total Amount & Format Items
    // We calculate this on the server to prevent fraud
    let totalAmount = 0;
    const orderItems = [];

    // simple for loop to calculate total and prepare order items
    for (const item of cart.items) {
      const book = item.bookId; // This is the full book document thanks to populate

      // CHECK: Is there enough stock?
      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for '${book.title}'. Only ${book.stockQuantity} left.` 
        });
      }
      
      // Calculate item total
      totalAmount += book.price * item.quantity;

      // Add to order array
      orderItems.push({
        bookId: book._id,
        quantity: item.quantity,
        priceAtPurchase: book.price, // Snapshot of the price
      });
    }

    // 3. Create the Order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      // initial status in pending
      status: 'PENDING',
    });
    // 4. Clear the Cart (User has "bought" the items)
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
// function to get orders of logged in user
const getMyOrders = async (req, res) => {
  try {
    // it sort by latest orders first according to the time
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    // Populate the book details inside the order items
    // this populate method fetches user name and email also 
    //  think of it as like we give userId then it gets name and email from user collection
    const order = await Order.findById(req.params.id).populate(
      'userId',
      'name email' /// same for the items.bookId below
    ).populate('items.bookId', 'title category');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// exporting the functions
module.exports = { createOrder, getMyOrders, getOrderById };