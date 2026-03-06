const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// Authentication routes (works for both users and admins based on role)
router.post('/signup', userController.signup)
router.post('/login', userController.login)

// Admin management routes
router.get('/admin', userController.getAllAdmins)
router.get('/admin/:id', userController.getAdminById)
router.put('/admin/:id', userController.updateAdmin)
router.delete('/admin/:id', userController.deleteAdmin)

// Regular CRUD routes
router.post('/', userController.createUser)
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)
router.post('/mobile-login', userController.mobileLogin)

module.exports = router
