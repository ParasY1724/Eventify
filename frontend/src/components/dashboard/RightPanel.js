import { MapPin, Clock, User } from "lucide-react"
import moment from "moment"
import { motion } from "framer-motion"
import { useEvents } from "../../context/EventContext"
import { useAuth } from "../../context/AuthContext"
import { useState } from "react"
import { EventModal } from "../events/event-modal"

export function RightPanel() {
  const { upcomingEvents } = useEvents()
  const { user } = useAuth()
  const [selectedEvent,setSelectedEvent] = useState(null);

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const today = moment().startOf("day")

  const todaysEvents = upcomingEvents.filter((event) => {
    const eventDate = moment(event.date).startOf("day")
    const isToday = eventDate.isSame(today, "day")
    const isUserAttendee = event.attendees.some((attendee) => attendee._id === user?._id)
    const isUserCreator = event.creator._id === user?._id

    return isToday && (isUserAttendee || isUserCreator)
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="w-full sm:w-[320px] p-6 border-l border-gray-100">
      <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
        <img src="/navbar.png" alt="Navigation Bar" className="w-full object-cover" />
      </div>

      <h2 className="text-2xl font-bold mb-6 text-indigo-800">
        { user ? "My Today Events:" : "Login Required !!"}
      </h2>

      {todaysEvents.length > 0 ? (
        <motion.ul className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          {todaysEvents.map((event) => (
            <motion.li
              key={event._id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform perspective-1000"
              onClick={() => {setSelectedEvent(event)}}
            >
              <h3 className="text-lg font-bold flex items-center text-indigo-700">
                <User className="mr-2 text-indigo-500" size={24} />
                {event.name}
              </h3>
              <div className="flex items-center text-gray-600 mt-3">
                <MapPin className="mr-2 text-indigo-400" size={20} />
                <p className="text-sm">{event.location}</p>
              </div>
              <div className="flex items-center text-gray-500 mt-2">
                <Clock className="mr-2 text-indigo-300" size={20} />
                <p className="text-sm">{moment(event.date).format("h:mm A")}</p>
              </div>
              <div className="mt-3 text-sm text-indigo-600 font-semibold">{event.category}</div>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="italic">No Events to Attend Today</p>
      )}
      {selectedEvent && <EventModal event={selectedEvent} onClose={handleCloseModal} />}
    </div>
  )
}

