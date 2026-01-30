// src/modules/books/book.controller.js
const Book = require('./book.model');

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Private/Admin

// function to check wether the book already exists can be added later
const bookExists = async (title) => {
  const book = await Book.findOne({ title });
  return !!book;
}

const createBook = async (req, res) => {
  try {
    const { title, author, description, price, category, stockQuantity } = req.body;

    if(await bookExists(title)) {
      return res.status(400).json({ message: 'Book already exists' });
    }

    const book = await Book.create({
      title,
      author,
      description,
      price,
      category,
      stockQuantity,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get books with Search, Category, and Price filters
// @route   GET /api/books?keyword=Harry&category=Fiction&minPrice=10&maxPrice=50
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    // 1. Build the Query Object
    let query = { isActive: true };

    // 2. Add Search Logic (if keyword exists)
    if (keyword) {
      query.title = {
        $regex: keyword,
        $options: 'i', // Case insensitive
      };
    }

    // 3. Add Category Logic (if category exists)
    if (category) {
      query.category = category;
    }

    // 4. Add Price Range Logic (if min or max price exists)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice); // Greater than or equal
      if (maxPrice) query.price.$lte = Number(maxPrice); // Less than or equal
    }

    // 5. Execute the Query
    const books = await Book.find(query);

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
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
createBook, 
  getBooks, 
  getBookById, 
  updateBook, 
  deleteBook };