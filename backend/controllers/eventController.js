const Event = require('../models/Event');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

const eventController = {
  createEvent: async (req, res) => {
    try {
      const { name, description, date, category, location } = req.body;
      let imageUrl = '';

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      }

      const event = new Event({
        name,
        description,
        date,
        category,
        location,
        imageUrl,
        creator: req.user._id
      });

      await event.save();
      // Emit socket event for real-time updates
      req.app.get('io').emit('newEvent', event);
      
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getEvents: async (req, res) => {
    try {
      const { category, startDate, endDate } = req.query;
      let query = {};

      if (category) {
        query.category = category;
      }

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const events = await Event.find(query)
        .populate('creator', 'name email avatarUrl phone')
        .populate('attendees', 'name email avatarUrl')
        .sort({ date: 1 });

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('creator', 'name email')
        .populate('attendees', 'name email');

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const event = await Event.findOne({
        _id: req.params.id,
        creator: req.user._id
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updates = Object.keys(req.body);
      updates.forEach(update => event[update] = req.body[update]);

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        event.imageUrl = result.secure_url;
      }

      await event.save();
      // Emit socket event for real-time updates
      req.app.get('io').emit('updateEvent', event);

      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findOneAndDelete({
        _id: req.params.id,
        creator: req.user._id
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Emit socket event for real-time updates
      req.app.get('io').emit('deleteEvent', req.params.id);

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  attendEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      if (event.attendees.includes(req.user._id)) {
        return res.status(400).json({ error: 'Already attending this event' });
      }
  
      event.attendees.push(req.user._id);
      await event.save();
  
      const populatedEvent = await Event.findById(event._id)
        .populate('attendees', 'name email avatarUrl');
  
      // Broadcast to all clients in the event room
      req.app.get('io').to(`event:${event._id}`).emit('updateAttendees', {
        eventId: event._id,
        attendees: populatedEvent.attendees,
        userId:req.user._id,
        isAttending:true
      });
  
      res.json(populatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  leaveEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      const attendeeIndex = event.attendees.indexOf(req.user._id);
      if (attendeeIndex === -1) {
        return res.status(400).json({ error: 'Not attending this event' });
      }
  
      event.attendees.splice(attendeeIndex, 1);
      await event.save();
  
      const populatedEvent = await Event.findById(event._id)
        .populate('attendees', 'name email avatarUrl');
  
      // Broadcast to all clients in the event room
      req.app.get('io').to(`event:${event._id}`).emit('updateAttendees', {
        eventId: event._id,
        attendees: populatedEvent.attendees,
        userId:req.user._id,
        isAttending:false
      });
  
      res.json(populatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  searchAlgo: async (req, res) => {
    try {
      const query = req.query.q || ''; // Get search query
      const category = req.query.category || ''; // Get category filter
  
      const queryRegex = new RegExp(query, 'i');
      const categoryRegex = new RegExp(category, 'i');
  
      // Search for events matching the query and category (if provided)
      const eventFilter = {
        $and: [
          {
            $or: [
              { name: queryRegex },
              { description: queryRegex },
              { location: queryRegex },
              { 'creator.name': queryRegex }
            ]
          },
          category ? { category: categoryRegex } : {} // Only filter by category if provided
        ]
      };
  
      const events = await Event.find(eventFilter)
        .populate('creator')
        .limit(10)
        .sort({ date: 1 });
  
      // Search for organizers (users) matching the query
      const organizers = await User.find({
        $or: [
          { name: queryRegex },
          { organization: queryRegex }
        ]
      }).limit(5);
  
      res.json({
        events,
        organizers,
        hasMore: events.length === 10
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }  
};



module.exports = eventController;