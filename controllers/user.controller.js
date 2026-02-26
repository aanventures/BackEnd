const User = require('../models/user.model')

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

