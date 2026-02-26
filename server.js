const dotenv = require('dotenv')
const path = require('path')
const mongoose = require('mongoose')

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = require('./app')

let server

async function startServer(port = process.env.PORT || 3000) {
	try {
		if (process.env.MONGO_URI) {
			await mongoose.connect(process.env.MONGO_URI, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			})
			console.log('MongoDB connected')
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
