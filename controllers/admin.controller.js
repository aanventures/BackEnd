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

// Admin Signup
exports.adminSignup = async (req, res) => {
	try {
		const { name, email, password, mobile } = req.body

		// Validate required fields
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide name, email, and password'
			})
		}

		// Check if admin already exists
		const existingAdmin = await User.findOne({ email, role: 'admin' })
		if (existingAdmin) {
			return res.status(400).json({
				success: false,
				message: 'Admin already exists with this email'
			})
		}

		// Create new admin with role 'admin'
		const admin = await User.create({
			name,
			email,
			password,
			mobile,
			role: 'admin',
			avatar: {
				public_id: 'default',
				url: 'default-avatar-url'
			}
		})

		// Generate token
		const token = generateToken(admin._id, admin.role)

		// Return response
		res.status(201).json({
			success: true,
			message: 'Admin registered successfully',
			token,
			user: {
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role
			}
		})
	} catch (err) {
		res.status(400).json({ success: false, message: err.message })
	}
}

// Admin Login
exports.adminLogin = async (req, res) => {
	try {
		const { email, password } = req.body

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Please provide email and password'
			})
		}

		// Find admin and include password field
		const admin = await User.findOne({ email }).select('+password')

		// Check if admin exists
		if (!admin) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			})
		}

		// Check if user role is 'admin'
		if (admin.role !== 'admin') {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials or you are not an admin'
			})
		}

		// Compare password
		const isPasswordMatch = await admin.comparePassword(password)
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password'
			})
		}

		// Generate token
		const token = generateToken(admin._id, admin.role)

		// Return response
		res.status(200).json({
			success: true,
			message: 'Admin login successful',
			token,
			user: {
				id: admin._id,
				name: admin.name,
				email: admin.email,
				role: admin.role
			}
		})
	} catch (err) {
		res.status(500).json({ success: false, message: err.message })
	}
}

// Get all admins (optional)
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
