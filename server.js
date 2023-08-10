/** To do */
/** Make sure that adding a type of feed and pet is easy */
/** Ensure that a feeding event can't be created if neither the pet or the feed exists => Handle the error gracefully! */
/** Ensure that when a feeding event occurs, the right number of feed is removed from the fridge! */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const Pet = require('./models/Pet');
const Feed = require('./models/Feed');
const FeedingEvent = require('./models/FeedingEvent');

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/feed-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to the database successfully!'))
    .catch(console.error());

// Fetches all pets!
app.get('/pets', async(req, res) => {
    const pets = await Pet.find();
    res.json(pets);
});

app.get('/feed', async (req, res) =>{
    try{
        const feed = await Feed.find();
        if(!feed) { return res.status(404).json({error: 'No feed found in database!'});}
        
        res.status(200).json(feed)
    } catch (error) {
        console.error('!!! Error searching for feed: ', error);
        res.status(500).json({error: 'Something went wrong searching for all the feed!'});
    }
});

// Creates a new pet! It will not add a duplicate!
app.post('/pets/new', async (req, res) => {
    try {
        const pet = new Pet({
            name: req.body.petName,
            description: req.body.petDescription,
        });

        const savedPet = await pet.save();
        res.status(201).json(savedPet);

    } catch (error) {
        console.error('!!! Error adding a new Pet:', error);
        res.status(500).json({error: 'Failed to add a new Pet.'});
    }
});

// Deletes a Pet with a given ID.
app.delete('/pets/delete/:id', async (req, res) => {
    try{
        const result = await Pet.findByIdAndDelete(req.params.id);
        res.json(result);

    } catch (error) {
        console.error('!!! Error deleting the pet: ', error);
        res.status(500).json({error: 'Failed to delete Pet-' + req.params.id});
    } 
});

// Updates a Pet with a given ID.
app.post('/pets/update/:id', async (req, res) => {
    try{
        const petToUpdate = await Pet.findById(req.params.id);
        petToUpdate.name = req.body.petName;
        petToUpdate.description = req.body.petDescription;

        const updatedPet = petToUpdate.save();
        res.status(200).json(updatedPet);

    } catch (error) {
        console.error('!!! Error updating the Pet:', error);
        res.status(500).json({error: 'Failed to update the Pet'});
    }
})

// Creates a new Feed!
app.post('/feed/new', (req, res) => {
    try {
        const feed = new Feed({
            feedName: req.body.feedName,
            portionsLeft: req.body.portionsLeft,
        });

        const savedFeed = feed.save();
        res.status(201).json(savedFeed);

    } catch (error) {
        console.error('!!! Error adding a new Feed', error);
        res.status(500).json({error: 'Failed to add a new Feed'});
    } 
});

// Deletes a Feed with a given ID.
app.delete('/feed/delete/:id', async (req, res) => {
    try {
        const result = await Feed.findByIdAndDelete(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('!!! Error deleting the feed: ', error);
        res.status(500).json({error: 'Failed to delete Feed-' + req.params.id});
    }
});

// Updates a Feed with a given ID.
app.post('/feed/update/:id', async (req, res) => {
    try{
        const feedToUpdate = await Feed.findById(req.params.id);
        if(!feedToUpdate) { return res.status(400); }

        feedToUpdate.feedName = req.body.feedName;
        feedToUpdate.portionsLeft = req.body.portionsLeft;

        const updatedFeed = feedToUpdate.save();
        res.status(200).json(updatedFeed);
    } catch (error) {
        console.error('!!! Error updated Feed: ', error);
        res.status(500).json({error: 'Failed to update the Feed'});
    }
});


app.post('feedingEvents/new', async (req, res) =>{
    try {
        const feedingEvent = new FeedingEvent({
            pet: req.body.petId,
            feed: req.body.feedId,
            feedingEventDescription: req.body.feedingEventDescription,
            feedingTime: req.body.feedingTime
        })
        
        const savedFeedingEvent = feedingEvent.save();
        res.status(201).json(savedFeedingEvent);

    } catch (error) {
        console.error('!!! Error adding a new Feeding Event', error);
        res.status(500).json({error: 'Failed to add a new FeedingEvent'});
    }
});

app.listen(3001, () => console.log('Server started on port 3001!'));
