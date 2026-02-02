// src/modules/books/book.controller.js
const Book = require('./book.model');

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Private/Admin


const createBooks = async (req, res) => {
  try {
    // Expecting an array of books in the request body
    const { books } = req.body;

    // no books provided
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: "Books array is required" });
    }

    // getting titles of the each book
    const titles = books.map((b) => b.title);

    // Check for existing books with the same titles
    const existingBooks = await Book.find({
      title: { $in: titles }
    });
    // whatever book already exists, we will not add those
    if (existingBooks.length > 0) {
      return res.status(400).json({
        message: "Some books already exist",
        existingTitles: existingBooks.map(b => b.title)
      });
    }
    // Create books in bulk
    const createdBooks = await Book.insertMany(books);

    // adding success response
    res.status(201).json({
      message: "Books added successfully",
      count: createdBooks.length,
      books: createdBooks
    });

  } catch (error) {
    // if something goes wrong return the error message
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get books with Search, Category, and Price filters
// @route   GET /api/books?keyword=Harry&category=Fiction&minPrice=10&maxPrice=50
// @access  Public
const getBooks = async (req, res) => {
  try {
    // 1. Filtering
    // we extract the query parameters
    const queryObj = { ...req.query };
    // exclude special fields from filtering so that we can handle them separately
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    
    // Loop through and delete the special fields from our copy
    excludedFields.forEach(el => delete queryObj[el]);

    // convert queryObj to string to add $ to gte, lte etc for mongoose
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // we will build the query step by step\
    // this is the basic query with filters
    let query = Book.find(JSON.parse(queryStr));

    // 2. Sorting

    // if sort parameter is present in the query
    if (req.query.sort) {
      // we will sort by multiple fields if comma separated
      const sortBy = req.query.sort.split(',').join(' ');
      // apply the sort to the query (e.g. ?sort=price,-rating)
      query = query.sort(sortBy);
    } else {
      // if no sort is provided, sort by createdAt descending
      query = query.sort('-createdAt'); // Default
    }

    // 3. Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);

    // 4. Searching
    if (req.query.keyword) {
      // apply regex search on title field
      query = query.find({
         title: { $regex: req.query.keyword, $options: 'i' }
      });
    }

    // EXECUTE
    const books = await query;

    res.json({ count: books.length, data: books });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    // If the ID format is wrong (e.g. not a valid ObjectId), send 404
    res.status(404).json({ message: 'Book not found' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const { title, author, description, price, category, stockQuantity, isActive } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      // Update fields only if they are provided in the request
      book.title = title || book.title;
      book.author = author || book.author;
      book.description = description || book.description;
      book.price = price || book.price;
      book.category = category || book.category;
      book.stockQuantity = stockQuantity !== undefined ? stockQuantity : book.stockQuantity;
      book.isActive = isActive !== undefined ? isActive : book.isActive;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.deleteOne(); // Removes the document from DB
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
createBooks, 
  getBooks, 
  getBookById, 
  updateBook, 
  deleteBook };