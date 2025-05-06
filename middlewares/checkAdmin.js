const User = require('../models/UserModel')

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = checkAdmin
