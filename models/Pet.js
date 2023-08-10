const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    feed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed'
    }
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;