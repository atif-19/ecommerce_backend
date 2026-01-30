const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');


const protect = async (req, res, next) => {
  let token;

  // 1. Check if the header has "Authorization" and starts with "Bearer"
  // Format: "Bearer eyJhbGciOiJIUzI1Ni..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the string (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Decode the token to get the User ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the DB (exclude password)
      // We attach the user to the request object so the Controller can use it
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next function (the Controller)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect , admin};