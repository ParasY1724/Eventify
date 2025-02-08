import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import EventDashboard from './pages/EventDashboard';
import { Profile } from './pages/Profile';
import { CreateEventForm } from './components/events/CreateEventForm';
import { MyEvents } from './pages/MyEvents';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import LandscapeCalendar from './pages/LandscapeCalendar';
import Login from './pages/Login';
import { SocketProvider } from './context/SocketContext';
import { MobileNav } from './components/MobileNav';


const AuthenticatedLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1010);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 990);
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);  
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {!isMobile && <Navbar />}
      <div className="flex-1 relative">
        {children}
      </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
          <MobileNav />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <EventProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mx-auto">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <EventDashboard />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-events"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <MyEvents />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <LandscapeCalendar />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <Profile />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-event"
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <CreateEventForm />
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </SocketProvider>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;