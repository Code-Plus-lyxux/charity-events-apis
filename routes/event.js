const express = require("express");
const router = express.Router();
const {
    addEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    getEventById,
} = require("../controllers/eventController");
const { authenticate } = require("../middleware/auth");

// Add new event
router.post("/add", authenticate, addEvent);

// Get events
router.get(
    "/",
    // authenticate, //removed for testing purposes
    getEvents
);

router.get(
    "/:id",
    // authenticate,  //removed for testing purposes
    getEventById
);

// Update event
router.put("/update", authenticate, updateEvent);

// Delete event
router.delete("/delete", authenticate, deleteEvent);

module.exports = router;
