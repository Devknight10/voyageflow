import React, { useState, useEffect } from 'react';
import {
  Compass, MapPin, Navigation, Calendar, User, Shield,
  LogOut, Sparkles, CheckCircle2, ChevronDown, Heart, Car, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { api } from '../../services/api';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userCoords?: [number, number] | null;
  onDetectLocation?: () => void;
  isLocating?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userCoords,
  onDetectLocation,
  isLocating,
}) => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal, demoLogin } = useAuth();
  const { savedCount } = useWishlist();
  const [backendLive, setBackendLive] = useState<boolean | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.checkHealth()
      .then(() => setBackendLive(true))
      .catch(() => setBackendLive(false));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
            <Navigation className="w-6 h-6 transform -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Voyage<span className="text-blue-600">Flow</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
              Travel Ecosystem
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              currentTab === 'home'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setCurrentTab('transport')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'transport'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Transport
          </button>
          <button
            onClick={() => setCurrentTab('map')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'map'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            GPS Map
          </button>
          <button
            onClick={() => setCurrentTab('trips')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'trips'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            My Trips
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </div>

        {/* Right Section: Status, GPS & User */}
        <div className="flex items-center gap-3">
          
          {/* Backend Status Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
              backendLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title="FastAPI server connectivity"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{backendLive ? 'API LIVE' : 'CONNECTING'}</span>
          </div>

          {/* Location Badge / Button */}
          {onDetectLocation && (
            <button
              onClick={onDetectLocation}
              disabled={isLocating}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                userCoords
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-bounce' : ''}`} />
              <span>{isLocating ? 'Locating...' : userCoords ? 'GPS Active' : 'Detect GPS'}</span>
            </button>
          )}

          {/* Wishlist Icon */}
          <button
            onClick={() => setCurrentTab('trips')}
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition"
            title="Saved Destinations"
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {user.full_name ? user.full_name[0] : user.username[0].toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.full_name || user.username}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setCurrentTab('trips'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      My Bookings & Receipts
                    </button>
                    {isAdmin ? (
                      <button
                        onClick={() => { setCurrentTab('admin'); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Admin Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => { demoLogin('admin'); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Switch to Demo Admin
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { demoLogin('traveler'); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        Switch to Demo Traveler
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-blue-600 transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          <button
            onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            Explore Destinations
          </button>
          <button
            onClick={() => { setCurrentTab('transport'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold ${
              currentTab === 'transport' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            Transportation Hub
          </button>
          <button
            onClick={() => { setCurrentTab('map'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold ${
              currentTab === 'map' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            Interactive GPS Map
          </button>
          <button
            onClick={() => { setCurrentTab('trips'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold ${
              currentTab === 'trips' ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            My Trips & Boarding Passes
          </button>
          {isAdmin && (
            <button
              onClick={() => { setCurrentTab('admin'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold ${
                currentTab === 'admin' ? 'bg-purple-50 text-purple-600' : 'text-purple-700'
              }`}
            >
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
