import React from 'react';
import { Navigation, ShieldCheck, CreditCard, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Navigation className="w-5 h-5 transform -rotate-45" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Voyage<span className="text-blue-500">Flow</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The next-generation unified travel and transportation booking platform. Discover stays, book multi-modal transportation, and navigate routes with interactive GPS intelligence.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PCI-DSS Verified Sandbox</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Real-Time GPS Routing</span>
              </div>
            </div>
          </div>

          {/* Column: Discover */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#stays" className="hover:text-white transition">Luxury Seaside Stays</a></li>
              <li><a href="#villas" className="hover:text-white transition">Heritage Boutique Manors</a></li>
              <li><a href="#experiences" className="hover:text-white transition">Cultural Monuments</a></li>
              <li><a href="#nature" className="hover:text-white transition">Eco-Glamping Reserves</a></li>
              <li><a href="#promotions" className="hover:text-white transition">Special Seasonal Offers</a></li>
            </ul>
          </div>

          {/* Column: Transport */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Transportation</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#tesla" className="hover:text-white transition">Tesla EV Rentals</a></li>
              <li><a href="#taxis" className="hover:text-white transition">Rapid City Taxis</a></li>
              <li><a href="#metro" className="hover:text-white transition">Metro Rail Transit</a></li>
              <li><a href="#shuttles" className="hover:text-white transition">VIP Airport Transfers</a></li>
              <li><a href="#marine" className="hover:text-white transition">Coastal Ferry & Boats</a></li>
            </ul>
          </div>

          {/* Column: Legal & Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Trust & Help</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#help" className="hover:text-white transition">24/7 Traveler Concierge</a></li>
              <li><a href="#cancellation" className="hover:text-white transition">Refund & Cancellation Terms</a></li>
              <li><a href="#safety" className="hover:text-white transition">Verified Provider Policy</a></li>
              <li><a href="#privacy" className="hover:text-white transition">Privacy & Location Data</a></li>
              <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 VoyageFlow Global Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted for modern world travelers <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
