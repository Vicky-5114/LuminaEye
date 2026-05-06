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
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Assistance Map</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              viewMode === "map"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            }`}
          >
            🗺 Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              viewMode === "list"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            }`}
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
            className={`px-4 py-2 text-sm border transition-colors rounded-full ${
              filter === f
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div className="relative">
          <div ref={mapRef} className="w-full h-[500px] rounded-xl border border-[var(--color-border)] overflow-hidden dark:border-cyan-500/20 dark:shadow-[0_0_20px_rgba(0,240,255,0.05)]" />

          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm">
              <span className="text-red-500">👁 {counts.blind}</span>
            </div>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm">
              <span className="text-[var(--color-accent)]">🙋 {counts.volunteer}</span>
            </div>
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-sm">
              <span className="text-yellow-400">🏪 {counts.business}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLocations.length === 0 && (
            <div className="text-center py-16 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
              <div className="text-5xl mb-4">🗺</div>
              <p className="text-[var(--color-text-secondary)]">No locations match your filter</p>
            </div>
          )}
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {loc.type === 'blind' ? '👁' : loc.type === 'volunteer' ? '🙋' : '🏪'} {loc.name}
                  </span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    loc.type === 'blind' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    loc.type === 'volunteer' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {loc.status || 'Open'}
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">{loc.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-md p-6 relative transition-colors dark:border-cyan-500/20">
            <button onClick={() => setSelectedLocation(null)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">✕</button>

            <h3 className="text-xl font-bold mb-2">{selectedLocation.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{selectedLocation.description}</p>

            {selectedLocation.phone && <p className="text-sm mb-2">📞 {selectedLocation.phone}</p>}
            {selectedLocation.jobs && <p className="text-sm mb-4">💼 Jobs: {selectedLocation.jobs.join(', ')}</p>}

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Navigate</button>
              {selectedLocation.type === 'blind' && (
                <a href="/video" className="flex-1 py-2 bg-[var(--color-success)] text-white font-medium rounded-lg text-center hover:opacity-90 transition-opacity">Video Assist</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
