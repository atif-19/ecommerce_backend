// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./utils/db');
const bodyParser = require('body-parser');
// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

// 3. Initialize Express
const app = express();


// 4. Middleware
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
// Parses incoming JSON data from requests (e.g., forms)
app.use(express.json()); 
// Allows cross-origin requests (essential if frontend is on a different port)
app.use(cors());

// Routes
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./modules/users/user.routes'); // <--- Import
app.use('/api/users', userRoutes); 
const bookRoutes = require('./modules/books/book.routes'); // <--- Import
app.use('/api/books', bookRoutes); 


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