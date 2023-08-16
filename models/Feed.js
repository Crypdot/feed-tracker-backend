const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    portionsLeft: {
        type: Number,
        required: true,
        default: 0
    }
});

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;