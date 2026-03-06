const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "your_secret_key", {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// User Login with Mobile and OTP
exports.mobileLogin = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        // Pull defaults from .env
        const expectedMobile = process.env.DEFAULT_MOBILE || '9999999999';
        const expectedOtp = process.env.DEFAULT_OTP || '9999';

        // Check against the hardcoded/env values
        if (mobile !== expectedMobile || otp !== expectedOtp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Mobile or OTP'
            });
        }

        // Find user by mobile to generate a real JWT
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this mobile number'
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

<<<<<<< HEAD
// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
=======
// Generic Signup function
exports.signup = async (req, res) => {
	try {
		const { name, email, password, mobile, role = 'user' } = req.body
>>>>>>> 800594d (seprate admin login removed)

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

<<<<<<< HEAD
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user with role 'user'
    const user = await User.create({
      name,
      email,
      password,
      mobile,
      role: "user",
      avatar: {
        public_id: "default",
        url: "default-avatar-url",
      },
    });
=======
		// Validate role
		if (!['user', 'admin'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role. Must be either "user" or "admin"'
			})
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists with this email'
			})
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
			mobile,
			role,
			avatar: {
				public_id: 'default',
				url: 'default-avatar-url'
			}
		})
>>>>>>> 800594d (seprate admin login removed)

    // Generate token
    const token = generateToken(user._id, user.role);

<<<<<<< HEAD
    // Return response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
=======
		// Return response
		res.status(201).json({
			success: true,
			message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err.message })
	}
}

// Generic Login function
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body
>>>>>>> 800594d (seprate admin login removed)

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

<<<<<<< HEAD
    // Check if user role is 'user'
    if (user.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
=======
		// Compare password
		const isPasswordMatch = await user.comparePassword(password)
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			})
		}
>>>>>>> 800594d (seprate admin login removed)

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User Signup (defaults to user role)
exports.userSignup = async (req, res) => {
	req.body.role = 'user'
	return exports.signup(req, res)
}

// Admin Signup
exports.adminSignup = async (req, res) => {
	req.body.role = 'admin'
	return exports.signup(req, res)
}

// User Login (will work for both users and admins)
exports.userLogin = async (req, res) => {
	return exports.login(req, res)
}

// Admin Login (same as user login, but can be used for clarity)
exports.adminLogin = async (req, res) => {
	return exports.login(req, res)
}

// Create a new user
exports.createUser = async (req, res) => {
	try {
		const { name, email, password, mobile } = req.body
		const user = await User.create({ name, email, password, mobile })
		res.status(201).json({ success: true, data: user })
	} catch (err) {
		res.status(400).json({ success: false, message: err.message })
	}
}

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user by id
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password; // prefer separate password endpoint
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
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

// Delete user by id
exports.deleteUser = async (req, res) => {
<<<<<<< HEAD
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
=======
	try {
		const user = await User.findByIdAndDelete(req.params.id)
		if (!user) return res.status(404).json({ success: false, message: 'User not found' })
		res.status(200).json({ success: true, message: 'User deleted' })
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Admin-specific functions

// Get all admins
exports.getAllAdmins = async (req, res) => {
	try {
		const admins = await User.find({ role: 'admin' })
		res.status(200).json({
			success: true,
			count: admins.length,
			data: admins
		})
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Get admin by id
exports.getAdminById = async (req, res) => {
	try {
		const admin = await User.findById(req.params.id)

		// Check if user exists and is an admin
		if (!admin || admin.role !== 'admin') {
			return res.status(404).json({
				success: false,
				message: 'Admin not found'
			})
		}

		res.status(200).json({ success: true, data: admin })
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Update admin by id
exports.updateAdmin = async (req, res) => {
	try {
		const updates = req.body
		if (updates.password) delete updates.password // prefer separate password endpoint
		if (updates.role) delete updates.role // prevent role change

		const admin = await User.findByIdAndUpdate(req.params.id, updates, {
			new: true,
			runValidators: true
		})

		// Check if user exists and is an admin
		if (!admin || admin.role !== 'admin') {
			return res.status(404).json({
				success: false,
				message: 'Admin not found'
			})
		}

		res.status(200).json({ success: true, data: admin })
	} catch (err) {
		res.status(400).json({ success: false, message: err.message })
	}
}

// Delete admin by id
exports.deleteAdmin = async (req, res) => {
	try {
		const admin = await User.findById(req.params.id)

		// Check if user exists and is an admin
		if (!admin || admin.role !== 'admin') {
			return res.status(404).json({
				success: false,
				message: 'Admin not found'
			})
		}

		await User.findByIdAndDelete(req.params.id)
		res.status(200).json({
			success: true,
			message: 'Admin deleted successfully'
		})
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}
>>>>>>> 800594d (seprate admin login removed)
