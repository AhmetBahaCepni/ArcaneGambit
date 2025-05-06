const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Character', CharacterSchema);


/*

maybe we should change this to be a characterAction model and following as the character model?
TODO: ask group

luck: {
    type: Number,
    required: true
},
attack: {
    type: Number,
    required: true
},
defense: {
    type: Number,
    required: true
},
attackType: {
    type: String,
    required: true
},
attackDamage: {
    type: Number,
    required: true
},
*/