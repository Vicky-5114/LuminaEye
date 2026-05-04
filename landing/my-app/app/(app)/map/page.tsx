'use client';

import { useEffect, useRef, useState } from 'react';
import { MOCK_LOCATIONS, MapLocation } from './mock-locations';
import 'leaflet/dist/leaflet.css';

type FilterType = 'all' | 'blind' | 'volunteer' | 'business';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (leafletMapRef.current) return;

    let cancelled = false;

    import('leaflet').then((leafletModule) => {
      if (cancelled || !mapRef.current) return;
      const L = leafletModule.default;
      LRef.current = L;

      const map = L.map(mapRef.current).setView([39.90923, 116.397428], 13);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Initial markers
      const locations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);
      locations.forEach((loc) => {
        const color = loc.type === 'blind' ? '#ff4444' : loc.type === 'volunteer' ? '#00f0ff' : '#ffdd00';
        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.bindTooltip(loc.name, { direction: 'top', offset: [0, -10] });
        marker.on('click', () => setSelectedLocation(loc));
        markersRef.current.push(marker);
      });
    });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const locations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

    locations.forEach((loc) => {
      const color = loc.type === 'blind' ? '#ff4444' : loc.type === 'volunteer' ? '#00f0ff' : '#ffdd00';
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindTooltip(loc.name, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => setSelectedLocation(loc));
      markersRef.current.push(marker);
    });
  }, [filter]);

  const filteredLocations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

  const counts = {
    blind: MOCK_LOCATIONS.filter((l) => l.type === 'blind').length,
    volunteer: MOCK_LOCATIONS.filter((l) => l.type === 'volunteer').length,
    business: MOCK_LOCATIONS.filter((l) => l.type === 'business').length,
  };

  const filterLabels: Record<FilterType, string> = {
    all: 'All',
    blind: 'Blind',
    volunteer: 'Volunteer',
    business: 'Business',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">Assistance Map</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-sm border ${viewMode === 'map' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            🗺 Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm border ${viewMode === 'list' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            📋 List
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'blind', 'volunteer', 'business'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm border transition-colors ${
              filter === f ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div className="relative">
          <div ref={mapRef} className="w-full h-[500px] bg-[var(--color-panel)] border border-[var(--color-gray)]/30" />

          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-red-400">👁 {counts.blind}</span>
            </div>
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-[var(--color-cyan)]">🙋 {counts.volunteer}</span>
            </div>
            <div className="bg-black/80 px-3 py-2 text-sm">
              <span className="text-yellow-400">🏪 {counts.business}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="bg-[var(--color-panel)] border border-[var(--color-gray)]/30 p-4 cursor-pointer hover:border-[var(--color-cyan)]/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {loc.type === 'blind' ? '👁' : loc.type === 'volunteer' ? '🙋' : '🏪'} {loc.name}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    loc.type === 'blind' ? 'bg-red-400/20 text-red-400' :
                    loc.type === 'volunteer' ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]' :
                    'bg-yellow-400/20 text-yellow-400'
                  }`}>
                    {loc.status || 'Open'}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-gray)]">{loc.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--color-panel)] border border-[var(--color-cyan)]/50 p-6 w-full max-w-md relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--color-cyan)]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--color-cyan)]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--color-cyan)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--color-cyan)]" />

            <button onClick={() => setSelectedLocation(null)} className="absolute top-4 right-4 text-[var(--color-gray)] hover:text-white">✕</button>

            <h3 className="text-xl font-bold mb-2">{selectedLocation.name}</h3>
            <p className="text-sm text-[var(--color-gray)] mb-4">{selectedLocation.description}</p>

            {selectedLocation.phone && <p className="text-sm mb-2">📞 {selectedLocation.phone}</p>}
            {selectedLocation.jobs && <p className="text-sm mb-4">💼 Jobs: {selectedLocation.jobs.join(', ')}</p>}

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm">Navigate</button>
              {selectedLocation.type === 'blind' && (
                <a href="/video" className="flex-1 py-2 bg-green-600 text-white font-bold text-sm text-center">Video Assist</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
