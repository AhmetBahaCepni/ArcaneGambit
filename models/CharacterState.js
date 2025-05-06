const mongoose = require('mongoose');

const CharacterStateSchema = new mongoose.Schema({
    characterName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    health: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    attackType: {
        type: String,
        required: true
    },
    attackDamage: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('CharacterState', CharacterStateSchema);