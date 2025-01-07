const Event = require("../models/Event");
const path = require("path");

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

    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
    try {
        await Event.findByIdAndDelete(eventId);
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

