const express = require('express');
const router = express.Router();
const { addEvent, getEvents, updateEvent, deleteEvent, getEventById ,getEventsByLocation} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// Add new event
router.post('/add', authenticate, addEvent);

// Get events
router.get('/', authenticate, getEvents);

// Update event
router.put('/update', authenticate, updateEvent);

// Delete event
router.delete('/delete', authenticate, deleteEvent);

//Get event by id
router.get('/:eventId', authenticate, getEventById);

//Get event bu location
router.get('/location/:location', getEventsByLocation); 

module.exports = router;