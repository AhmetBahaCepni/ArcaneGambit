const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET
const emailService = require('../middlewares/emailService')
const RecoveryToken = require('../models/RecoveryTokenModel')
const bcrypt = require('bcryptjs')

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new user
exports.createUser = async (req, res) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    // Create a new user
    const user = new User(req.body)
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.register = async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if the username or email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    // Create a new user as inactive
    const user = new User({ email, password, isActive: false })
    await user.save()

    // Generate a verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString()
    const expirationTime = new Date(Date.now() + 90 * 60 * 1000) // 90 minutes from now

    // Save the recovery token
    const recoveryToken = new RecoveryToken({
      userId: user._id,
      token: verificationCode,
      expiresAt: expirationTime
    })
    await recoveryToken.save()

    // Send the verification code to the user's email
    await emailService.sendEmail({
      to: email,
      subject: 'Account Verification',
      text: `Your verification code is: ${verificationCode}. It will expire in 90 minutes.`
    })

    res
      .status(201)
      .json({
        message: 'User registered successfully. Please verify your email.'
      })

    // Schedule account deletion if not activated
    setTimeout(async () => {
      const tokenExists = await RecoveryToken.findOne({ userId: user._id })
      if (tokenExists) {
        await User.findByIdAndDelete(user._id)
        await RecoveryToken.deleteOne({ userId: user._id })
      }
    }, 15 * 60 * 1000) // 15 minutes
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

exports.activateAccount = async (req, res) => {
  const { token } = req.params
  const { email } = req.query
  // request : 

  try {
    // Validate the token
    const recoveryToken = await RecoveryToken.findOne({ token })
    if (!recoveryToken) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    const user = await User.findById(recoveryToken.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if the email matches
    if (user.email !== email) {
      return res.status(400).json({ message: 'Invalid email' })
    }

    // Activate the user account
    user.isActive = true
    await user.save()

    // Remove the used recovery token from the database
    await RecoveryToken.deleteOne({ token })
    res.status(200).json({ message: 'Account activated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    if (!updatedUser) return res.status(404).json({ message: 'User not found' })
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)
    if (!deletedUser) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const validateRecoveryToken = async token => {
  try {
    const recoveryToken = await RecoveryToken.findOne({ token })
    if (!recoveryToken) {
      return { isValid: false, error: 'Invalid or expired token' }
    }
    return { isValid: true, userId: recoveryToken.userId }
  } catch (error) {
    return { isValid: false, error: error.message }
  }
}

const generateRecoveryToken = async userId => {
  let token
  let tokenExists = true

  // Generate a unique 6-digit token
  while (tokenExists) {
    token = Math.floor(100000 + Math.random() * 900000).toString()
    tokenExists = await RecoveryToken.findOne({ token })
  }

  // Create a new recovery token document
  const recoveryToken = new RecoveryToken({
    userId,
    token
  })

  // Save the token to the database
  await recoveryToken.save()

  return token
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const token = await generateRecoveryToken(user._id)

    await emailService.sendEmail({
      to: email,
      subject: 'Password Reset',
      text: `Your recovery token is: ${token}. `
    })

    res.status(200).json({ message: 'Password reset token sent to your email' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.resetPassword = async (req, res) => {
  const { token } = req.params
  const { newPassword } = req.body

  try {
    const { isValid, userId, error } = await validateRecoveryToken(token)
    if (!isValid) {
      return res.status(400).json({ message: error })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = newPassword
    await user.save()

    // Remove the used recovery token from the database
    await RecoveryToken.deleteOne({ token })

    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.verifyCode = async (req, res) => {
  const { token } = req.params
  const { email } = req.query
  const { newPassword } = req.body

  try {
    const { isValid, userId, error } = await validateRecoveryToken(token)
    if (!isValid) {
      return res.status(400).json({ message: error })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // if user.email !== email return error
    if (user.email !== email) {
      return res.status(400).json({ message: 'Invalid email' })
    }

    res.status(200).json({ message: 'Code is valid and is for that email.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
