const Event = require("../models/Event");
const path = require("path");
const User = require('../models/User');

// Add new event with base64 encoded images
exports.addEvent = async (req, res) => {
  const { eventName, startDate, endDate, location, aboutEvent, images , comments, backgroundImage} = req.body;
  const userId = req.user.id;



  // Validate images (ensure they are base64 strings)
  if (images && images.length > 5) {
    return res.status(400).json({ message: 'You can only upload up to 5 images' });
  }
  
  // Validate base64 encoding
  // const isValidBase64 = (str) => {
  //   return /^data:image\/\w+;base64,/.test(str); // Check for base64 image data URI
  // };
  
  // if (images && !images.every(isValidBase64)) {
  //   return res.status(400).json({ message: 'One or more images are not in valid base64 format' });
  // }

  try {
    const newEvent = new Event({
      userId,
      eventName,
      startDate,
      endDate,
      location,
      aboutEvent,
      images,
      comments,
      backgroundImage,
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();

    // Add the event to the user's eventsAttending array
    const user = await User.findById(userId);
    // console.log(user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.eventsAttending.includes(savedEvent._id)) {
      return res.status(400).json({ message: 'Event is already in user\'s attending list' });
    }
    
    if (user.eventsCreated.includes(savedEvent._id)) {
      return res.status(400).json({ message: 'Event is already in user\'s created list' });
    }

    user.eventsAttending.push(savedEvent._id);
    user.eventsCreated.push(savedEvent._id);
    
    // Save user updates
    await user.save();

    res.status(201).json({ message: 'Event added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error',errormessage: err });
  }
};

// Get list of events
exports.getEvents = async (req, res) => {
    const { status, page, pageSize } = req.query;
    const userId = req.user.id;

    try {
        const query = { userId };
        if (status) query.status = status;

        const events = await Event.find(query)
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize));

        const totalEvents = await Event.countDocuments(query);
        res.json({ events, totalEvents });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update event with base64 encoded images
exports.updateEvent = async (req, res) => {
    const {
        eventId,
        eventName,
        startDate,
        endDate,
        location,
        aboutEvent,
        images,
        backgroundImage,
    } = req.body;

    // Validate base64 encoded images
    if (images && images.length > 5) {
        return res
            .status(400)
            .json({ message: "You can only upload up to 5 images" });
    }

    // const isValidBase64 = (str) => {
    //     return /^data:image\/\w+;base64,/.test(str);
    // };

    // if (images && !images.every(isValidBase64)) {
    //     return res.status(400).json({
    //         message: "One or more images are not in valid base64 format",
    //     });
    // }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.eventName = eventName || event.eventName;
        event.startDate = startDate || event.startDate;
        event.endDate = endDate || event.endDate;
        event.location = location || event.location;
        event.aboutEvent = aboutEvent || event.aboutEvent;
        event.images = images || event.images;
        event.backgroundImage = backgroundImage || event.backgroundImage;

        await event.save();
        res.json({ message: "Event updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};



// Get event by ID
exports.getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate('comments.userId', 'profileImage');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


//Get events by location
exports.getEventsByLocation = async (req, res) => {
  const { location } = req.params;

  try {
    const events = await Event.find({ location });
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'Events not found' });
    }

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Check if the user is authorized to delete the event (creator of the event)
        if (event.userId.toString() !== userId) {
          return res.status(403).json({ message: "You are not authorized to delete this event" });
        }
        
        // Delete the event
        await Event.findByIdAndDelete(eventId);

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Remove the eventId from both arrays
        user.eventsCreated = user.eventsCreated.filter(id => id.toString() !== eventId.toString());
        user.eventsAttending = user.eventsAttending.filter(id => id.toString() !== eventId.toString());

        // Save the user updates
        await user.save();
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Upload the event images
exports.uploadEventImagesController = (req, res) => {
  if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
  }

  const fileUrls  = req.files.map((file) => ({
      fileName: file.originalname,
      url: `${req.protocol}://${req.get("host")}/eventimages/${file.filename}`,
  }));

  res.status(200).json({
      message: "Files uploaded successfully",
      files: fileUrls ,
  });
};

// Add comment to event
exports.addCommentToEvent = async (req, res) => {
  const { eventId } = req.params;  
  const { comment } = req.body;  
  const userId = req.user.id;  
  
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  try {
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Add new comment to the event's comment array
    event.comments.push({
      userId,
      comment,
    });
    
    await event.save();
    res.status(200).json({ message: "Comment added successfully", event });
  } catch (err) {
    console.error("Error in addCommentToEvent:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a user to the event's attendUsers array
exports.addUserToEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id; 

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already attending
    if (event.attendUsers.includes(userId)) {
      return res.status(400).json({ message: 'User is already attending this event' });
    }

    // Add the user to the attendUsers array
    event.attendUsers.push(userId);

    // Add the event to the user's eventsAttending array
    const user = await User.findById(userId);

    if (user.eventsAttending.includes(eventId)) {
      return res.status(400).json({ message: 'Event is already in user\'s attending list' });
    }

    user.eventsAttending.push(eventId);

    // Save both event and user updates
    await event.save();
    await user.save();

    res.status(200).json({ message: 'User added to event', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove a user from the event's attendUsers array
exports.removeUserFromEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id; 

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is attending the event
    if (!event.attendUsers.includes(userId)) {
      return res.status(400).json({ message: 'User is not attending this event' });
    }

    // Remove the user from the attendUsers array
    event.attendUsers = event.attendUsers.filter(user => user.toString() !== userId.toString());

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the event from the user's eventsAttending array
    user.eventsAttending = user.eventsAttending.filter(event => event.toString() !== eventId);

    // Save both event and user updates
    await event.save();
    await user.save();
    res.status(200).json({ message: 'User removed from event', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



