const Game = require('../models/GameModel');
const User = require('../models/UserModel');

// Create a new game session
exports.createSession = async (req, res) => {
    try {
        const { gameStatus, currentTurnCharacterId } = req.body;
        const newGame = new Game({
            gameStatus,
            currentTurnCharacterId,
            users: [],
            spectators: []
        });
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// End a game session
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.gameStatus = 'finished';
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a player to a session
exports.addPlayer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId, characterId } = req.body;

        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.users.push({ userid: userId, characterId });
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a spectator to a session
exports.addSpectator = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.body;

        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.spectators.push({ UserId: userId });
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove a spectator from a session
exports.removeSpectator = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.body;

        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.spectators = game.spectators.filter(s => s.UserId.toString() !== userId);
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};