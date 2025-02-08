import { useState, useCallback, memo, useEffect } from "react";
import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { User, Mail, Phone } from 'lucide-react';

export const EventModal = memo(function EventModal({ event, onClose }) {
  const { user } = useAuth();
  const [initialEvent, setEvent] = useState(event);
  const { attendEvent, leaveEvent } = useEvents();
  const { joinEventRoom, leaveEventRoom, socket } = useSocket();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAttending, setIsAttending] = useState(
    event.attendees?.some((a) => a._id === user?._id)
  );

  useEffect(() => {
    socket.on("updateAttendees", ({ eventId, attendees, userId, isAttending }) => {
      if (eventId === event._id) {
        setEvent((prev) => ({
          ...prev,
          attendees: attendees,
        }));
        if (user && user._id === userId) {
          setIsAttending(isAttending);
        }
      }
    });

    joinEventRoom(event._id);

    return () => {
      leaveEventRoom(event._id);
    };
  }, [event._id, user?._id, event.attendees]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleAttend = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAttending) {
        await leaveEvent(initialEvent._id);
      } else {
        await attendEvent(initialEvent._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [initialEvent._id, isAttending, attendEvent, leaveEvent]);

  const handleShare = useCallback(async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: initialEvent.name,
        text: `Check out this event: ${initialEvent.name}`,
        url: window.location.href,
      });
    } catch (error) {
      console.log("Error sharing", error);
    }
  }, [initialEvent.name]);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }, []);

  const formatTime = useCallback((date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="relative h-64">
          <img
            src={initialEvent.imageUrl || "/placeholder.svg"}
            alt={initialEvent?.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-3xl font-bold mb-4">{initialEvent?.name}</h2>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {formatDate(initialEvent.date)}
                <span className="mx-1">at</span>
                {formatTime(initialEvent.date)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{initialEvent.location}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{initialEvent.description}</p>

          {/* Attendees Section */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              Attendees ({initialEvent?.attendees?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-4">
              {initialEvent?.attendees?.map((attendee) => (
                <div key={attendee._id} className="flex items-center space-x-2">
                  <img
                    src={attendee.avatarUrl || "/placeholder.svg"}
                    alt={attendee?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{attendee?.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Organizer Section */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Organizer</h3>
            <div className="space-y-2">
              <p className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span>
                  <strong>Name:</strong> {initialEvent.creator?.name}
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>
                  <strong>Email:</strong> {initialEvent.creator?.email}
                </span>
              </p>
              {initialEvent.creator?.phone && (
                <p className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>
                    <strong>Phone:</strong> {initialEvent.creator?.phone}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-between items-center">
          {error && (
            <div className="text-red-500 text-sm mr-4">{error}</div>
          )}
          {new Date(event.date) > new Date() && (
            <button
              onClick={handleAttend}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isAttending
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#0F172A] text-white hover:bg-blue-700"
              }`}
            >
              {isLoading
                ? "Processing..."
                : isAttending
                ? "Cancel Attendance"
                : "Join Event"
              }
            </button>
          )}
          <button
            onClick={handleShare}
            disabled={!navigator.share}
            className="px-6 py-3 bg-gray-100 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Share Event
          </button>
        </div>
      </div>
    </div>
  );
});
