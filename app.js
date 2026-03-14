const express = require('express')
const cors = require("cors")
// Routes
const userRoutes = require('./routes/user.route')
const propertyRoutes = require('./routes/property.route')
const blogRoutes = require('./routes/blog.route');
const cookieParser = require('cookie-parser');
const app = express()

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,              
    optionsSuccessStatus: 200        
};

// 2. Use CORS middleware before your routes
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser());




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
