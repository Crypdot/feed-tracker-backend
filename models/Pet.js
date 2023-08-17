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
    }
},
{
    toJson: { virtuals: true }
});

petSchema.virtual('FeedingEvent', {
    ref: 'FeedingEvent',
    localField: '_id',
    foreignField: 'petId'
})

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;