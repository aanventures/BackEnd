const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// One API for everyone
router.post('/auth', userController.authenticate);
router.get('/logout', userController.logout); 
router.get('/me', verifyToken, userController.getUserProfile);
// Add this: Get currently logged in user details

// Management
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;