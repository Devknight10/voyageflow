import React, { useState, useEffect } from 'react';
import {
  Sparkles, Compass, MapPin, Star, ArrowRight, ShieldCheck,
  Zap, Heart, X, CheckCircle2
} from 'lucide-react';
import { HeroSearch } from '../components/home/HeroSearch';
import { CategoryPills } from '../components/home/CategoryPills';
import { DestinationCard } from '../components/home/FeaturedSection';
import { NearbyTransport } from '../components/home/NearbyTransport';
import { Destination, TransportService } from '../services/types';
import { api } from '../services/api';
import { useBooking } from '../context/BookingContext';

interface HomePageProps {
  onNavigateToTab: (tab: string) => void;
  userCoords: [number, number] | null;
  onDetectLocation: () => void;
  isLocating: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTab,
  userCoords,
  onDetectLocation,
  isLocating,
}) => {
  const { startBooking } = useBooking();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [transportServices, setTransportServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  useEffect(() => {
    loadContent();
  }, [activeCategory, searchQuery, userCoords]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const destParams: any = {};
      if (searchQuery) destParams.query = searchQuery;
      if (activeCategory !== 'all') {
        if (['stays', 'experiences', 'attractions'].includes(activeCategory)) {
          destParams.category = activeCategory;
        }
      }
      if (userCoords) {
        destParams.lat = userCoords[0];
        destParams.lng = userCoords[1];
        destParams.sort_by = 'distance';
      }

      const [destRes, transRes] = await Promise.all([
        api.getDestinations(destParams),
        api.getTransportServices({
          type: ['car', 'taxi', 'bus', 'train', 'airport_transfer', 'rental', 'bike', 'boat'].includes(activeCategory)
            ? activeCategory
            : undefined,
          lat: userCoords ? userCoords[0] : undefined,
          lng: userCoords ? userCoords[1] : undefined,
        }),
      ]);

      setDestinations(destRes);
      setTransportServices(transRes);
    } catch (err) {
      console.error('Failed to load home page content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (params: { query: string; category: string }) => {
    setSearchQuery(params.query);
    setActiveCategory(params.category);
  };

  return (
    <div className="min-h-screen bg-[#fafbfe]">
      
      {/* Hero Section with Unified Search */}
      <HeroSearch
        onSearch={handleHeroSearch}
        onDetectLocation={onDetectLocation}
        isLocating={isLocating}
        userCoords={userCoords}
      />

      {/* Main Discover Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Category Filter Pills */}
        <div className="mb-8">
          <CategoryPills
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2">
              <Compass className="w-3 h-3 text-blue-600" />
              <span>Curated Discoveries</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : userCoords ? 'Recommended Near Your GPS' : 'Popular Destinations & Stays'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top-rated seaside villas, heritage sanctuaries, and boutique retreats.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('map')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-800 hover:bg-slate-50 shadow-sm transition self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Switch to GPS Map View</span>
          </button>
        </div>

        {/* Grid of Destination Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl shimmer" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No destinations found matching your filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or searching for another keyword.</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                onViewDetails={setSelectedDestination}
              />
            ))}
          </div>
        )}

        {/* Promotional Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Exclusive Summer Offer
            </span>
            <h3 className="text-3xl sm:text-4xl font-black mt-3 leading-tight">
              Get 20% Off Your First Ride or Seaside Stay
            </h3>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">
              Use code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">VOYAGE20</span> at checkout to unlock instant discounts across all Tesla rentals, boutique villas, and airport transfers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateToTab('transport')}
                className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-100 transition shadow-lg"
              >
                Browse Fleet
              </button>
              <button
                onClick={() => onNavigateToTab('map')}
                className="bg-black/30 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-black/40 transition backdrop-blur-sm"
              >
                Open Route Map
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Live Nearby Transport Section */}
      <NearbyTransport
        services={transportServices}
        userCoords={userCoords}
        onViewAllTransport={() => onNavigateToTab('transport')}
        onDetectLocation={onDetectLocation}
      />

      {/* Destination Details Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="relative aspect-[16/9] w-full bg-slate-100">
              <img
                src={selectedDestination.image_url}
                alt={selectedDestination.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-md transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black uppercase">
                {selectedDestination.category}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-2xl font-black text-slate-900">
                    {selectedDestination.name}
                  </h3>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-black">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{selectedDestination.rating}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedDestination.city}, {selectedDestination.country}</span>
                </p>
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  {selectedDestination.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedDestination.amenities && selectedDestination.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Key Features & Amenities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Booking Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rate per {selectedDestination.unit}
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {selectedDestination.price === 0 ? 'Free Entry' : `$${selectedDestination.price}`}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const dest = selectedDestination;
                    setSelectedDestination(null);
                    startBooking(dest, 'destination', 'Your City Location', dest.name, undefined, [dest.lat, dest.lng]);
                  }}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 transition"
                >
                  Book Reservation Now
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
