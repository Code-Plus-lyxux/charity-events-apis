const express = require("express");
const router = express.Router();
const uploadEventImages = require("../middleware/eventMulter");
const { addEvent, getEvents, updateEvent, deleteEvent, getEventById ,getEventsByLocation, uploadEventImagesController } = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');


// Add new event
router.post("/add", authenticate, addEvent);

// Get events
router.get(
    "/",
    // authenticate, //removed for testing purposes
    getEvents
);

// Update event
router.put("/update", authenticate, updateEvent);

// Delete event
router.delete("/delete", authenticate, deleteEvent);

//Get event by id
router.get('/:eventId', authenticate, getEventById);

//Get event bu location
router.get('/location/:location', getEventsByLocation);

// Route for uploading event images
router.post("/upload-images",uploadEventImages.array("images", 10),uploadEventImagesController);

module.exports = router;