const mongoose = require('mongoose');

const CharacterStateSchema = new mongoose.Schema({
   
    health: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    attackAction: {
        type: String,
        required: false // Make attackAction nullable
    },
    attackDamage: {
        type: Number,
        required: true
    }
});

/* example:
{
    health: 100,
    state: 'normal',
    attackAction: 'fireball',
    attackDamage: 20
} */

module.exports = mongoose.model('CharacterState', CharacterStateSchema);