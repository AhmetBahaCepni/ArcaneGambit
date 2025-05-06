const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/UserModel')

exports.register = async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = new User({ email, password })
    await user.save()

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })
    res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })
    res.json({ token, isAdmin: user.isAdmin, projects: user.projects })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
