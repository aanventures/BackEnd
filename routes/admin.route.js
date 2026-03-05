const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')

// Authentication routes
router.post('/signup', adminController.adminSignup)
router.post('/login', adminController.adminLogin)

// Admin management routes
router.get('/', adminController.getAllAdmins)
router.get('/:id', adminController.getAdminById)
router.put('/:id', adminController.updateAdmin)
router.delete('/:id', adminController.deleteAdmin)

module.exports = router
