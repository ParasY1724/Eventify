import { useEffect } from "react";
import { useEvents } from '../../context/EventContext';
import { Search,ChevronDown } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";

export function SearchHeader({ query, setQuery,category,setCategory}) {
  const { searchEvents, isLoading } = useEvents();
  const {user} = useAuth();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim() || category !== 'all') {
        searchEvents({ query: query.trim(), category: category === 'all' ? '' : category });
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [query, category]);

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search events, organizers, locations..."
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400 absolute right-3 top-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
          )}
        </div>
        
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none px-4 py-3 pr-8 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">All Categories</option>
            <option value="Conference">Conference</option>
            <option value="Workshop">Workshop</option>
            <option value="Meetup">Meetup</option>
            <option value="Concert">Concert</option>
            <option value="Exhibition">Exhibition</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-4" />
        </div>
      </div>

      <a href="/profile" className="flex shadow-sm items-center space-x-4 ml-4">
        <img
          src={user ?user.avatarUrl :"https://v0.dev/placeholder.svg?height=40&width=40"}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-200"
        />
      </a>
    </header>
  );
}
