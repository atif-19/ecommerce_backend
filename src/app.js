// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./utils/db');
const bodyParser = require('body-parser');


// --- NEW SECURITY IMPORTS ---
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// after establishing DB connection let's use security middlewares

// 3. Initialize Express
const app = express();

// 4. Middleware
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
// Parses incoming JSON data from requests (e.g., forms)
app.use(express.json()); 
// Allows cross-origin requests (essential if frontend is on a different port)
app.use(cors());


// --- SECURITY MIDDLEWARE's---
// 1. Set Security Headers
app.use(helmet());

// 2. Body Parser (Reading JSON)
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb to prevent crashes

// 3. Data Sanitization against NoSQL Injection
// app.use(mongoSanitize({ replaceWith: "_" }));


// 5. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes',
});

app.use('/api', limiter); // Apply to all API routes
// 6. Prevent Parameter Pollution
app.use(hpp());



// Routes
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./modules/users/user.routes'); // <--- Import
app.use('/api/users', userRoutes); 
const bookRoutes = require('./modules/books/book.routes'); // <--- Import
app.use('/api/books', bookRoutes); 
const cartRoutes = require('./modules/cart/cart.routes'); // <--- Import
app.use('/api/cart', cartRoutes);
const orderRoutes = require('./modules/orders/order.routes'); // <--- Import
app.use('/api/orders', orderRoutes); // <--- Add this
const paymentRoutes = require('./modules/payments/payment.routes'); // <--- Import
app.use('/api/payments', paymentRoutes);
// Note: We are mapping it to /api/books. 
// So the POST request will be to /api/books (which matches the code logic), 
// even though your spec said /api/admin/books.
// Keeping it under /api/books is cleaner REST API design since books are a resource.



// 5. Basic Route (Test if server is working)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

