import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useEvents } from './EventContext';

const SocketContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { updateEventInAllLists, deleteEventFromAllLists,addNewEventInAllLists } = useEvents();
  
  useEffect(() => {
    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('updateAttendees', ({ eventId, attendees, userId, isAttending }) => {
      updateEventInAllLists({ _id: eventId, attendees });
    });

    socketInstance.on('newEvent', (event) => {
        addNewEventInAllLists(event);
    });

    socketInstance.on('updateEvent', (event) => {
      updateEventInAllLists(event);
    });

    socketInstance.on('deleteEvent', (eventId) => {
      deleteEventFromAllLists(eventId);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [updateEventInAllLists, deleteEventFromAllLists]);

  const joinEventRoom = (eventId) => {
    if (socket) {
      socket.emit('joinEvent', { eventId });
    }
  };

  const leaveEventRoom = (eventId) => {
    if (socket) {
      socket.emit('leaveEvent', { eventId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinEventRoom, leaveEventRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};