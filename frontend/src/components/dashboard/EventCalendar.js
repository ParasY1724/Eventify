import { useState } from "react"
import { useEvents } from "../../context/EventContext"
import { ChevronLeft, ChevronRight,ChevronDown,Calendar, Clock, MapPin, Users } from "lucide-react"
import { EventModal } from "../events/event-modal"

export function EventCalendar() {
  const { calendarEvents } = useEvents();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent,setSelectedEvent] = useState(null);

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const generateDateRange = () => {
    const dates = []
    for (let i = 0; i < 8; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push({
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        fullDate: date.toISOString().split("T")[0],
        hasEvents: calendarEvents[date.toISOString().split("T")[0]]?.length > 0,
      })
    }
    return dates
  }

  const dates = generateDateRange()

  const navigateDates = (direction) => {
    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + (direction === "next" ? 8 : -8))
    setStartDate(newDate)
  }

  const getEventsForDate = (dateString) => {
    const events = calendarEvents[dateString] || []
    if (selectedCategory === "all") return events
    return events.filter((event) => event.category === selectedCategory)
  }

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h3 className="text-xl font-semibold flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-gray-500" />
          Events on{" "}
          {new Date(selectedDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </h3>
  
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto appearance-none px-4 py-2 pr-8 border border-gray-200 rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Meetup">Meetup</option>
            <option value="Concert">Concert</option>
            <option value="Exhibition">Exhibition</option>
            </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
      </div>
    </div>

    <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => navigateDates("prev")}
        className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center space-x-2 overflow-x-auto flex-1 scrollbar-hide">
        {dates.map((day) => (
          <button
            key={day.fullDate}
            onClick={() => setSelectedDate(day.fullDate)}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300
              ${
                selectedDate === day.fullDate
                  ? "bg-black text-white"
                  : day.hasEvents
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <span className="text-xs font-medium">{day.dayName}</span>
            <span className="font-semibold">{day.date}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigateDates("next")}
        className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>

      {selectedDate && (
        <div className="space-y-4">
          {getEventsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No events on this date</p>
            </div>
          ) : (
            getEventsForDate(selectedDate).map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex items-start space-x-4"
                onClick={() => {setSelectedEvent(event)}}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={event.imageUrl || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{event.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2 space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(event.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="flex -space-x-2 mr-2">
                    {event.attendees?.slice(0, 3).map((attendee, i) => (
                        <img key={i} src={attendee.avatarUrl} className="w-6 h-6 rounded-full" />
                      ))}
                    </div>
                    <span className="text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {event.attendees?.length || 0} Attendees
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {selectedEvent && <EventModal event={selectedEvent} onClose={handleCloseModal} />}
    </div>
  )
}

