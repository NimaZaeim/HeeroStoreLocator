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

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState<MapFilters>({
    showBosch: true,
    showMercedes: true,
    showServiceExcellence: true,
    showCertifiedHub: true
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const CACHE_KEY = 'locations_cache_v1';
    const TTL_MS = 30 * 60 * 1000; // 30 minutes

    const sortLocs = (locs: Location[]) => {
      const priority: Record<Location['type'], number> = {
        service_excellence: 0,
        certified_hub: 1,
        bosch: 2,
        mercedes: 3,
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

  
  const handleLocationSelect = React.useCallback((location: Location | null) => {
    setSelectedLocation(location);
  }, []);

  const handleFiltersChange = React.useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading locations...</div>;
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
        />
        <div className="flex-1 min-h-[300px]">
          <MapComponent
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            filters={filters}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;