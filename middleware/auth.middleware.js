const jwt = require('jsonwebtoken');

// Middleware to verify JWT token from Cookies
exports.verifyToken = (req, res, next) => {
    try {
        // Look for token in cookies first, then headers as a fallback
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Login session expired. Please login again.'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        // Attach user info to the request object
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session'
        });
    }
}

// Middleware to check Admin role
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
}