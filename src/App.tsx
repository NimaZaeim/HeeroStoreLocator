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
    showCertifiedHub: true,
    searchTerm: ''
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const locs = await fetchLocations();
        // Sort locations to prioritize HEERO locations
        const sortedLocs = [...locs].sort((a, b) => {
          // Priority order: service_excellence, certified_hub, bosch, mercedes
          const priority = {
            'service_excellence': 0,
            'certified_hub': 1,
            'bosch': 2,
            'mercedes': 3
          };
          return priority[a.type] - priority[b.type];
        });
        setLocations(sortedLocs);
      } catch (error) {
        setError('Failed to load locations');
        console.error('Error loading locations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  React.useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      const initial = locations.find(l => (l.companyName || '').trim() === 'Bosch Car Service Peter Schlichtling e.K.');
      if (initial) setSelectedLocation(initial);
    }
  }, [locations, selectedLocation]);

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

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
        <div className="h-[60vh] md:flex-1 md:h-auto md:min-h-[300px]">
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