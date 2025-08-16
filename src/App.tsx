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
import { locations } from './data/locations';
import { Location } from './type/location';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState({
    showBosch: true,
    showMercedes: true,
    searchTerm: ''
  });

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

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