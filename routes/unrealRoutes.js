const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate = require('../middlewares/authenticate');

// Logging middleware for all unreal routes
router.use((req, res, next) => {
  console.log('\n=== UNREAL ROUTE REQUEST ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Params:', JSON.stringify(req.params, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('Body: (empty)');
  }
  
  console.log('IP Address:', req.ip || req.connection.remoteAddress);
  console.log('User-Agent:', req.get('User-Agent') || 'Not provided');
  console.log('============================\n');
  
  next();
});

router.post('/create', authenticate, gameController.createSession);

// End a game session
router.put('/end/:sessionId', authenticate, gameController.endSession);

// Delete a game session
router.delete('/:sessionId', authenticate, gameController.deleteSession);

// Add a player to a session
router.post('/:sessionId/add-player', authenticate, gameController.addPlayer);

// Get session details
router.get('/:sessionId', gameController.getSessionUnreal);

// Remove a player from a session
router.delete('/:sessionId/remove-player', authenticate, gameController.removePlayer);
// Update character state by user ID (for Unreal Engine)
router.put('/:sessionId/update-states', authenticate, gameController.updateCharacterStates);


module.exports = router;
