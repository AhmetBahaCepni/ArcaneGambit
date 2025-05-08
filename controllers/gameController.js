const Game = require('../models/GameModel');
const User = require('../models/UserModel'); // Ensure User model is imported
const Character = require('../models/CharacterModel');
const CharacterState = require('../models/CharacterState');

// Create a new game session
exports.createSession = async (req, res) => {
    try {
        const { gameStatus, characterState, characterId } = req.body;
        const userId = req.user.id; // Extract userId from token

        // create character state as the character is created
        const characterStateData = new CharacterState(characterState);
        await characterStateData.save(); // Save the character state to the database

        currentTurnCharacterStateId = characterStateData._id; // Use the saved character state ID

        // Fetch character details
        const character = await Character.findById(characterId);
        if (!character) return res.status(404).json({ message: 'Character not found' });

        const newGame = new Game({
            gameStatus,
            currentTurnCharacterId: characterId, // Update to use character state
            users: [{
                userid: userId,
                characterState: currentTurnCharacterStateId,
                characterName: character.characterName,
                class: character.class,
                avatar: character.avatar
            }], // Automatically add the creator to the game
            spectators: []
        });
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const game = await Game
            .findById(sessionId)
            .populate('users.characterState')
        if (!game) return res.status(404).json({ message: 'Session not found' });
        res.status(200).json(game);
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

        // Delete all character states associated with the session
        const characterStateIds = game.users.map(user => user.characterState);
        await CharacterState.deleteMany({ _id: { $in: characterStateIds } });

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

        // Delete all character states associated with the session
        const characterStateIds = game.users.map(user => user.characterState);
        await CharacterState.deleteMany({ _id: { $in: characterStateIds } });

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
        const { characterState, characterId } = req.body;
        const userId = req.user.id; // Extract userId from token

        characterStateData = new CharacterState(characterState);
        await characterStateData.save(); // Save the character state to the database

        const game = await Game.findById(sessionId).populate('users.characterState');
        if (!game) return res.status(404).json({ message: 'Session not found' });

        // Fetch character details
        const character = await Character.findById(characterId);
        if (!character) return res.status(404).json({ message: 'Character not found' });

        game.users.push({
            userid: userId,
            characterState: characterStateData._id,
            characterName: character.characterName,
            class: character.class,
            avatar: character.avatar
        });
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

        const game = await Game.findById(sessionId);
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

        // Ensure the user is not already a spectator
        if (game.spectators.includes(userId)) {
            return res.status(400).json({ message: 'User is already a spectator' });
        }

        game.spectators.push(userId);
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


// Update a player's character state
exports.updateCharacterState = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { characterState } = req.body;
        const userId = req.user.id; // Extract userId from token

        const game = await Game.findById(sessionId).populate('users.characterState');
        if (!game) return res.status(404).json({ message: 'Session not found' });

        // Find the user in the game
        const user = game.users.find(user => user.userid.toString() === userId);
        if (!user) return res.status(404).json({ message: 'User not found in this session' });

        // Update the character state
        user.characterState = characterState;
        await game.save();
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};