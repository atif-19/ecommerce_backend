// src/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // We create a token that contains the user's ID
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE, // Token lasts for 30 days
  });
};

module.exports = generateToken;