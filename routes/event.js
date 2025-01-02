const express = require('express');
const router = express.Router();
const { addEvent, getEvents, updateEvent, deleteEvent } = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

// Add new event
router.post('/add', authenticate, addEvent);

// Get events
router.get('/', authenticate, getEvents);

// Update event
router.put('/update', authenticate, updateEvent);

// Delete event
router.delete('/delete', authenticate, deleteEvent);

module.exports = router;
