import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users, Navigation, Sparkles, Car } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (params: { query: string; category: string; date?: string }) => void;
  onDetectLocation: () => void;
  isLocating?: boolean;
  userCoords?: [number, number] | null;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  onDetectLocation,
  isLocating,
  userCoords,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [travelDate, setTravelDate] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, category, date: travelDate });
  };

  return (
    <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200/60">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-tr from-blue-400/10 to-indigo-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Floating Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-blue-200/80 text-blue-700 text-xs font-black shadow-sm mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Generation Travel & Transit Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
          Your Journey <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Starts Here.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Discover luxury seaside retreats, book on-demand Tesla rentals and rapid city transit, and calculate GPS routes seamlessly in one unified platform.
        </p>

        {/* Unified Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-4xl mx-auto bg-white rounded-3xl lg:rounded-full shadow-2xl shadow-slate-900/10 p-2.5 border border-slate-200/90 flex flex-col lg:flex-row items-center gap-2 text-left"
        >
          {/* Destination Field */}
          <div className="flex-1 w-full px-5 py-2.5 lg:border-r border-slate-100">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
              Where to?
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stays, cities, vehicles..."
                className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Travel Date Field */}
          <div className="flex-1 w-full px-5 py-2.5 lg:border-r border-slate-100">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
              When
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-44 px-5 py-2.5">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer"
            >
              <option value="all">Everything</option>
              <option value="stays">Luxury Stays</option>
              <option value="transport">Transportation</option>
              <option value="experiences">Experiences</option>
              <option value="attractions">Attractions</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-2xl lg:rounded-full font-black text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 shrink-0 group"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Search</span>
          </button>
        </form>

        {/* Quick Location Button & Popular Tags */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : userCoords ? 'Location Pin Active' : 'Use My Location'}</span>
          </button>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <span className="text-slate-400">Popular:</span>
          {['Ocean Azure', 'Tesla Model S', 'Shore Temple', 'Metro Connect'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => { setQuery(tag); onSearch({ query: tag, category: 'all' }); }}
              className="px-3 py-1 rounded-full bg-white/70 hover:bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition"
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
