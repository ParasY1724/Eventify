import { memo, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

export const EventCard = memo(function EventCard({
  _id,
  name,
  date,
  location,
  imageUrl,
  attendees,
  category,
  description,
  creator,
  onOpenModal,
}) {
  const { joinEventRoom, leaveEventRoom } = useSocket();


  const handleClick = () => {
    onOpenModal({
      _id,
      name,
      date,
      location,
      imageUrl,
      attendees,
      category,
      description,
      creator,
    });
  };
  useEffect(()=>{
    joinEventRoom(_id);
    return () => {
      leaveEventRoom(_id);
    };
  },[_id]);

  return (
    <div className="relative rounded-2xl overflow-hidden group cursor-pointer" onClick={handleClick}>
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={name}
        className="w-full h-[280px] object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-100" />
      <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-semibold text-lg mb-2 transition-transform duration-300 group-hover:-translate-y-1">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-300 text-sm">
              {new Date(date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-white text-sm">{attendees?.length || 0}</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">{category}</span>
        </div>
      </div>
    </div>
  );
});