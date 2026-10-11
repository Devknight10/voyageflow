import React from 'react';
import { Star, Heart, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Destination } from '../../services/types';
import { useWishlist } from '../../context/WishlistContext';
import { useBooking } from '../../context/BookingContext';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails?: (d: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onViewDetails }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { startBooking } = useBooking();
  const saved = isWishlisted(destination.id);

  return (
    <div className="card-hover group bg-white rounded-3xl p-3 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        {/* Thumbnail Container */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-3.5 bg-slate-100">
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Category Pill */}
          <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {destination.category}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(destination.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md shadow-md transition-all active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                saved ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
              }`}
            />
          </button>

          {/* Proximity Badge if GPS calculated */}
          {destination.dist_km !== undefined && destination.dist_km !== null && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-blue-600 fill-blue-600" />
              <span className="text-xs font-black text-slate-900">
                {destination.dist_km < 1 ? 'Under 1 km' : `${destination.dist_km.toFixed(1)} km`}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">away</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="px-1.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-extrabold text-base text-slate-900 truncate leading-snug">
              {destination.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-slate-900">{destination.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2 font-medium">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{destination.city}, {destination.country}</span>
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {destination.description}
          </p>
        </div>
      </div>

      {/* Pricing & Booking Footer */}
      <div className="pt-3 px-1.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-slate-900">
            {destination.price === 0 ? 'Free' : `$${destination.price}`}
          </span>
          {destination.price > 0 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
              / {destination.unit}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(destination)}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Details
            </button>
          )}
          <button
            type="button"
            onClick={() => startBooking(destination, 'destination', 'Your City Location', destination.name, undefined, [destination.lat, destination.lng])}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-blue-500/15 transition-all"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};
