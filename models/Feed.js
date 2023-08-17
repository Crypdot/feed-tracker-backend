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

feedSchema.virtual('pets', {
    ref: 'FeedingEvents',
    localField: '_id',
    foreignField: 'petId'
})

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;