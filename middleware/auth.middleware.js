const jwt = require('jsonwebtoken')

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token']

		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'No token provided. Please login first.'
			})
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key')
		req.user = decoded
		next()
	} catch (err) {
		res.status(401).json({
			success: false,
			message: 'Invalid or expired token'
		})
	}
}

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({
			success: false,
			message: 'Access denied. Admin privileges required.'
		})
	}
	next()
}

// Middleware to check if user is a regular user
exports.isUser = (req, res, next) => {
	if (!req.user || req.user.role !== 'user') {
		return res.status(403).json({
			success: false,
			message: 'Access denied. User privileges required.'
		})
	}
	next()
}
