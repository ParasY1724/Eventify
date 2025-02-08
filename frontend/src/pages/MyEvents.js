import { useState, useEffect } from "react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from 'framer-motion';
import { EventModal } from "../components/events/event-modal";

const EditEventModal = ({ event, onClose }) => {
  const { updateEvent, loading, error } = useEvents();
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    date: event.date.split('T')[0],
    time: event.date.split('T')[1]?.slice(0, 5),
    category: event.category,
    location: event.location,
    image: null
  });
  const [updateError, setUpdateError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    
    try {
      // Combine date and time
      const combinedDateTime = `${formData.date}T${formData.time}:00`;
      
      const updateData = {
        ...formData,
        date: combinedDateTime
      };
      delete updateData.time;

      await updateEvent(event._id, updateData);
      onClose();
    } catch (error) {
      setUpdateError(error.message);
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6">Edit Event</h2>
        {updateError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {updateError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Event Name"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            <option>Conference</option>
            <option>Workshop</option>
            <option>Meetup</option>
            <option>Concert</option>
            <option>Exhibition</option>
          </select>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <div>
            <label className="block text-sm font-medium mb-2">Update Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0F172A] text-white rounded-lg disabled:opacity-50 hover:bg-[#1E293B]"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export function MyEvents() {
  const { upcomingEvents, pastEvents, fetchEvents } = useEvents();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent,setSelectedEvent] = useState(null);

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // Fetch events when component mounts or after updates
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events created by the current user
  const userUpcomingEvents = upcomingEvents.filter(event => event.creator._id === user?._id);
  const userPastEvents = pastEvents.filter(event => event.creator._id === user?._id);

  const filteredEvents = activeTab === "upcoming" ? userUpcomingEvents : userPastEvents;

  // Handler for closing edit modal
  const handleCloseEdit = async () => {
    setEditingEvent(null);
    // Refresh events after closing modal
    await fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="p-6 bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8">My Created Events</h1>

        <div className="flex space-x-4 mb-8">
          {["upcoming", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg capitalize transition-colors duration-300 ${
                activeTab === tab ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {tab} Events
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.length === 0 && (
              <p className="text-gray-500">No events found</p>
            )}
            {filteredEvents.map((event) => (
              <motion.div
                key={event._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl"
                onClick={() => {if(activeTab === "past"){setSelectedEvent(event)}}}
              >
                <img 
                  src={event.imageUrl || "/placeholder.svg"} 
                  alt={event.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {event.attendees?.length || 0} attendees
                    </span>
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {event.category}
                      </span>
                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {editingEvent && (
          <EditEventModal 
            event={editingEvent} 
            onClose={handleCloseEdit}
          />
        )}
      </div>
      {selectedEvent && <EventModal event={selectedEvent} onClose={handleCloseModal} />}
    </div>
  );
}