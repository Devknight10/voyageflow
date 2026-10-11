import React, { useState } from 'react';
import {
  X, CheckCircle2, QrCode, Download, Printer, ArrowRight,
  MapPin, Calendar, Clock, Users, ShieldCheck
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';

interface BookingConfirmationProps {
  onGoToDashboard?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ onGoToDashboard }) => {
  const { isConfirmationModalOpen, closeConfirmationModal, currentBooking } = useBooking();
  const [downloading, setDownloading] = useState(false);

  if (!isConfirmationModalOpen || !currentBooking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const receipt = await api.getReceipt(currentBooking.reference_code);
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoyageFlow_Receipt_${currentBooking.reference_code}.json`;
      a.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const primaryPassenger = currentBooking.passenger_details?.[0]?.name || 'Valued Traveler';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
            BOOKING CONFIRMED & PAID
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-2">
            Have a Wonderful Journey!
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Your reservation has been confirmed and locked in inventory.
          </p>

          <button
            onClick={closeConfirmationModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Reference Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Booking Reference
              </div>
              <div className="text-2xl font-mono font-black text-blue-600 tracking-wider">
                {currentBooking.reference_code}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Paid
              </div>
              <div className="text-xl font-black text-slate-900">
                ${currentBooking.total_amount.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Ticket Breakdown */}
          <div className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] font-black uppercase">Service / Stay</span>
                <span className="text-slate-900 font-extrabold text-sm">{currentBooking.item_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-black uppercase">Primary Passenger</span>
                <span className="text-slate-900 font-extrabold text-sm">{primaryPassenger}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-black uppercase">Travel Date</span>
                <span className="text-slate-900 font-extrabold">{currentBooking.travel_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-black uppercase">Scheduled Time</span>
                <span className="text-slate-900 font-extrabold">{currentBooking.travel_time || '10:00 AM'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">From: {currentBooking.pickup_location || 'Anna Salai Central'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">To: {currentBooking.dropoff_location || 'Destination'}</span>
              </div>
            </div>
          </div>

          {/* QR Code Graphic Box */}
          <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                Digital Boarding Pass
              </div>
              <div className="text-[11px] text-slate-400">
                Present this QR code to your chauffeur or concierge desk for express check-in.
              </div>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center text-slate-900 shadow-md">
              <QrCode className="w-12 h-12" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Boarding Pass</span>
            </button>
            <button
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/15"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital Receipt</span>
            </button>
          </div>

          {onGoToDashboard && (
            <button
              onClick={() => {
                closeConfirmationModal();
                onGoToDashboard();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-1.5"
            >
              <span>View all upcoming trips in My Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
