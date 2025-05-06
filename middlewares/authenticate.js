const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' })
  }

  const token = authHeader.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id })

    if (!user) {
      throw new Error()
    }

    req.userId = user._id
    req.userRole = user.isAdmin ? 'admin' : 'doctor' // Set the user's role
    req.userProjects = user.projects // Set the user's projects
    next()
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' })
  }
}

module.exports = authenticate
