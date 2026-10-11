import React from 'react';
import { Car, Navigation, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { TransportService } from '../../services/types';
import { TransportCard } from '../transport/TransportCard';

interface NearbyTransportProps {
  services: TransportService[];
  userCoords?: [number, number] | null;
  onViewAllTransport: () => void;
  onDetectLocation: () => void;
}

export const NearbyTransport: React.FC<NearbyTransportProps> = ({
  services,
  userCoords,
  onViewAllTransport,
  onDetectLocation,
}) => {
  return (
    <section className="py-14 border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-2">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>Multi-Modal Fleet</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Nearby Transportation Options
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tesla rentals, city cabs, high-speed rail, and airport transfers ready for immediate booking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!userCoords && (
              <button
                onClick={onDetectLocation}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Sort by My Location</span>
              </button>
            )}
            <button
              onClick={onViewAllTransport}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/15 transition"
            >
              <span>Explore Entire Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transport Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.slice(0, 4).map((service) => (
            <TransportCard key={service.id} service={service} />
          ))}
        </div>

      </div>
    </section>
  );
};
