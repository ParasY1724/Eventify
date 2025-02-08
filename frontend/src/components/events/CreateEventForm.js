import { useState } from "react";
import { useEvents } from "../../context/EventContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";

export function CreateEventForm() {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvents();
  const { socket, joinEventRoom } = useSocket();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    category: "Conference",
    location: "",
    image: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const combinedDateTime = `${formData.date}T${formData.time}`;
      const eventData = {
        ...formData,
        date: combinedDateTime
      };
      
      // Create the event through the API
      const newEvent = await createEvent(eventData);
      
      // Join the event room for real-time updates
      if (newEvent._id) {
        joinEventRoom(newEvent._id);
      }
      
      // Note: We don't need to emit 'newEvent' here as it's handled by the backend
      // The SocketContext will receive and handle the 'newEvent' event automatically
      
      navigate('/');
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 lg:pb-4 flex justify-center">
    <div className="bg-white rounded-3xl p-10 shadow-lg w-fit">
      <h2 className="text-2xl font-semibold mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Event Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <input
              type="time"
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Conference</option>
            <option>Workshop</option>
            <option>Meetup</option>
            <option>Concert</option>
            <option>Exhibition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Event Image</label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer text-blue-500 hover:text-blue-700">
              Click to upload image
            </label>
            {formData.image && <p className="mt-2 text-sm text-gray-500">{formData.image.name}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0F172A] text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
    </div>
  );
}