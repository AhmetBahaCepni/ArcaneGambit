const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/UserModel')
const secretKey = process.env.JWT_SECRET;

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
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is not activated. Please verify your email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })


    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
