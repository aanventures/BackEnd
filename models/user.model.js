const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken"); // Added for token generation

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    unique: true,
    sparse: true, 
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    minLength: [8, "Password should have more than 8 characters"],
    select: false,
  },
  mobile: {
    type: Number,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  otp: Number,
  isVerify: {
    type: Boolean,
    default: false,
  },
  isExpired: Date,
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// FIX: For Async hooks, remove 'next' and just return or finish the function
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper: Compare Password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Helper: Generate JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;