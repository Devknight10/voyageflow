import React, { useState, useEffect } from 'react';
import {
  Shield, DollarSign, TrendingUp, Users, Car, CheckCircle2,
  XCircle, Clock, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import { AdminStats, Booking, TransportService } from '../services/types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, demoLogin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fleet, setFleet] = useState<TransportService[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, statusFilter]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, fleetRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllBookings(statusFilter !== 'ALL' ? statusFilter : undefined),
        api.getTransportServices({ available_only: false }),
      ]);
      setStats(statsRes);
      setBookings(bookingsRes);
      setFleet(fleetRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleToggleFleet = async (serviceId: number, currentAvailable: boolean) => {
    try {
      await api.toggleTransportAvailability(serviceId, !currentAvailable);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Fleet toggle failed.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fafbfe] pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
          <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h2 className="text-xl font-black text-slate-900">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            You are currently browsing as a traveler. Switch to the Demo Admin account to view administrative analytics and fleet controls.
          </p>
          <button
            onClick={() => demoLogin('admin')}
            className="w-full py-3 bg-purple-600 text-white rounded-2xl text-xs font-black shadow-md shadow-purple-500/20"
          >
            Switch to Demo Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfe] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider mb-2">
              <Shield className="w-3 h-3 text-purple-600" />
              <span>Administrative Operations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              VoyageFlow Executive Command Center
            </h1>
          </div>

          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Gross Platform Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                ${stats.total_revenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                Verified Escrow Payments
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Confirmed Bookings</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.confirmed_bookings}
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-1">
                Out of {stats.total_bookings} total requests
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Active Vehicles</span>
                <Car className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.total_transport_vehicles}
              </div>
              <div className="text-[11px] text-indigo-600 font-bold mt-1">
                Multi-Modal Fleet Deployed
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Registered Accounts</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {stats.total_users}
              </div>
              <div className="text-[11px] text-purple-600 font-bold mt-1">
                Active Travelers & Staff
              </div>
            </div>
          </div>
        )}

        {/* Section: Bookings Moderation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Bookings Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time transactions, payment states, and passenger assignments.</p>
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-blue-600">
                      {b.reference_code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {b.item_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {b.travel_date}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ${b.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 transition"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Fleet Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900">Transport Fleet Inventory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle live availability for real-time dispatch and bookings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fleet.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={s.image_url}
                    alt={s.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{s.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500">{s.type} · ${s.base_fare}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFleet(s.id, s.is_available)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition ${
                    s.is_available
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {s.is_available ? 'Available' : 'Paused'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
