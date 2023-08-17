const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedingEventSchema = new mongoose.Schema({
    feedId: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    portionsFed: {
        type: Number,
        required: true
    },
    feedingTime: {
        type: Date,
        default: Date.now
    },
    feedingEventDescription: {
        type: String
    }
    
    /*
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    feed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feed',
        required: true
    },
    portionsFed: {
        type: Number,
        required: true
    },
    feedingTime: {
        type: Date,
        default: Date.now
    },
    feedingEventDescription: {
        type: String
    }
    */

});

const FeedingEvent = mongoose.model('FeedingEvent', feedingEventSchema);

module.exports = FeedingEvent;