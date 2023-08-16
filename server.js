/** To do */
/** Make sure that adding a type of feed and pet is easy */
/** Add request to delete all events, pets, feed, etc. Blank slate should be achievable*/

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
        console.error('!!! Error updating the Pet: ', error);
        res.status(500).json({error: 'Failed to update the Pet'});
    }
})

app.get('/pets/:id', async (req, res) => {
    try{
        const petFound = await Pet.findById(req.params.id);
        res.status(200).json(petFound);
    }catch (error) {
        console.error('!!! Error finding pet: ', error)
        res.status(404).json({error: 'Failed to find the Pet indicated'});
    }
})

// Creates a new Feed!
app.post('/feed/new', async (req, res) => {
    try {
        const feed = new Feed({
            name: req.body.feedName,
            portionsLeft: req.body.portionsLeft,
        }); 

        const savedFeed = await feed.save();
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

app.get('/feed/:id', async (req, res) => {
    try{
        const feedFound = await Feed.findById(req.params.id);
        res.status(200).json(feedFound);
    }catch (error) {
        console.error('!!! Error finding Feed');
        res.status(404).json({error: 'Failed to find the Feed'});
    }
})

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

async function updateFeed(feedId, portionsToSubtract){
    const feedToUpdate = await Feed.findById(feedId);
    var feedLeft = feedToUpdate.portionsLeft;

    
    feedLeft -= portionsToSubtract;

    console.log("FEED LEFT ::: ", feedLeft);
    if((feedLeft - portionsToSubtract) <= 0){
        feedLeft = 0
    }

    await Feed.findByIdAndUpdate(feedId, {portionsLeft: feedLeft});
}

// Fetches all feeding events!
app.get('/feedingEvents', async(req, res) => {
    const feedingEvents = await FeedingEvent.find();
    res.json(feedingEvents);
});
  
app.post('/feedingEvents/new', async (req, res) =>{
    const pet = await Pet.findById(req.body.petId);
    const feed = await Feed.findById(req.body.feedId);

    console.log(pet);

    if(!pet){
        console.log("PET NOT FOUND");
        return res.status(404).json({error: "Pet not found!"});
    }

    if(!feed){
        console.log("Feed not found");
        return res.status(404).json({error: "Feed not found"});
    }

    try {
        const feedingEvent = new FeedingEvent();
        feedingEvent.pet = req.body.petId;
        feedingEvent.feed = req.body.feedId;
        
        feedingEvent.portionsFed = req.body.portionsFed;
        
        if(req.body.feedingEventDescription) {
            feedingEvent.feedingEventDescription = req.body.feedingEventDescription;
        }
        
        const savedFeedingEvent = feedingEvent.save();

        updateFeed(req.body.feedId, req.body.portionsFed);

        res.status(201).json(savedFeedingEvent);

    } catch (error) {
        console.error('!!! Error adding a new Feeding Event', error);
        res.status(500).json({error: 'Failed to add a new FeedingEvent'});
    }
});

app.listen(3001, () => console.log('Server started on port 3001!'));
