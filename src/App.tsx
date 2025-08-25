import React, { useState } from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 20 }}>Error: {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

import MapComponent from './components/MapComponent';
import LocationSidebar from './components/LocationSidebar.tsx';
import { fetchLocations } from './utils/fetchLocations';
import type { Location, MapFilters } from './type/location';
import heeroLogo from './assets/HEERO Logo.svg';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    showBosch: true,
    showMercedes: true,
    showServiceExcellence: true,
    showCertifiedHub: true,
    dynamic: {}
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const CACHE_KEY = 'locations_cache_v1';
    const TTL_MS = 30 * 60 * 1000; // 30 minutes

    const sortLocs = (locs: Location[]) => {
      const priority: Record<Location['type'], number> = {
        service_excellence: 0,
        certified_hub: 1,
        bosch: 2,
        mercedes: 3,
        other: 99
      };
      return [...locs].sort((a, b) => priority[a.type] - priority[b.type]);
    };

    const loadFromCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return false;
        const cached = JSON.parse(raw) as { timestamp: number; data: Location[] };
        const isFresh = Date.now() - cached.timestamp < TTL_MS;
        if (cached.data && cached.data.length) {
          setLocations(sortLocs(cached.data));
          setLoading(false);
          return isFresh;
        }
      } catch {}
      return false;
    };

    const fetchAndUpdate = async () => {
      try {
        const locs = await fetchLocations();
        const sortedLocs = sortLocs(locs);
        setLocations(sortedLocs);
        setError(null);
        setLoading(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: locs }));
        } catch {}
      } catch (error) {
        setError('Failed to load locations');
        console.error('Error loading locations:', error);
        setLoading(false);
      }
    };

    setLoading(true);
    loadFromCache(); // Serve cache immediately if available
    fetchAndUpdate(); // Revalidate in background

    // periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchAndUpdate, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Initialize category colors from storage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('category_colors_v1');
      if (raw) setCategoryColors(JSON.parse(raw));
    } catch {}
  }, []);

  // When locations change, ensure dynamic filter keys and colors exist for new categories
  React.useEffect(() => {
    if (!locations.length) return;
    const dynamicCats = Array.from(new Set(locations.filter(l => l.type === 'other' && l.category).map(l => l.category)));

    if (dynamicCats.length) {
      // prepare color palette excluding reserved existing colors
      const reserved = new Set(['#272F39', '#A1A49F', '#1E3A8A']);
      const palette = ['#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316','#22C55E','#06B6D4','#F43F5E','#A855F7','#84CC16','#0EA5E9'];
      const used = new Set(Object.values(categoryColors).map(c => c.toLowerCase()));

      const nextColors: Record<string,string> = { ...categoryColors };
      for (const cat of dynamicCats) {
        if (!nextColors[cat]) {
          // pick first available color not used/reserved
          let color = palette.find(c => !used.has(c.toLowerCase()) && !reserved.has(c.toUpperCase()));
          if (!color) {
            // fallback generate random distinct-ish color
            const h = Math.floor(Math.random() * 360);
            color = `hsl(${h} 70% 45%)`;
          }
          nextColors[cat] = color;
          used.add(color.toLowerCase());
        }
      }
      if (JSON.stringify(nextColors) !== JSON.stringify(categoryColors)) {
        setCategoryColors(nextColors);
        try { localStorage.setItem('category_colors_v1', JSON.stringify(nextColors)); } catch {}
      }

      // ensure dynamic filter keys exist (default to true)
      const nextFilters = { ...filters, dynamic: { ...filters.dynamic } };
      let changed = false;
      for (const cat of dynamicCats) {
        if (nextFilters.dynamic[cat] === undefined) {
          nextFilters.dynamic[cat] = true;
          changed = true;
        }
      }
      if (changed) setFilters(nextFilters as any);
    }
  }, [locations]);

  
  const handleLocationSelect = React.useCallback((location: Location | null) => {
    setSelectedLocation(location);
  }, []);

  const handleFiltersChange = React.useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <style>{`
          @keyframes heeroGlow {
            0%, 100% { filter: drop-shadow(0 0 8px rgba(0,229,255,0.25)) drop-shadow(0 0 16px rgba(79,70,229,0.25)); }
            50% { filter: drop-shadow(0 0 20px rgba(0,229,255,0.6)) drop-shadow(0 0 40px rgba(79,70,229,0.6)); }
          }
          @keyframes heeroHeartbeat {
            0% { transform: scale(1); }
            15% { transform: scale(1.045); }
            30% { transform: scale(1); }
            55% { transform: scale(1.045); }
            70% { transform: scale(1); }
            100% { transform: scale(1); }
          }
          .heero-glow { animation: heeroGlow 2.8s ease-in-out infinite, heeroHeartbeat 3.6s cubic-bezier(.4,0,.2,1) infinite; will-change: filter, transform; }
        `}</style>
        <img src={heeroLogo} alt="HEERO logo" className="w-[70vw] max-w-[520px] heero-glow select-none" draggable="false" />
      </div>
    );
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen text-xl text-red-600">{error}</div>;
  }

  return (
    <ErrorBoundary>
  <div className="h-screen flex flex-col md:flex-row bg-gray-100">
        <LocationSidebar
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categoryColors={categoryColors}
        />
        <div className="flex-1 min-h-[300px]">
          <MapComponent
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            filters={filters}
            categoryColors={categoryColors}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;