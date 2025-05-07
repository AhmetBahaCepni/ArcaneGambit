const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate = require('../middlewares/authenticate');

// Create a new game session
router.post('/create', authenticate, gameController.createSession);

// End a game session
router.put('/end/:sessionId', authenticate, gameController.endSession);

router.delete('/:sessionId', authenticate, gameController.deleteSession);


// Add a player to a session
router.post('/:sessionId/add-player', authenticate, gameController.addPlayer);

router.delete('/:sessionId/remove-player', authenticate, gameController.removePlayer);


// Add a spectator to a session
router.post('/:sessionId/add-spectator', authenticate, gameController.addSpectator);

// Remove a spectator from a session
router.delete('/:sessionId/remove-spectator', authenticate, gameController.removeSpectator);

module.exports = router;