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
import { loadLocations } from './data/locations';
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
    setLoading(true);
    loadLocations()
      .then((locs) => {
        setLocations(locs);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load locations');
        setLoading(false);
      });
  }, []);

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
      <div className="h-screen flex bg-gray-100 border-8 border-blue-500">
        <LocationSidebar
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <div className="flex-1">
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