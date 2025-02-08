import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';

const localizer = momentLocalizer(moment);

const LandscapeCalendar = () => {
  const { upcomingEvents, pastEvents } = useEvents();
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return; // Ensure user is loaded before filtering

    const formatEvent = (event) => ({
      title: event.name,
      start: new Date(event.date),
      end: new Date(event.date),
      description: event.description,
      location: event.location,
      imageUrl: event.imageUrl,
      category: event.category,
    });

    // Filter events where the current user is an attendee
    const userEvents = (events) =>
      events.filter(event =>
        event.attendees.some(attendee => attendee._id === user._id)
      );

    const formattedEvents = [
      ...userEvents(upcomingEvents).map(formatEvent),
      ...userEvents(pastEvents).map(formatEvent),
    ];

    setEvents(formattedEvents);
  }, [upcomingEvents, pastEvents, user]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div
        className="min-h-screen bg-white rounded-3xl shadow-lg p-10"
        style={{
          backgroundImage: `url(/output.jpg)`,
          backgroundSize: 'cover',
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          className="min-h-screen bg-white bg-opacity-90 p-4 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default LandscapeCalendar;
