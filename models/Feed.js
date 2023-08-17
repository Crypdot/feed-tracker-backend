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
},
{
    toJson: { virtuals: true }
});

feedSchema.virtual('FeedingEvent', {
    ref: 'FeedingEvent',
    localField: '_id',
    foreignField: 'feedId'
})

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;