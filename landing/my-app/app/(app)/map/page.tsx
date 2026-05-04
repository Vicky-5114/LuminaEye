'use client';

import { useEffect, useRef, useState } from 'react';
import { MOCK_LOCATIONS, MapLocation } from './mock-locations';

const AMAP_KEY = 'YOUR_AMAP_KEY'; // Replace with actual key

type FilterType = 'all' | 'blind' | 'volunteer' | 'business';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const amapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).AMap) return;

    const AMap = (window as any).AMap;
    const map = new AMap.Map(mapRef.current, {
      zoom: 13,
      center: [116.397428, 39.90923],
    });
    amapRef.current = map;

    const locations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    locations.forEach((loc) => {
      const color = loc.type === 'blind' ? '#ff4444' : loc.type === 'volunteer' ? '#00f0ff' : '#ffdd00';
      const marker = new AMap.Marker({
        position: [loc.lng, loc.lat],
        title: loc.name,
        icon: new AMap.Icon({
          size: new AMap.Size(24, 24),
          image: `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${color}"/></svg>`
          )}`,
          imageSize: new AMap.Size(24, 24),
        }),
      });

      marker.on('click', () => setSelectedLocation(loc));
      marker.setMap(map);
      markersRef.current.push(marker);
    });
  }, [mapLoaded, filter]);

  const filteredLocations = filter === 'all' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.type === filter);

  const counts = {
    blind: MOCK_LOCATIONS.filter((l) => l.type === 'blind').length,
    volunteer: MOCK_LOCATIONS.filter((l) => l.type === 'volunteer').length,
    business: MOCK_LOCATIONS.filter((l) => l.type === 'business').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-cyan)]">援助地图</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-sm border ${viewMode === 'map' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            🗺 地图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm border ${viewMode === 'list' ? 'border-[var(--color-cyan)] text-[var(--color-cyan)]' : 'border-[var(--color-gray)]/30 text-[var(--color-gray)]'}`}
          >
            📋 列表
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
            {f === 'all' ? '全部' : f === 'blind' ? '盲人' : f === 'volunteer' ? '志愿者' : '商家'}
          </button>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div className="relative">
          <div ref={mapRef} className="w-full h-[500px] bg-[var(--color-panel)] border border-[var(--color-gray)]/30" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-panel)]">
              <p className="text-[var(--color-gray)]">正在加载地图...</p>
            </div>
          )}

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
                    {loc.status || '营业中'}
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
            {selectedLocation.jobs && <p className="text-sm mb-4">💼 提供岗位：{selectedLocation.jobs.join('、')}</p>}

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-[var(--color-cyan)] text-black font-bold text-sm">导航前往</button>
              {selectedLocation.type === 'blind' && (
                <a href="/video" className="flex-1 py-2 bg-green-600 text-white font-bold text-sm text-center">视频协助</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
