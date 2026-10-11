import React, { useState, useEffect } from 'react';
import {
  Car, Users, SlidersHorizontal, ArrowUpDown, ShieldCheck,
  Zap, Train, Bus, Plane, Anchor, Bike, Navigation
} from 'lucide-react';
import { TransportService } from '../services/types';
import { TransportCard } from '../components/transport/TransportCard';
import { api } from '../services/api';

interface TransportPageProps {
  userCoords?: [number, number] | null;
}

export const TransportPage: React.FC<TransportPageProps> = ({ userCoords }) => {
  const [services, setServices] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [minCapacity, setMinCapacity] = useState<number>(1);
  const [sortBy, setSortBy] = useState('price_asc');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(15); // 15 km default trip

  const categories = [
    { id: 'all', label: 'All Fleet', icon: Car },
    { id: 'rental', label: 'EV & Luxury Rentals', icon: Zap },
    { id: 'taxi', label: 'Rapid Taxis', icon: Car },
    { id: 'train', label: 'Metro Rail Transit', icon: Train },
    { id: 'bus', label: 'InterCity Coaches', icon: Bus },
    { id: 'airport_transfer', label: 'Airport Shuttles', icon: Plane },
    { id: 'boat', label: 'Boats & Charters', icon: Anchor },
    { id: 'bike', label: 'Smart E-Bikes', icon: Bike },
  ];

  useEffect(() => {
    loadServices();
  }, [selectedType, minCapacity, sortBy, simulatedDistance, userCoords]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getTransportServices({
        type: selectedType !== 'all' ? selectedType : undefined,
        capacity: minCapacity > 1 ? minCapacity : undefined,
        sort_by: sortBy,
        lat: userCoords ? userCoords[0] : undefined,
        lng: userCoords ? userCoords[1] : undefined,
        trip_distance_km: simulatedDistance,
      });
      setServices(data);
    } catch (err) {
      console.error('Failed to load transport services:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2">
            <Car className="w-3 h-3 text-blue-600" />
            <span>Comprehensive Fleet Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Transportation Booking Hub
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Compare verified chauffeured cars, autonomous Tesla rentals, high-speed rail transit, and private charters with guaranteed instant dispatch.
          </p>
        </div>

        {/* Filter & Fare Estimator Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md mb-8 space-y-6">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => {
              const Icon = c.icon;
              const isActive = selectedType === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedType(c.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Filters: Distance Estimator & Seating & Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            
            {/* Dynamic Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Simulate Trip Distance
                </label>
                <span className="text-xs font-black text-blue-600 font-mono">
                  {simulatedDistance} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={simulatedDistance}
                onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1 km (City)</span>
                <span>50 km (Coast)</span>
                <span>100 km (Intercity)</span>
              </div>
            </div>

            {/* Passenger Capacity */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Minimum Passenger Seats
              </label>
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value={1}>Any Seating Capacity</option>
                <option value={2}>2+ Passengers</option>
                <option value={4}>4+ Passengers (Family / Group)</option>
                <option value={6}>6+ Passengers (VIP Van)</option>
                <option value={20}>20+ Passengers (Coach)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Sort Results By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                {userCoords && <option value="distance">Closest to My Location</option>}
              </select>
            </div>

          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-3xl shimmer" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No vehicles match these filter criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the seating capacity or selecting 'All Fleet'.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <TransportCard
                key={service.id}
                service={service}
                tripDistanceKm={simulatedDistance}
                pickupLocation="Anna Salai Central Station"
                dropoffLocation="East Coast Resort Corridor"
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
