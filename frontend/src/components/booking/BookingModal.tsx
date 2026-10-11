import React, { useState } from 'react';
import {
  X, Calendar, Clock, MapPin, Users, ShieldCheck, Tag,
  ArrowRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const BookingModal: React.FC = () => {
  const { draft, isBookingModalOpen, closeBookingModal, proceedToPayment } = useBooking();
  const { user } = useAuth();

  const [travelDate, setTravelDate] = useState(draft?.initialDate || new Date().toISOString().split('T')[0]);
  const [travelTime, setTravelTime] = useState('10:00 AM');
  const [pickupLocation, setPickupLocation] = useState(draft?.pickupLocation || 'Central Departure Station');
  const [dropoffLocation, setDropoffLocation] = useState(draft?.dropoffLocation || 'Destination Terminal');
  const [passengersCount, setPassengersCount] = useState(1);
  const [passengerName, setPassengerName] = useState(user?.full_name || 'Elena Rostova');
  const [passengerAge, setPassengerAge] = useState(28);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isBookingModalOpen || !draft || !draft.item) return null;

  // Calculate base price
  const isTransport = draft.type === 'transport';
  const item = draft.item;
  const baseRate = isTransport
    ? ((item as any).base_fare || 25) + ((draft.tripDistanceKm || 12) * ((item as any).per_km_rate || 1.5))
    : ((item as any).price || 50);
  
  const subtotal = Math.round(baseRate * passengersCount * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const fees = 2.50;
  
  let discount = 0;
  if (appliedCoupon === 'VOYAGE20') {
    discount = Math.round(subtotal * 0.20 * 100) / 100;
  } else if (appliedCoupon === 'WELCOME10') {
    discount = Math.min(subtotal, 10.00);
  }

  const grandTotal = Math.max(1.0, Math.round((subtotal + tax + fees - discount) * 100) / 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (code === 'VOYAGE20' || code === 'WELCOME10') {
      setAppliedCoupon(code);
    } else {
      setCouponError('Invalid coupon code. Try VOYAGE20 or WELCOME10.');
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const booking = await api.createBooking({
        booking_type: draft.type,
        item_id: item.id,
        item_name: item.name,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        pickup_lat: draft.pickupCoords ? draft.pickupCoords[0] : (item as any).lat,
        pickup_lng: draft.pickupCoords ? draft.pickupCoords[1] : (item as any).lng,
        dropoff_lat: draft.dropoffCoords ? draft.dropoffCoords[0] : (item as any).lat,
        dropoff_lng: draft.dropoffCoords ? draft.dropoffCoords[1] : (item as any).lng,
        travel_date: travelDate,
        travel_time: travelTime,
        passengers_count: passengersCount,
        passenger_details: [{ name: passengerName, age: passengerAge }],
        subtotal: subtotal,
        coupon_code: appliedCoupon || undefined,
      });

      proceedToPayment(booking);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize booking session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Checkout & Confirmation
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Book {item.name}
            </h3>
          </div>
          <button
            onClick={closeBookingModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCreateBooking} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Trip Itinerary */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              1. Travel Schedule & Route
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Travel Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Departure Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={travelTime}
                    onChange={(e) => setTravelTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Pickup Point
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Destination / Drop-off
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 truncate"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Primary Passenger Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              2. Passenger Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Primary Traveler Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Passengers
                </label>
                <select
                  value={passengersCount}
                  onChange={(e) => setPassengersCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Coupon Code */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. VOYAGE20)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Coupon {appliedCoupon} applied successfully!
              </p>
            )}
            {couponError && (
              <p className="text-xs text-rose-600 font-bold mt-1.5">
                {couponError}
              </p>
            )}
          </div>

          {/* Section 4: Price Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Base Fare ({passengersCount} traveler{passengersCount > 1 ? 's' : ''})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Standard Taxes & Surcharges (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Platform Insurance & Safe Transit Fee</span>
              <span>${fees.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Discount ({appliedCoupon})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Total Booking Amount</span>
              <span className="text-lg text-blue-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Cancellation Notice */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>VoyageFlow Guarantee: Free cancellation & full instant refund up to scheduled departure.</span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Reserving Inventory...</span>
            ) : (
              <>
                <span>Proceed to Secure Payment (${grandTotal.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
