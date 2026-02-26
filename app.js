const express = require('express')
const app = express()

app.use(express.json())

// Routes
const userRoutes = require('./routes/user.route')
const propertyRoutes = require('./routes/property.route')
const blogRoutes = require('./routes/blog.route')

app.use('/api/users', userRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/blogs', blogRoutes)

// 404 handler
app.use((req, res, next) => {
	res.status(404).json({ success: false, message: 'Not Found' })
})

// Error handler
app.use((err, req, res, next) => {
	console.error(err)
	res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' })
})

module.exports = app
