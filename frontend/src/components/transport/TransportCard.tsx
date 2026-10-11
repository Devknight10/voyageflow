import React from 'react';
import { Users, Star, ShieldCheck, Zap, Navigation, ArrowRight } from 'lucide-react';
import { TransportService } from '../../services/types';
import { useBooking } from '../../context/BookingContext';

interface TransportCardProps {
  service: TransportService;
  tripDistanceKm?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export const TransportCard: React.FC<TransportCardProps> = ({
  service,
  tripDistanceKm,
  pickupLocation,
  dropoffLocation,
}) => {
  const { startBooking } = useBooking();

  // Calculate final dynamic fare
  const finalPrice = tripDistanceKm
    ? Math.round((service.base_fare + tripDistanceKm * service.per_km_rate) * 100) / 100
    : service.base_fare;

  return (
    <div className="card-hover group bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-5 items-stretch">
      
      {/* Vehicle Image */}
      <div className="relative md:w-56 rounded-2xl overflow-hidden aspect-[16/10] md:aspect-auto bg-slate-100 shrink-0">
        <img
          src={service.image_url}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
          {service.type.replace('_', ' ')}
        </div>
        {service.is_available && (
          <div className="absolute bottom-2.5 left-2.5 bg-emerald-500/95 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Available Now</span>
          </div>
        )}
      </div>

      {/* Middle Specs */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                {service.provider_name || 'Voyage Transit'}
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                {service.name}
              </h3>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 text-amber-700 text-xs font-black shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{service.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-500 mb-3">
            Model: {service.vehicle_model}
          </p>

          {/* Features Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
              <Users className="w-3 h-3 text-slate-500" />
              {service.capacity} Seats
            </span>
            {service.features && service.features.slice(0, 3).map((feat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Cancellation Guarantee */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{service.cancellation_policy}</span>
        </div>
      </div>

      {/* Right Pricing & Book Action */}
      <div className="md:w-48 md:border-l border-slate-100 md:pl-5 flex flex-col justify-between items-start md:items-end pt-3 md:pt-1 border-t md:border-t-0">
        <div className="text-left md:text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {tripDistanceKm ? `Est. Trip (${tripDistanceKm.toFixed(1)} km)` : 'Base Fare'}
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${finalPrice.toFixed(2)}
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            + ${service.per_km_rate}/km
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            startBooking(
              service,
              'transport',
              pickupLocation || 'Anna Salai Central, Chennai',
              dropoffLocation || 'Destination Terminal',
              undefined,
              undefined,
              tripDistanceKm
            )
          }
          className="w-full mt-3 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 group/btn"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
