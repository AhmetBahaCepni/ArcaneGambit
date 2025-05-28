const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticate = require('../middlewares/authenticate');

router.post('/create', authenticate, gameController.createSession);

// End a game session
router.put('/end/:sessionId', authenticate, gameController.endSession);

// Delete a game session
router.delete('/:sessionId', authenticate, gameController.deleteSession);

// Add a player to a session
router.post('/:sessionId/add-player', authenticate, gameController.addPlayer);

// Get session details
router.get('/:sessionId', authenticate, gameController.getSession);

// Remove a player from a session
router.delete('/:sessionId/remove-player', authenticate, gameController.removePlayer);
// Update character state by user ID (for Unreal Engine)
router.put('/:sessionId/update-states', authenticate, gameController.updateCharacterStates);


module.exports = router;
