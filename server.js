const express = require('express');
const mongoose = require('mongoose');
mongoose.set('debug', true);
const cors = require('cors');
const app = express();

const Pet = require('./models/Pet');
const Feed = require('./models/Feed');
const FeedingEvent = require('./models/FeedingEvent');
const Schema = mongoose.Schema;

app.use(express.json());
app.use(cors());

const conn = mongoose.connect('mongodb://127.0.0.1:27017/feed-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to the database successfully!'))
    .catch(console.error());

/** Pet related requests */

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

// Fetches all pets!
app.get('/pets', async(req, res) => {
    const pets = await Pet.find();
    res.json(pets);
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

// Finds all feeding events per specific Pet. This includes the feed's ID and name used in the feeding event.
app.get('/pets/feedingEvents/', async (req, res) => {
    // Ensure the Pet exists
    const pet = await Pet.findById(req.body.petId);

    if(!pet){
        res.status(404).json({message: "Pet not found!"});
    }

    // An aggregate function with the purpose of finding all feeding events relating to this specific pet
    // It collects every feeding event, and additionally projects the event's feed name for easier debugging
    Pet.aggregate([
    {
        $match: {
            _id: pet._id
            }
    },
    {
        $lookup: {
        from: "feedingevents",
        localField: "_id",
        foreignField: "petId",
        as: "feedingevents"
        }
    },
    {
        $unwind: "$feedingevents"
    },
    {
        $lookup: {
            from: "feeds",
            localField: "feedingevents.feedId",
            foreignField: "_id",
            as: "feedInfo"
        }
    },
    {
        $unwind: "$feedInfo"
    },
    {
        $project: {
            _id: 1,
            name: 1,
            description: 1,
            feedingevents: {
                _id: "$feedingevents._id",
                feedId: "$feedingevents.feedId",
                petId: "$feedingevents.petId",
                portionsFed: "$feedingevents.portionsFed",
                feedingEventDescription: "$feedingevents.feedingEventDescription",
                feedingTime: "$feedingevents.feedingTime",
                feedName: "$feedInfo.name"
            }
        }
    }
    ])
    .exec()
    .then(aggregatedPet => {
        console.log(aggregatedPet);
        res.status(200).json(aggregatedPet);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});

// Fetches a pet specified by its ID
app.get('/pets/:id', async (req, res) => {
    try{
        const petFound = await Pet.findById(req.params.id);
        res.status(200).json(petFound);
    }catch (error) {
        console.error('!!! Error finding pet: ', error)
        res.status(404).json({error: 'Failed to find the Pet indicated'});
    }
});

/** Feed related requests */

// Returns all feeds found in the database
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

// Deletes a Feed with a given ID
app.delete('/feed/delete/:id', async (req, res) => {
    try {
        const result = await Feed.findByIdAndDelete(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('!!! Error deleting the feed: ', error);
        res.status(500).json({error: 'Failed to delete Feed-' + req.params.id});
    }
});

// Finds a feed by its given ID
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

// Helper function to update a feed. Primarily used when adding a feeding event and we want to subtract some number of feed from the database
async function updateFeed(feedId, portionsToSubtract) {
    const feedToUpdate = await Feed.findById(feedId);
    var feedLeft = feedToUpdate.portionsLeft;

    
    feedLeft -= portionsToSubtract;

    console.log("FEED LEFT ::: ", feedLeft); 
    if((feedLeft - portionsToSubtract) <= 0){
        feedLeft = 0
    }

    await Feed.findByIdAndUpdate(feedId, {portionsLeft: feedLeft});
};

/** Feeding event related requests */

// Fetches all feeding events!
app.get('/feedingEvents', async(req, res) => {
    const feedingEvents = await FeedingEvent.find();
    res.json(feedingEvents);
});
  
// Creates a new feeding event in the database
// It will also request updateFeed() to update the number of feed left in the database
app.post('/feedingEvents/new', async (req, res) => {
    const pet = await Pet.findById(req.body.petId);
    const feed = await Feed.findById(req.body.feedId);
    
    if(!pet){
        console.log("Pet not found");
        return res.status(404).json({error: "Pet not found!"});
    }

    if(!feed){
        console.log("Feed not found");
        return res.status(404).json({error: "Feed not found!"});
    }
    
    try {
        const feedingEvent = new FeedingEvent(
            { 
                petId: pet._id, 
                feedId: feed._id, 
                feedingEventDescription: req.body.feedingEventDescription, 
                portionsFed: req.body.portionsFed 
            }
        );

        if(req.body.feedingEventDescription) {
            feedingEvent.feedingEventDescription = req.body.feedingEventDescription;
        }         

        await feedingEvent.save();

        await updateFeed(req.body.feedId, req.body.portionsFed)

        return res.status(201).json(feedingEvent);
    } catch (error) {
        console.error('!!! Error adding a new Feeding Event', error);
        res.status(500).json({error: 'Failed to add a new FeedingEvent'});
    }
});

// Deletes all feeding events related to a pet specified by its ID
app.delete('/feedingEvents/deleteByPetId', async (req, res) => {
    const petId = req.body.petId;

    try {
        const pet = await Pet.findById(petId);

        if(!pet){
            console.log("Pet not found");
            return res.status(404).json({error: "Pet not found!"});
        }

        //Here we need to delete all feeding events that correspond to this pet!
        await FeedingEvent.deleteMany({ petId: pet._id});
        console.log("Feeding events related to ", pet.petName, " deleted.");
        return res.status(200).json({ message: "Feeding events deleted successfully."});

    } catch (Error) {
        console.error("!!! Something went wrong deleting pet's feeding events!");
        return res.status(500).json({error: "Something went wrong deleting the pet's feeding events."});
    }
});

app.listen(3001, () => console.log('Server started on port 3001!'));
