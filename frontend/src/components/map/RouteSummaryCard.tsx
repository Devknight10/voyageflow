import React from 'react';
import { Navigation, Clock, Zap, Car, Train, Bus, Bike, ArrowRight } from 'lucide-react';
import { RouteCalculationResponse } from '../../services/types';

interface RouteSummaryCardProps {
  routeData: RouteCalculationResponse;
  onBookMode?: (modeKey: string, fare: number) => void;
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({
  routeData,
  onBookMode,
}) => {
  const modes = [
    { key: 'taxi', name: 'Rapid Cab', icon: Car, fare: routeData.estimated_fares?.taxi || 18.5 },
    { key: 'tesla_rental', name: 'Tesla EV', icon: Zap, fare: routeData.estimated_fares?.tesla_rental || 45.0 },
    { key: 'metro_transit', name: 'Metro Rail', icon: Train, fare: routeData.estimated_fares?.metro_transit || 2.5 },
    { key: 'bus_express', name: 'Express Bus', icon: Bus, fare: routeData.estimated_fares?.bus_express || 4.0 },
    { key: 'ebike', name: 'Smart E-Bike', icon: Bike, fare: routeData.estimated_fares?.ebike || 3.2 },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xl space-y-5">
      
      {/* Route Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Calculated Route
          </span>
          <div className="flex items-center gap-3 text-xs font-black text-slate-700">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              {routeData.distance_km} km
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              ~{routeData.duration_mins} mins
            </span>
          </div>
        </div>

        {/* Origin to Destination Chain */}
        <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {routeData.origin_name}
            </span>
          </div>
          <div className="ml-1.5 w-0.5 h-3 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-sm shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {routeData.dest_name}
            </span>
          </div>
        </div>
      </div>

      {/* Available Transportation Modes */}
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
          Select Transportation Option:
        </h4>
        <div className="space-y-2">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                onClick={() => onBookMode && onBookMode(m.key, m.fare)}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-700 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-blue-700">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Instant Dispatch
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ${m.fare.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold">
                      Est. Total
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
