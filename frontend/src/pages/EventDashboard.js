import { useState } from "react";
import { SearchHeader } from "../components/dashboard/SearchHeader";
import { EventCalendar } from "../components/dashboard/EventCalendar";
import { DiscoverSection } from "../components/dashboard/DiscoverSection";
import { RightPanel } from "../components/dashboard/RightPanel";
import { CreateEventForm } from "../components/events/CreateEventForm";
import { EventModal } from "../components/events/event-modal";
import { useEvents } from "../context/EventContext";

export default function EventDashboard() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { searchResults } = useEvents();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 lg:pb-4">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-4 sm:p-6">
            {showCreateEvent ? (
              <CreateEventForm />
            ) : (
              <>
                <SearchHeader query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
  
                {/* Search Results - Responsive Grid */}
                {(query.length > 0 || category !== 'all') && searchResults?.events && searchResults.events.length > 0 ? (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.events.map((event) => (
                        <div
                          key={event._id}
                          onClick={() => handleOpenModal(event)}
                          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        >
                          <img
                            src={event.imageUrl || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h4 className="font-semibold text-lg mb-2 line-clamp-1">{event.name}</h4>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              ) : (query.length > 0 || category !== 'all') ? (
                <p className="text-center text-gray-500 mt-8">No Results Found...</p>
              ) : (
                <>
                  <DiscoverSection
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenModal={handleOpenModal}
                  />
                  <EventCalendar />
                </>
              )}
              {selectedEvent && <EventModal event={selectedEvent} onClose={handleCloseModal} />}
            </>
          )}
        </div>
        <div className="hidden lg:block lg:w-[320px]">
          <RightPanel />
        </div>
      </div>
    </div>
  </div>
);
}
