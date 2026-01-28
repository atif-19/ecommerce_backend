// src/modules/users/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'], // [Validation rule, Error message]
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // No two users can have the same email
      lowercase: true, // "User@Gmail.com" becomes "user@gmail.com"
      trim: true, // Removes spaces from start/end
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Important: Don't return the password by default when querying users
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'], // Can only be one of these two values
      default: 'USER',
    }, 
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// 2. Encrypt password before saving
// This function runs automatically BEFORE (.pre) the user is saved to the DB
userSchema.pre('save', async function (next) {
  // If the password hasn't been changed (e.g. we are just updating the name), skip hashing
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a "salt" (random data to make the hash unique)
  const salt = await bcrypt.genSalt(10);
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);

});

// 3. Method to compare entered password with hashed password
// We will use this later during Login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// 4. Export the Model
const User = mongoose.model('User', userSchema);
module.exports = User;