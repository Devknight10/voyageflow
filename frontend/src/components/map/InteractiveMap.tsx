import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Destination, TransportService } from '../../services/types';

interface InteractiveMapProps {
  destinations?: Destination[];
  transportServices?: TransportService[];
  userCoords?: [number, number] | null;
  pickupCoords?: [number, number] | null;
  dropoffCoords?: [number, number] | null;
  routePolyline?: [number, number][];
  onSelectDestination?: (d: Destination) => void;
  onSelectTransport?: (t: TransportService) => void;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations = [],
  transportServices = [],
  userCoords,
  pickupCoords,
  dropoffCoords,
  routePolyline = [],
  onSelectDestination,
  onSelectTransport,
  onMapClick,
  className = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Helper for custom SVG pin icons
  const createIcon = (color: string, iconHtml: string) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="transform: rotate(45deg); color: white; display: flex; align-items: center; justify-content: center;">
            ${iconHtml}
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userCoords || [13.0475, 80.2089]; // Default to Chennai Hub
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User Current Location Pin (Radar Circle + Blue Dot)
    if (userCoords) {
      const userDotIcon = L.divIcon({
        className: 'user-gps-dot',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker(userCoords, { icon: userDotIcon })
        .bindPopup('<b style="font-size: 13px;">Your Current Location</b><br><span style="font-size: 11px; color: #64748b;">GPS Verified</span>')
        .addTo(markersGroup);
    }

    // 2. Pickup Location Pin (Green)
    if (pickupCoords) {
      const pickupIcon = createIcon(
        '#10b981',
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
      );
      L.marker(pickupCoords, { icon: pickupIcon })
        .bindPopup('<b style="font-size: 13px; color: #10b981;">Pickup Point</b>')
        .addTo(markersGroup);
    }

    // 3. Dropoff Location Pin (Red)
    if (dropoffCoords) {
      const dropoffIcon = createIcon(
        '#ef4444',
        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`
      );
      L.marker(dropoffCoords, { icon: dropoffIcon })
        .bindPopup('<b style="font-size: 13px; color: #ef4444;">Drop-off Point</b>')
        .addTo(markersGroup);
    }

    // 4. Destinations Pins
    destinations.forEach((d) => {
      const isStay = d.category === 'stays';
      const color = isStay ? '#4f46e5' : '#f59e0b';
      const iconSvg = isStay
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

      const marker = L.marker([d.lat, d.lng], { icon: createIcon(color, iconSvg) }).addTo(markersGroup);

      const popupContent = `
        <div style="width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <img src="${d.image_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 12px 12px 0 0; margin-bottom: 8px;" />
          <div style="padding: 0 10px 10px 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase;">${d.category}</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${d.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">★ ${d.rating} · ${d.city}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
              <span style="font-size: 14px; font-weight: 900; color: #0f172a;">${d.price === 0 ? 'Free' : '$' + d.price}</span>
              <button id="pop-book-${d.id}" style="background: #2563eb; color: white; border: none; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer;">
                View
              </button>
            </div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`pop-book-${d.id}`);
        if (btn && onSelectDestination) {
          btn.onclick = () => onSelectDestination(d);
        }
      });
    });

    // 5. Transportation Pins
    transportServices.forEach((s) => {
      if (s.current_lat && s.current_lng) {
        const carIcon = createIcon(
          '#0284c7',
          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
        );
        const marker = L.marker([s.current_lat, s.current_lng], { icon: carIcon }).addTo(markersGroup);

        const popupContent = `
          <div style="width: 210px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <img src="${s.image_url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 12px 12px 0 0; margin-bottom: 8px;" />
            <div style="padding: 0 10px 10px 10px;">
              <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase;">${s.type}</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${s.name}</div>
              <div style="font-size: 11px; color: #64748b;">★ ${s.rating} · ${s.capacity} Seats</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
                <span style="font-size: 14px; font-weight: 900; color: #0f172a;">$${s.base_fare}</span>
                <button id="pop-trans-${s.id}" style="background: #0f172a; color: white; border: none; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer;">
                  Book
                </button>
              </div>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`pop-trans-${s.id}`);
          if (btn && onSelectTransport) {
            btn.onclick = () => onSelectTransport(s);
          }
        });
      }
    });

    // 6. Draw Route Polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 0) {
      const polyline = L.polyline(routePolyline, {
        color: '#2563eb',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined,
      }).addTo(map);

      routeLayerRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [destinations, transportServices, userCoords, pickupCoords, dropoffCoords, routePolyline]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
