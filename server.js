const dotenv = require('dotenv')
const path = require('path')
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose')

// Load environment variables from .env in project root
dotenv.config({ path: path.join(__dirname, '.env') })

const app = require('./app')
const console = require('console')

let server
console.log('Starting server...', { env: process.env.NODE_ENV, port: process.env.PORT })
async function startServer(port = process.env.PORT || 3000) {
	try {
		// connect to mongo via config helper
		if (process.env.MONGO_URI) {
			const connectDB = require('./config/db');
			await connectDB(process.env.MONGO_URI);
		} else {
			throw new Error('MONGO_URI must be provided');
		}

		server = app.listen(port, () => {
			console.log(`Server running on port ${port}`)
		})

		// Graceful shutdown on SIGTERM
		process.on('SIGTERM', () => {
			console.info('SIGTERM received. Shutting down gracefully')
			if (server) server.close(() => process.exit(0))
		})

		// Handle unhandled promise rejections
		process.on('unhandledRejection', (err) => {
			console.error('Unhandled Rejection:', err)
			if (server) server.close(() => process.exit(1))
		})

		return server
	} catch (err) {
		console.error('Failed to start server:', err)
		throw err
	}
}

if (require.main === module) {
	startServer().catch((err) => process.exit(1))
}

module.exports = { startServer }
