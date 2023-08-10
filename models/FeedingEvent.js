const mongoose = require('mongoose');

const feedingEventSchema = new mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    portionFed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed',
        required: true
    },
    feedingTime: {
        type: Date,
        default: Date.now
    },
    feedingEventDescription: {
        type: String
    }

});

const FeedingEvent = mongoose.model('FeedingEvent', feedingEventSchema);

module.exports = FeedingEvent;