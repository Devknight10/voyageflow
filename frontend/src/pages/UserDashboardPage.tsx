import React, { useState, useEffect } from 'react';
import {
  Calendar, MapPin, QrCode, ShieldCheck, AlertCircle, Trash2,
  Download, Printer, Heart, ArrowRight, User, CheckCircle2, Clock, X
} from 'lucide-react';
import { Booking, Destination } from '../services/types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DestinationCard } from '../components/home/FeaturedSection';

interface UserDashboardProps {
  onNavigateToTab: (tab: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardProps> = ({ onNavigateToTab }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'wishlist'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cancellation modal
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Digital Ticket Modal
  const [viewingTicket, setViewingTicket] = useState<Booking | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, wishlistData] = await Promise.all([
        api.getUserBookings(),
        api.getWishlist(),
      ]);
      setBookings(bookingsData);
      setWishlistItems(wishlistData);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const res = await api.cancelBooking(cancellingBooking.id, cancelReason);
      setCancelSuccessMsg(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafbfe] pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
          <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-xl font-black text-slate-900">Sign In to View Trips</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Access your verified booking confirmations, digital boarding passes, and receipts.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-black"
          >
            Sign In with 1-Click Demo
          </button>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const pastBookings = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-[#fafbfe] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {user?.full_name || user?.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-lg font-black text-slate-900">{bookings.length}</div>
              <div className="text-[10px] uppercase text-slate-400">Total Bookings</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-lg font-black text-emerald-600">{upcomingBookings.length}</div>
              <div className="text-[10px] uppercase text-slate-400">Active Trips</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-lg font-black text-rose-500">{wishlistItems.length}</div>
              <div className="text-[10px] uppercase text-slate-400">Wishlist Saved</div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 mb-8 pb-3">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upcoming Trips ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition ${
              activeTab === 'past'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cancelled & Past ({pastBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Wishlist ({wishlistItems.length})</span>
          </button>
        </div>

        {/* Tab Content: Upcoming Trips */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No active bookings scheduled</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Discover a seaside stay or book a Tesla EV rental to begin your journey.</p>
                <button
                  onClick={() => onNavigateToTab('home')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                        {b.reference_code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900">{b.item_name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {b.travel_date} ({b.travel_time || '10:00 AM'})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {b.dropoff_location || 'Destination'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-left sm:text-right pr-4">
                      <div className="text-[10px] font-black uppercase text-slate-400">Total Fare</div>
                      <div className="text-2xl font-black text-slate-900">${b.total_amount.toFixed(2)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingTicket(b)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black flex items-center gap-1.5 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Boarding Pass</span>
                      </button>

                      <button
                        onClick={() => {
                          setCancellingBooking(b);
                          setCancelSuccessMsg(null);
                        }}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-black transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Past / Cancelled */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                <p className="text-xs text-slate-400">No past or cancelled trips on file.</p>
              </div>
            ) : (
              pastBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 opacity-75 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">{b.reference_code}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                        {b.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{b.item_name}</h3>
                    <p className="text-xs text-slate-400">{b.travel_date} · {b.dropoff_location}</p>
                    {b.cancellation_reason && (
                      <p className="text-[11px] text-rose-600 mt-1">Reason: {b.cancellation_reason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900">${b.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8">
                <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Click the heart icon on any destination card to save it here.</p>
                <button
                  onClick={() => onNavigateToTab('home')}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black"
                >
                  Discover Stays & Tours
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <DestinationCard key={item.id} destination={item} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-black text-slate-900">Cancel Booking</h3>
            </div>
            
            {cancelSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold space-y-2">
                <p>{cancelSuccessMsg}</p>
                <button
                  onClick={() => setCancellingBooking(null)}
                  className="w-full mt-2 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to cancel reservation <span className="font-mono font-bold">{cancellingBooking.reference_code}</span> for <span className="font-bold">{cancellingBooking.item_name}</span>?
                </p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-emerald-700 font-bold border border-emerald-100">
                  Full instant refund eligible: ${cancellingBooking.total_amount.toFixed(2)}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cancellation Reason</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option>Change of travel plans</option>
                    <option>Found alternate transportation</option>
                    <option>Weather or scheduling conflict</option>
                    <option>Booked by mistake</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCancellingBooking(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelLoading}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ticket QR Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setViewingTicket(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{viewingTicket.item_name}</h3>
            <p className="font-mono text-sm font-black text-blue-600 mt-1">{viewingTicket.reference_code}</p>
            <div className="my-4 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
              <QrCode className="w-36 h-36" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Present to chauffeur or front desk for instant verification.</p>
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Boarding Pass</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
