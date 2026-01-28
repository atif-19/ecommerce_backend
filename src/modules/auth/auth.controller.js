// src/modules/auth/auth.controller.js
const User = require('../users/user.model');
const generateToken = require('../../utils/generateToken'); // <--- Add this
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // 1. Extract data from the request body
    const { name, email, password } = req.body;

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create the user
    // The .create() method triggers the 'save' hook we wrote earlier to hash the password
    const user = await User.create({
      name,
      email,
      password,
    });

    // 4. Send back a response
    if (user) {
      // 201 means "Created"
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'User registered successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // If something goes wrong (like DB connection fail), send 500 error
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password');

    // Note: We used select('+password') because we set select: false in the model

    // 2. Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id), // <--- Send the token!
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { registerUser , loginUser };