# Game Backend API

A Node.js/Express backend API for a multiplayer game system with character management, game sessions, and real-time state updates. Supports integration with Unreal Engine, AR applications, and computer vision features.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with admin roles
- **Character Management** - Create and manage game characters with stats
- **Game Sessions** - Create/join game sessions with room codes
- **Real-time Game State** - Update character states and game progression
- **Unreal Engine Integration** - Dedicated routes for UE communication
- **AR Support** - Augmented reality features
- **Computer Vision** - CV processing capabilities
- **Network Access** - Accessible from local network devices

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)
- npm or yarn package manager

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmetBahaCepni/ArcaneGambit
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Configuration](#environment-configuration))

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
LOCAL_MONGODB_URI = mongodb://localhost:27017/arcanegambit # This is a placeholder URI, change it to your actual MongoDB URI
JWT_SECRET = 1234 # This is a placeholder secret, change it to a secure value


# Get your SMTP credentials from your email provider, for this example we use Gmail
SMTP_USER=******@gmail.com
SMTP_PASS=**** **** **** ****
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587

```

### Environment Variables Explained

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | 3001 |
| `MONGODB_URI` | Remote MongoDB connection string | Yes* | - |
| `LOCAL_MONGODB_URI` | Local MongoDB connection string | Yes* | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | 7d |
| `USE_REMOTE_DB` | Use remote or local database | No | false |

*At least one MongoDB URI is required

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Network Access
The server automatically binds to `0.0.0.0` to allow access from other devices on your local network. After starting, you'll see network access URLs in the console.

## 📚 API Documentation

### Base URL
- Local: `http://localhost:3001/api`
- Network: `http://[YOUR_IP]:3001/api`

### Authentication Endpoints
```
POST /api/auth/login       - User login
POST /api/auth/register    - User registration
POST /api/auth/refresh     - Refresh JWT token
```

### User Management
```
GET    /api/users          - Get all users (admin only)
GET    /api/users/:id      - Get user by ID
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
```

### Character Management
```
GET    /api/characters           - Get user's characters
POST   /api/characters           - Create new character
GET    /api/characters/:id       - Get character details
PUT    /api/characters/:id       - Update character
DELETE /api/characters/:id       - Delete character
```

### Game Sessions
```
POST   /api/games/create         - Create new game session
POST   /api/games/cv-create      - Create session with CV
GET    /api/games/:sessionId     - Get session details
POST   /api/games/:sessionId/join - Join game session
DELETE /api/games/:sessionId     - Delete session
```

### AR Features
```
GET    /api/ar/:sessionId        - Get AR session details
POST   /api/ar/room/:roomCode/add-spectator - Add spectator by room code
DELETE /api/ar/:sessionId/remove-spectator - Remove spectator
```

### Unreal Engine Integration
```
GET    /api/unreal/:sessionId              - Get session for UE
PUT    /api/unreal/:sessionId/update-states - Update character states
PUT    /api/unreal/:sessionId/update-game-status - Update game status
```

### Computer Vision
```
POST   /api/cv/process           - Process CV data
GET    /api/cv/results/:id       - Get CV results
```

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token
1. Register or login via `/api/auth/login`
2. Include the returned token in subsequent requests

### Admin Account
An admin account is automatically created on server startup with a random password displayed in the console.

## 🎮 Character System

### Character Classes
- **Warrior** - High health (120 + vitality), tank role
- **Mage** - Medium health (80 + vitality), magic damage
- **Archer** - Balanced health (96 + vitality), ranged attacks

### Character Stats
- **Health** - Calculated as base class health + vitality
- **Attack** - Damage output capability
- **Defense** - Damage reduction
- **Vitality** - Health modifier and survivability
- **Luck** - Critical hit chance and special effects

## 🎯 Game Session Flow

1. **Create Session** - Host creates a game with room code
2. **Join Session** - Players join using room code or session ID
3. **Character Selection** - Each player selects their character
4. **Game State Updates** - Real-time state synchronization
5. **Turn Management** - Track current player turns
6. **Session End** - Cleanup and results

## 📱 Network Configuration

### Firewall Settings (Windows)
If accessing from other devices fails:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Add inbound rule for port 3001 (TCP)
4. Allow the connection

### Router Configuration
For external network access, configure port forwarding on your router for port 3001.

## 🛠 Development

### Project Structure
```
backend/
├── controllers/        # Route handlers
├── middlewares/        # Authentication, error handling
├── models/            # MongoDB schemas
├── routes/            # API routes
├── utils/             # Helper functions
├── .env               # Environment variables
├── server.js          # Main server file
└── package.json       # Dependencies
```

### Adding New Routes
1. Create controller in `/controllers`
2. Define routes in `/routes`
3. Register routes in `server.js`

### Database Models
- **User** - User accounts and authentication
- **Character** - Player characters with stats
- **Game** - Game sessions and state
- **CharacterState** - Real-time character state in games

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MongoDB URI in `.env`
- Ensure MongoDB service is running
- Verify network connectivity

**JWT Token Invalid**
- Check JWT_SECRET in `.env`
- Ensure token hasn't expired
- Verify token format in Authorization header

**Port Already in Use**
- Change PORT in `.env`
- Kill existing process: `lsof -ti:3001 | xargs kill`

**Network Access Denied**
- Check firewall settings
- Verify server is binding to `0.0.0.0`
- Ensure devices are on same network

## 📝 Logging

The application provides comprehensive logging:
- **Request Logging** - All incoming requests
- **Unreal Route Logging** - Detailed UE communication logs
- **Database Operations** - MongoDB query logging
- **Authentication Events** - Login/logout tracking

**Happy Gaming! 🎮**