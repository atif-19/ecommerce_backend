// src/modules/users/user.controller.js

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
  // Because our middleware ran first, we have access to req.user!
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };

  res.status(200).json(user);
};

module.exports = { getUserProfile };