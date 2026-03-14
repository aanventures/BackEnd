const User = require("../models/user.model");
const { sendToken } = require("../utils/sendToken");

/**
 * UNIFIED AUTHENTICATION
 * Handles: Google Login, Mobile+OTP (Login/Signup), and Email+Password (Login/Signup)
 */
exports.authenticate = async (req, res) => {
  try {
    const { name, email, password, mobile, otp, googleId, avatarUrl, role } =
      req.body;
    let user;
    let message = "";

    // --- CASE 1: GOOGLE AUTHENTICATION ---
    if (googleId) {
      user = await User.findOne({ $or: [{ googleId }, { email }] });
      if (user) {
        if (!user.googleId) user.googleId = googleId;
        await user.save();
        message = "Google login successful";
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          isVerify: true,
          role: role || "user",
          avatar: { public_id: "google", url: avatarUrl || "default-url" },
        });
        message = "Google registration successful";
      }
    }

    // --- CASE 2: MOBILE + OTP AUTHENTICATION ---
    else if (mobile && otp) {
      const expectedOtp = process.env.DEFAULT_OTP || "9999";
      if (otp !== expectedOtp) {
        return res.status(401).json({ success: false, message: "Invalid OTP" });
      }

      user = await User.findOne({ mobile });
      if (!user) {
        user = await User.create({
          name: name || `User_${mobile.toString().slice(-4)}`,
          mobile,
          isVerify: true,
          role: role || "user",
        });
        message = "Mobile registration successful";
      } else {
        message = "Mobile login successful";
      }
    }

    // --- CASE 3: EMAIL + PASSWORD AUTHENTICATION ---
    else if (email && password) {
      user = await User.findOne({ email }).select("+password");

      if (user) {
        if (!user.password) {
          return res.status(401).json({
            success: false,
            message: "Please login via Google or Mobile for this account",
          });
        }
        const isMatched = await user.comparePassword(password);
        if (!isMatched)
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
        message = "Login successful";
      } else {
        if (!name)
          return res
            .status(400)
            .json({ success: false, message: "Name is required for signup" });
        user = await User.create({
          name,
          email,
          password,
          mobile,
          role: role || "user",
        });
        message = "Registration successful";
      }
    }

    // --- NO VALID AUTH METHOD ---
    else {
      return res.status(400).json({
        success: false,
        message: "Provide Google ID, Mobile/OTP, or Email/Password",
      });
    }

    // Determine status: 201 for New, 200 for Existing
    const statusCode =
      user.createdAt.getTime() === user.updatedAt.getTime() ? 201 : 200;
    sendToken(user, statusCode, res, message);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Logged In User Details
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by the isAuthenticatedUser middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout User
exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
};

/**
 * ADMIN & USER MANAGEMENT
 */

// Get all users (Admin only usually)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if (req.body.password) delete req.body.password; // Prevent password update here
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
