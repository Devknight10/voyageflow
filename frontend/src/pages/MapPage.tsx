import React, { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Route, Compass, Search, ArrowRight,
  ShieldCheck, RefreshCw, Car, Sparkles
} from 'lucide-react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { RouteSummaryCard } from '../components/map/RouteSummaryCard';
import { Destination, TransportService, RouteCalculationResponse } from '../services/types';
import { api } from '../services/api';
import { useBooking } from '../context/BookingContext';

interface MapPageProps {
  userCoords?: [number, number] | null;
  onDetectLocation?: () => void;
  isLocating?: boolean;
}

export const MapPage: React.FC<MapPageProps> = ({
  userCoords,
  onDetectLocation,
  isLocating,
}) => {
  const { startBooking } = useBooking();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [transportServices, setTransportServices] = useState<TransportService[]>([]);
  
  // Route selection states
  const [pickupName, setPickupName] = useState('Anna Salai Central, Chennai');
  const [pickupCoords, setPickupCoords] = useState<[number, number]>([13.0674, 80.2376]);
  
  const [dropoffName, setDropoffName] = useState('Ocean Azure Cliffside Resort');
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>([12.8230, 80.2412]);

  const [routeData, setRouteData] = useState<RouteCalculationResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [clickMode, setClickMode] = useState<'pickup' | 'dropoff'>('dropoff');

  useEffect(() => {
    // Load map markers
    Promise.all([
      api.getDestinations(),
      api.getTransportServices(),
    ]).then(([d, t]) => {
      setDestinations(d);
      setTransportServices(t);
    }).catch(console.error);

    // Initial calculate
    handleCalculateRoute(pickupCoords, dropoffCoords, pickupName, dropoffName);
  }, []);

  const handleCalculateRoute = async (
    pCoords: [number, number],
    dCoords: [number, number],
    pName: string,
    dName: string
  ) => {
    setCalculating(true);
    try {
      const res = await api.calculateRoute({
        origin_lat: pCoords[0],
        origin_lng: pCoords[1],
        dest_lat: dCoords[0],
        dest_lng: dCoords[1],
        origin_name: pName,
        dest_name: dName,
      });
      setRouteData(res);
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (clickMode === 'pickup') {
      const name = `Custom Pickup (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      setPickupCoords([lat, lng]);
      setPickupName(name);
      setClickMode('dropoff');
      handleCalculateRoute([lat, lng], dropoffCoords, name, dropoffName);
    } else {
      const name = `Custom Drop-off (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      setDropoffCoords([lat, lng]);
      setDropoffName(name);
      handleCalculateRoute(pickupCoords, [lat, lng], pickupName, name);
    }
  };

  const handleSetUserAsPickup = () => {
    if (userCoords) {
      setPickupCoords(userCoords);
      setPickupName('My Current GPS Location');
      handleCalculateRoute(userCoords, dropoffCoords, 'My Current GPS Location', dropoffName);
    } else if (onDetectLocation) {
      onDetectLocation();
    }
  };

  const handleBookFromRoute = (modeKey: string, fare: number) => {
    if (!routeData) return;
    // Find matching service
    const matchedService = transportServices.find((s) => s.type === modeKey) || transportServices[0];
    if (matchedService) {
      startBooking(
        matchedService,
        'transport',
        pickupName,
        dropoffName,
        pickupCoords,
        dropoffCoords,
        routeData.distance_km
      );
    }
  };

  const presets = [
    { name: 'Chennai Central Station', coords: [13.0827, 80.2707] as [number, number] },
    { name: 'Airport VIP Terminal', coords: [12.9900, 80.1693] as [number, number] },
    { name: 'Marina Beach Promenade', coords: [13.0418, 80.2824] as [number, number] },
    { name: 'Ocean Azure Resort', coords: [12.8230, 80.2412] as [number, number] },
    { name: 'Shore Temple Heritage', coords: [12.6160, 80.1925] as [number, number] },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfe] pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-1">
              <Route className="w-3 h-3 text-blue-600" />
              <span>Interactive GPS Routing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Interactive GPS Map & Route Navigator
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSetUserAsPickup}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-black text-blue-600 hover:bg-blue-50 shadow-sm transition"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Set GPS Location as Pickup'}</span>
            </button>
          </div>
        </div>

        {/* Layout: Sidebar Controls + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Control Panel */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Pickup & Dropoff Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Select Trip Route
                </span>
                <div className="text-[10px] font-bold text-slate-500">
                  Click mode:{' '}
                  <button
                    onClick={() => setClickMode(clickMode === 'pickup' ? 'dropoff' : 'pickup')}
                    className="font-black text-blue-600 underline"
                  >
                    Setting {clickMode.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* Pickup Point Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Drop-off Point Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Drop-off Location
                </label>
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-rose-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={dropoffName}
                    onChange={(e) => setDropoffName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Popular Hotspots:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setDropoffName(p.name);
                        setDropoffCoords(p.coords);
                        handleCalculateRoute(pickupCoords, p.coords, pickupName, p.name);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-bold transition"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={() => handleCalculateRoute(pickupCoords, dropoffCoords, pickupName, dropoffName)}
                disabled={calculating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
                <span>{calculating ? 'Recalculating Polyline...' : 'Recalculate Route'}</span>
              </button>
            </div>

            {/* Route Summary & Multi-Modal Booking Card */}
            {routeData && (
              <RouteSummaryCard
                routeData={routeData}
                onBookMode={handleBookFromRoute}
              />
            )}

          </div>

          {/* Right Map Viewport */}
          <div className="lg:col-span-7 sticky top-24">
            <InteractiveMap
              className="h-[650px] w-full"
              destinations={destinations}
              transportServices={transportServices}
              userCoords={userCoords}
              pickupCoords={pickupCoords}
              dropoffCoords={dropoffCoords}
              routePolyline={routeData?.polyline_coords || []}
              onMapClick={handleMapClick}
              onSelectDestination={(d) => {
                setDropoffName(d.name);
                setDropoffCoords([d.lat, d.lng]);
                handleCalculateRoute(pickupCoords, [d.lat, d.lng], pickupName, d.name);
              }}
              onSelectTransport={(t) => {
                if (t.current_lat && t.current_lng) {
                  setPickupCoords([t.current_lat, t.current_lng]);
                  setPickupName(`Nearby ${t.name}`);
                  handleCalculateRoute([t.current_lat, t.current_lng], dropoffCoords, `Nearby ${t.name}`, dropoffName);
                }
              }}
            />
            
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-2 font-semibold">
              <span>💡 Click anywhere on the map to set custom pickup & drop-off locations</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Powered by OpenStreetMap & OSRM</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
