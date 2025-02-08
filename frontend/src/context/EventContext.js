import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';

const EventContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const initialState = {
  upcomingEvents: [],
  pastEvents: [],
  topAttendedEvents: [],
  calendarEvents: {},
  loading: false,
  error: null,
  searchResults: null,
  connectionStatus: 'disconnected'
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_UPCOMING_EVENTS: 'SET_UPCOMING_EVENTS',
  SET_PAST_EVENTS: 'SET_PAST_EVENTS',
  SET_TOP_ATTENDED_EVENTS: 'SET_TOP_ATTENDED_EVENTS',
  SET_CALENDAR_EVENTS: 'SET_CALENDAR_EVENTS',
  UPDATE_EVENT_IN_ALL_LISTS: 'UPDATE_EVENT_IN_ALL_LISTS',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  DELETE_EVENT_FROM_ALL_LISTS: 'DELETE_EVENT_FROM_ALL_LISTS',
  NEW_EVENT:"NEW_EVENT"
};

const eventReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ACTIONS.SET_UPCOMING_EVENTS:
      return { ...state, upcomingEvents: action.payload };
      
    case ACTIONS.SET_PAST_EVENTS:
      return { ...state, pastEvents: action.payload };
      
    case ACTIONS.SET_TOP_ATTENDED_EVENTS:
      return { ...state, topAttendedEvents: action.payload };
      
    case ACTIONS.SET_CALENDAR_EVENTS:
      return { ...state, calendarEvents: action.payload };
      
    case ACTIONS.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };

    case ACTIONS.NEW_EVENT: {
      const newEvent = action.payload;
      
      // Helper function to add new event to a list if it matches criteria
      const addEventToList = (events) => {
        // Create a Map for efficient duplicate checking
        const eventMap = new Map(events.map(event => [event._id, event]));
        
        // Only add if event doesn't already exist
        if (!eventMap.has(newEvent._id)) {
          return [...events, newEvent];
        }
        return events;
      };
    
      // Update calendar events
      const updatedCalendarEvents = { ...state.calendarEvents };
      const eventDate = new Date(newEvent.date).toISOString().split('T')[0];
      if (updatedCalendarEvents[eventDate]) {
        updatedCalendarEvents[eventDate] = addEventToList(updatedCalendarEvents[eventDate]);
      } else {
        updatedCalendarEvents[eventDate] = [newEvent];
      }
    
      // Helper to check if event should be in upcoming list
      const isUpcoming = new Date(newEvent.date) > new Date();
      
      // Helper to check if event should be in past list
      const isPast = new Date(newEvent.date) < new Date();
    
      return {
        ...state,
        upcomingEvents: isUpcoming ? addEventToList(state.upcomingEvents) : state.upcomingEvents,
        pastEvents: isPast ? addEventToList(state.pastEvents) : state.pastEvents,
        topAttendedEvents: newEvent.attendees?.length >= 10 ? 
          addEventToList(state.topAttendedEvents) : state.topAttendedEvents,
        calendarEvents: updatedCalendarEvents,
        // Only update search results if they exist and the new event matches current search
        searchResults: state.searchResults?.query && 
          newEvent.title.toLowerCase().includes(state.searchResults.query.toLowerCase()) ? {
            ...state.searchResults,
            events: addEventToList(state.searchResults.events)
          } : state.searchResults
      };
    };

    case ACTIONS.UPDATE_EVENT_IN_ALL_LISTS: {
      const updatedEvent = action.payload;
      
      // Optimize updates by using Map for O(1) lookup
      const updateEventInList = (events) => {
        const eventMap = new Map(events.map(event => [event._id, event]));
        if (eventMap.has(updatedEvent._id)) {
          eventMap.set(updatedEvent._id, { ...eventMap.get(updatedEvent._id), ...updatedEvent });
        }
        return Array.from(eventMap.values());
      };

      // Optimize calendar events update
      const updatedCalendarEvents = {};
      for (const [date, events] of Object.entries(state.calendarEvents)) {
        const updatedEvents = updateEventInList(events);
        if (updatedEvents.length > 0) {
          updatedCalendarEvents[date] = updatedEvents;
        }
      }

      return {
        ...state,
        upcomingEvents: updateEventInList(state.upcomingEvents),
        pastEvents: updateEventInList(state.pastEvents),
        topAttendedEvents: updateEventInList(state.topAttendedEvents),
        calendarEvents: updatedCalendarEvents,
        searchResults: state.searchResults ? {
          ...state.searchResults,
          events: updateEventInList(state.searchResults.events)
        } : null
      };
    }

    case ACTIONS.DELETE_EVENT_FROM_ALL_LISTS: {
      const eventId = action.payload;

      const filterEventFromList = (events) =>
        events.filter(event => event._id !== eventId);

      const updatedCalendarEvents = Object.fromEntries(
        Object.entries(state.calendarEvents).map(([date, events]) => [
          date,
          filterEventFromList(events)
        ])
      );

      const updatedSearchResults = state.searchResults ? {
        ...state.searchResults,
        events: filterEventFromList(state.searchResults.events)
      } : null;

      return {
        ...state,
        upcomingEvents: filterEventFromList(state.upcomingEvents),
        pastEvents: filterEventFromList(state.pastEvents),
        topAttendedEvents: filterEventFromList(state.topAttendedEvents),
        calendarEvents: updatedCalendarEvents,
        searchResults: updatedSearchResults
      };
    }

    default:
      return state;
  }
};

export function EventProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  const fetchEvents = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const events = await response.json();
      const now = new Date();

      const upcoming = events
        .filter(event => (new Date(event.date) > now))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const past = events
        .filter(event => new Date(event.date) <= now)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const topAttended = [...events]
        .sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0))
        .slice(0, 3);

      const calendarEvents = events.reduce((acc, event) => {
        const date = event.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
      }, {});

      dispatch({ type: ACTIONS.SET_UPCOMING_EVENTS, payload: upcoming });
      dispatch({ type: ACTIONS.SET_PAST_EVENTS, payload: past });
      dispatch({ type: ACTIONS.SET_TOP_ATTENDED_EVENTS, payload: topAttended });
      dispatch({ type: ACTIONS.SET_CALENDAR_EVENTS, payload: calendarEvents });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const attendEvent = useCallback(async (eventId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/attend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedEvent = await response.json();
      dispatch({ type: ACTIONS.UPDATE_EVENT_IN_ALL_LISTS, payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const leaveEvent = useCallback(async (eventId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedEvent = await response.json();
      dispatch({ type: ACTIONS.UPDATE_EVENT_IN_ALL_LISTS, payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const searchEvents = useCallback(async ({ query, category }) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const searchParams = new URLSearchParams({
        ...(query && { q: query }),
        ...(category && { category })
      });
      
      const response = await fetch(`${BACKEND_URL}/api/events/search?${searchParams}`);
      if (!response.ok) throw new Error('Search failed');
      
      const results = await response.json();
      dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await fetch(`${BACKEND_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create event');

      const newEvent = await response.json();
      dispatch({ type: ACTIONS.UPDATE_EVENT_IN_ALL_LISTS, payload: newEvent });
      return newEvent;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const updateEventInAllLists = useCallback((event) => {
    dispatch({ type: ACTIONS.UPDATE_EVENT_IN_ALL_LISTS, payload: event });
  }, []);

  const addNewEventInAllLists = useCallback((event) => {
    dispatch({type:ACTIONS.NEW_EVENT,payload:event});
  },[]);

  const deleteEventFromAllLists = useCallback((eventId) => {
    dispatch({ type: ACTIONS.DELETE_EVENT_FROM_ALL_LISTS, payload: eventId });
  }, []);

  const updateEvent = useCallback(async (eventId, eventData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const formData = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
  
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }
  
      const updatedEvent = await response.json();
      dispatch({ type: ACTIONS.UPDATE_EVENT_IN_ALL_LISTS, payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);
  
  useEffect(()=>{
    fetchEvents(); 
  },[])

  const value = useMemo(() => ({
    ...state,
    fetchEvents,
    attendEvent,
    leaveEvent,
    searchEvents,
    createEvent,
    clearError,
    updateEvent,
    updateEventInAllLists,
    deleteEventFromAllLists,
    addNewEventInAllLists
  }), [state, fetchEvents, attendEvent, leaveEvent, searchEvents, createEvent, 
      clearError,updateEvent, updateEventInAllLists, deleteEventFromAllLists]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
