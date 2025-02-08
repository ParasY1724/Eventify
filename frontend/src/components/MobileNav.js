import { Home, Calendar, User, PlusCircle,Clipboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={24} />, label: 'Home', path: '/' },
    { icon: <Clipboard size={24} />, label: 'My Events', path: '/my-events' },
    { icon: <Calendar size={24} />, label: 'Calendar', path: '/calendar' },
    { icon: <User size={24} />, label: 'Profile', path: '/profile' },
    { icon: <PlusCircle size={24} />, label: 'Create', path: '/create-event' }
  ];

  return (
    <nav className="flex justify-around items-center p-2 bg-white border-t">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`p-2 rounded-lg flex flex-col items-center ${
            location.pathname === item.path
              ? 'text-amber-900'
              : 'text-gray-600'
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}