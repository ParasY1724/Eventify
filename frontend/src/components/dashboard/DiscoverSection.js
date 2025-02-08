import { useMemo } from 'react';
import { EventCard } from "../events/EventCard";
import { useEvents } from '../../context/EventContext';

export function DiscoverSection({ activeTab, setActiveTab, onOpenModal }) {
  const { upcomingEvents, pastEvents } = useEvents();

  // Function to get top 3 events by attendees
  const getTopEvents = (events) => {
    return events
      .sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))
      .slice(0, 3);
  };

  // Memoize top events to prevent unnecessary re-renders
  const topUpcomingEvents = useMemo(() => getTopEvents(upcomingEvents), [upcomingEvents]);
  const topPastEvents = useMemo(() => getTopEvents(pastEvents), [pastEvents]);

  // Select events based on active tab
  const displayEvents = activeTab === 'Upcoming' ? topUpcomingEvents : topPastEvents;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Top Events</h2>
  
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {["Upcoming", "Past"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === tab ? "bg-[#0F172A] text-white" : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.map((event) => (
          <EventCard 
            key={event._id} 
            {...event} 
            onOpenModal={() => onOpenModal(event)} 
          />
        ))}
        {displayEvents.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No top events found
          </p>
        )}
      </div>
    </div>
  );
}