const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authenticate = require('../middlewares/authenticate')
const checkAdmin = require('../middlewares/checkAdmin')

// Get all users (Admin only)
router.get('/', authenticate, checkAdmin, userController.getAllUsers)

// Get all doctors
router.get('/doctors', authenticate, userController.getDoctors)

// Get user by ID (Authenticated users)
router.get('/:id', authenticate, userController.getUserById)

// Create a new user (Admin only)
router.post('/', authenticate, checkAdmin, userController.createUser)

// Update a user (Admin only)
router.put('/:id', authenticate, checkAdmin, userController.updateUser)

// Delete a user (Admin only)
router.delete('/:id', authenticate, checkAdmin, userController.deleteUser)

// Forgot password
router.post('/forgot-password', userController.forgotPassword)

// Reset password
router.post('/reset-password/:token', userController.resetPassword)

// Verify code
router.get('/verify-code/:token', userController.verifyCode)

module.exports = router
