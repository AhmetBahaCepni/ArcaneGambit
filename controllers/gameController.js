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

exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
       // find the session by id, if token acquirer is one of the players or the token acquirer is the admin, delete the session
        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        // Check if the user is a player or admin
        const userId = req.user.id; // Extract userId from token
        const isPlayer = game.users.some(user => user.userid.toString() === userId);
        const isAdmin = req.user.isAdmin // Assuming you have a role field in your user model

        if (isPlayer || isAdmin) {
            await Game.deleteOne({ _id: sessionId });
            res.status(200).json({ message: 'Session deleted successfully' });
        } else {
            res.status(403).json({ message: 'You do not have permission to delete this session' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a player to a session
exports.addPlayer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { characterId } = req.body;
        const userId = req.user.id; // Extract userId from token

        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.users.push({ userid: userId, characterId });
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removePlayer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id; // Extract userId from token

        const game = await Game
.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.users = game.users.filter(user => user.userid.toString() !== userId);
        await game.save();
        res.status(200).json(game);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Add a spectator to a session
exports.addSpectator = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id; // Extract userId from token

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
        const userId = req.user.id; // Extract userId from token

        const game = await Game.findById(sessionId);
        if (!game) return res.status(404).json({ message: 'Session not found' });

        game.spectators = game.spectators.filter(s => s.UserId.toString() !== userId);
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};