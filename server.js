const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const os = require('os')
const fs = require('fs')

const User = require('./models/UserModel')
const helpers = require('./utils/helpers')
const authenticate = require('./middlewares/authenticate')

const https = require('https')

// Load environment variables from .env file
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes

const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const characterRoutes = require('./routes/characterRoutes')
const gameRoutes = require('./routes/gameRoutes')
const arRoutes = require('./routes/arRoutes')
const unrealRoutes = require('./routes/unrealRoutes')
const cvRoutes = require('./routes/cvRoutes')

const platform = os.platform()

app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/characters', authenticate, characterRoutes) // Protect character routes with authentication
app.use('/api/games', authenticate, gameRoutes) // Protect game routes with authentication
app.use('/api/ar', authenticate, arRoutes) // Protect AR routes with authentication
app.use('/api/unreal', authenticate, unrealRoutes) // Protect Unreal Engine routes with authentication
app.use('/api/cv', authenticate, cvRoutes) // Protect CV routes with authentication

// Error handling middleware
const errorHandler = require('./middlewares/errorHandler')
app.use(errorHandler)

const PORT = process.env.PORT || 3001
const REMOTE_URI = process.env.MONGODB_URI
const LOCAL_URI = process.env.LOCAL_MONGODB_URI

const isRemote = false

const MONGODB_URI = isRemote ? REMOTE_URI : LOCAL_URI

mongoose.connect(MONGODB_URI, {})

const connection = mongoose.connection
connection.once('open', async () => {
  console.log('MongoDB connected:', MONGODB_URI)
  console.log('\n')

  const randomPassword = helpers.generateRandomString(10)
  console.log('Admin account password: ' + randomPassword)

  // Create or update the admin account
  await createOrUpdateAdminAccount(randomPassword)
})

const createOrUpdateAdminAccount = async password => {
  try {
    const adminEmail = 'admin' // Define the admin email

    let admin = await User.findOne({ email: adminEmail })
    if (admin) {
      // Update the password if the admin account already exists
      admin.password = password
      await admin.save()
      console.log('Admin account updated with new password.')
    } else {
      // Create a new admin account if it doesn't exist
      admin = new User({
        email: adminEmail,
        isAdmin: true,
        isActive: true,
        password: password
      })
      await admin.save()
      console.log('Admin account created.')
    }
  } catch (error) {
    console.error('Error creating/updating admin account:', error)
  }
}

// Function to get network interfaces
const getNetworkInterfaces = () => {
  const interfaces = os.networkInterfaces()
  const addresses = []

  for (const interfaceName in interfaces) {
    for (const interface of interfaces[interfaceName]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (!interface.internal && interface.family === 'IPv4') {
        addresses.push({
          interface: interfaceName,
          address: interface.address
        })
      }
    }
  }

  return addresses
}

// Function to display server access information
const displayServerInfo = port => {
  const networkInterfaces = getNetworkInterfaces()

  console.log('\n=== SERVER STARTED ===')
  console.log(`Port: ${port}`)
  console.log('\nLocal access:')
  console.log(`  http://localhost:${port}`)
  console.log(`  http://127.0.0.1:${port}`)

  if (networkInterfaces.length > 0) {
    console.log('\nNetwork access:')
    networkInterfaces.forEach(({ interface: interfaceName, address }) => {
      console.log(`  http://${address}:${port} (${interfaceName})`)
    })

    console.log('\nTo test from other devices on your network:')
    console.log('1. Make sure your firewall allows connections on this port')
  } else {
    console.log(
      '\nNo network interfaces found. Server only accessible locally.'
    )
  }

  console.log('======================\n')
}

const isServer = false

let options = {}
if (isServer) {
  if (platform === 'win32') {
    console.log('Running on Windows. Binding to')
    options = {
      key: fs.readFileSync('C:/path/to/privkey.pem'),
      cert: fs.readFileSync('C:/path/to/fullchain.pem')
    }
  }
  if (platform === 'linux') {
    console.log('Running on Linux. Binding to')
    options = {
      key: fs.readFileSync('/home/mel/server/privkey.pem'),
      cert: fs.readFileSync('/home/mel/server/fullchain.pem')
    }
  }

  https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`)
    displayServerInfo(PORT)
  })
} else {
  // Bind to all network interfaces (0.0.0.0) to allow access from other devices on the network
  app.listen(PORT, '0.0.0.0', () => {
    displayServerInfo(PORT)
  })
}
