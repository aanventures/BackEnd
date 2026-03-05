const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

// Authentication routes
router.post('/signup', userController.userSignup)
router.post('/login', userController.userLogin)

// Regular CRUD routes
router.post('/', userController.createUser)
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUserById)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)
router.post('/mobile-login', userController.mobileLogin)

module.exports = router
