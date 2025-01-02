const Event = require('../models/Event');

// Add new event with base64 encoded images
exports.addEvent = async (req, res) => {
  const { eventName, startDate, endDate, location, aboutEvent, images } = req.body;
  const userId = req.user.id;

  // Validate images (ensure they are base64 strings)
  if (images && images.length > 5) {
    return res.status(400).json({ message: 'You can only upload up to 5 images' });
  }
  
  // Validate base64 encoding
  const isValidBase64 = (str) => {
    return /^data:image\/\w+;base64,/.test(str); // Check for base64 image data URI
  };
  
  if (images && !images.every(isValidBase64)) {
    return res.status(400).json({ message: 'One or more images are not in valid base64 format' });
  }

  try {
    const newEvent = new Event({
      userId,
      eventName,
      startDate,
      endDate,
      location,
      aboutEvent,
      images,
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event with base64 encoded images
exports.updateEvent = async (req, res) => {
  const { eventId, eventName, startDate, endDate, location, aboutEvent, images } = req.body;
  
  // Validate base64 encoded images
  if (images && images.length > 5) {
    return res.status(400).json({ message: 'You can only upload up to 5 images' });
  }
  
  const isValidBase64 = (str) => {
    return /^data:image\/\w+;base64,/.test(str);
  };
  
  if (images && !images.every(isValidBase64)) {
    return res.status(400).json({ message: 'One or more images are not in valid base64 format' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.eventName = eventName || event.eventName;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.location = location || event.location;
    event.aboutEvent = aboutEvent || event.aboutEvent;
    event.images = images || event.images;

    await event.save();
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.body;
  try {
    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
