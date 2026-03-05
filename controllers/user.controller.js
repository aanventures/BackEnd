const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

// Generate JWT Token
const generateToken = (id, role) => {
	return jwt.sign(
		{ id, role },
		process.env.JWT_SECRET || 'your_secret_key',
		{ expiresIn: process.env.JWT_EXPIRE || '7d' }
	)
}

// User Signup
exports.userSignup = async (req, res) => {
	try {
		const { name, email, password, mobile } = req.body

		// Validate required fields
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide name, email, and password'
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

		// Create new user with role 'user'
		const user = await User.create({
			name,
			email,
			password,
			mobile,
			role: 'user',
			avatar: {
				public_id: 'default',
				url: 'default-avatar-url'
			}
		})

		// Generate token
		const token = generateToken(user._id, user.role)

		// Return response
		res.status(201).json({
			success: true,
			message: 'User registered successfully',
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

// User Login
exports.userLogin = async (req, res) => {
	try {
		const { email, password } = req.body

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password'
			})
		}

		// Find user and include password field
		const user = await User.findOne({ email }).select('+password')

		// Check if user exists
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			})
		}

		// Check if user role is 'user'
		if (user.role !== 'user') {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials'
			})
		}

		// Compare password
		const isPasswordMatch = await user.comparePassword(password)
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			})
		}

		// Generate token
		const token = generateToken(user._id, user.role)

		// Return response
		res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		})
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
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
		const users = await User.find()
		res.status(200).json({ success: true, count: users.length, data: users })
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Get single user by id
exports.getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('+password')
		if (!user) return res.status(404).json({ success: false, message: 'User not found' })
		res.status(200).json({ success: true, data: user })
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Update user by id
exports.updateUser = async (req, res) => {
	try {
		const updates = req.body
		if (updates.password) delete updates.password // prefer separate password endpoint
		const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
		if (!user) return res.status(404).json({ success: false, message: 'User not found' })
		res.status(200).json({ success: true, data: user })
	} catch (err) {
		res.status(400).json({ success: false, message: err.message })
	}
}

// Delete user by id
exports.deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)
		if (!user) return res.status(404).json({ success: false, message: 'User not found' })
		res.status(200).json({ success: true, message: 'User deleted' })
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

