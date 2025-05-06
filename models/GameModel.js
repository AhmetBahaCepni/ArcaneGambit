const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    gameStatus: {
        type: String,
        required: true,
        enum: ['ongoing', 'started', 'finished'] // Valid game states
    },
    currentTurnCharacterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Character' // Reference to the User model
    },
    users: [
        {
            userid: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User' // Reference to the User model
            },
            characterId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Character' // Reference to the Character model
            }
        }
    ],
    spectators: [
        {
            UserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User' // Reference to the User model
            }
        }
    ]
});

module.exports = mongoose.model('Game', GameSchema);