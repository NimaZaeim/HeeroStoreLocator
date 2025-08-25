import React, { useMemo, useState } from "react";
import { Filter } from 'lucide-react';
import type { Location, MapFilters } from '../type/location';
import heeroLogo from '../assets/HEERO Logo.svg';

interface LocationSidebarProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  categoryColors: Record<string, string>;
}

const LocationSidebarComponent: React.FC<LocationSidebarProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  filters,
  onFiltersChange,
  categoryColors
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [showLocations, setShowLocations] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // open on md+ by default, closed on mobile
    }
    return true;
  });
  const filteredLocations = useMemo(() => locations.filter(location => {
    const isKnown = (
      (filters.showServiceExcellence && location.type === 'service_excellence') ||
      (filters.showCertifiedHub && location.type === 'certified_hub') ||
      (filters.showBosch && location.type === 'bosch') ||
      (filters.showMercedes && location.type === 'mercedes')
    );
    const isDynamic = location.type === 'other' && (filters.dynamic[location.category] ?? true);
    return isKnown || isDynamic;
  }), [locations, filters]);

  const serviceExcellenceCount = useMemo(() => locations.filter(l => l.type === 'service_excellence').length, [locations]);
  const certifiedHubCount = useMemo(() => locations.filter(l => l.type === 'certified_hub').length, [locations]);
  const boschCount = useMemo(() => locations.filter(l => l.type === 'bosch').length, [locations]);
  const mercedesCount = useMemo(() => locations.filter(l => l.type === 'mercedes').length, [locations]);
  const dynamicCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach(l => {
      if (l.type === 'other' && l.category) {
        counts[l.category] = (counts[l.category] || 0) + 1;
      }
    });
    return counts;
  }, [locations]);

  // Refs for each location row
  const locationRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  React.useEffect(() => {
    if (selectedLocation && locationRefs.current[selectedLocation.id]) {
      locationRefs.current[selectedLocation.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedLocation]);

  return (
    <div className={`w-full md:w-96 bg-white shadow-xl flex flex-col ${showLocations ? 'h-[40vh]' : 'h-auto'} md:h-full ${showLocations ? 'overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Service Locations</h1>
        
        {/* Search removed as requested */}

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 cursor-pointer select-none" onClick={() => setShowFilters((prev) => !prev)}>
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by Service Type</span>
            <svg className={`w-3 h-3 ml-1 transition-transform ${showFilters ? '' : 'rotate-[-90deg]'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l4 4 4-4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {showFilters && (
            <>
              {/* HEERO Motors Excellence Center */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showServiceExcellence}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    showServiceExcellence: e.target.checked
                  })}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-[#272F39] text-[#272F39]"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_337_28)">
                        <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#1D3661"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_337_28">
                          <rect width="130" height="130" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    HEERO Motors Excellence Center ({serviceExcellenceCount})
                  </span>
                </div>
              </label>
              {/* HEERO Hub */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showCertifiedHub}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    showCertifiedHub: e.target.checked
                  })}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-[#272F39] text-[#272F39]"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_337_28)">
                        <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#1D3661"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_337_28">
                          <rect width="130" height="130" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    HEERO Hub ({certifiedHubCount})
                  </span>
                </div>
              </label>
              {/* Bosch Car Service */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showBosch}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    showBosch: e.target.checked
                  })}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-gray-400 text-gray-400"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 block"> 
                    <svg width="16" height="16" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_337_28)">
                        <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.75)"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_337_28">
                          <rect width="130" height="130" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Bosch Car Service ({boschCount})
                  </span>
                </div>
              </label>
              {/* Mercedes-Benz Van Service */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.showMercedes}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    showMercedes: e.target.checked
                  })}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-gray-400 text-gray-400"
                />
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center"> 
                    <svg width="16" height="16" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_337_28)">
                        <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.3)"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_337_28">
                          <rect width="130" height="130" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Mercedes-Benz Van Service ({mercedesCount})
                  </span>
                </div>
              </label>

              {Object.keys(dynamicCategoryCounts).sort().map((cat) => (
                <label className="flex items-center gap-3 cursor-pointer group" key={cat}>
                  <input
                    type="checkbox"
                    checked={filters.dynamic[cat] ?? true}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dynamic: { ...filters.dynamic, [cat]: e.target.checked }
                    })}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-gray-400 text-gray-400"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block"
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: categoryColors[cat] || '#6B7280',
                        WebkitMask: `url(${heeroLogo}) no-repeat center / contain`,
                        mask: `url(${heeroLogo}) no-repeat center / contain`
                      }}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {cat} ({dynamicCategoryCounts[cat]})
                    </span>
                  </div>
                </label>
              ))}
            </>
          )}
          
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredLocations.length} of {locations.length} locations
          </p>
        </div>
      </div>

      {/* Locations dropdown toggle */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none" onClick={() => setShowLocations(prev => !prev)}>
        <span className="font-medium">Locations</span>
        <svg className={`w-3 h-3 ml-1 transition-transform ${showLocations ? '' : 'rotate-[-90deg]'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l4 4 4-4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {showLocations && (
      <div className="flex-1 overflow-y-auto">
        {filteredLocations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No locations found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                ref={el => locationRefs.current[location.id] = el}
                onClick={() => onLocationSelect(location)}
                className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedLocation?.id === location.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {location.type === 'bosch' ? (
                      <span className="w-6 h-6 block"> 
                        <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_337_28)">
                            <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.75)"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_337_28">
                              <rect width="130" height="130" fill="white"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                    ) : location.type === 'mercedes' ? (
                      <span className="w-6 h-6 flex items-center justify-center"> 
                        <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_337_28)">
                            <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.3)"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_337_28">
                              <rect width="130" height="130" fill="white"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
                    ) : (
                      location.type === 'other' ? (
                        <span className="w-6 h-6 flex items-center justify-center">
                          <span
                            className="inline-block"
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: categoryColors[location.category] || '#6B7280',
                              WebkitMask: `url(${heeroLogo}) no-repeat center / contain`,
                              mask: `url(${heeroLogo}) no-repeat center / contain`
                            }}
                          />
                        </span>
                      ) : (
                        <span className="w-6 h-6 flex items-center justify-center"> 
                          <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_337_28)">
                              <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#272F39"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_337_28">
                                <rect width="130" height="130" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </span>
                      )
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                      {location.companyName}
                    </h3>

                    {/* Website only (address, phone, rating removed) */}
                    {/*
                    {location.url1 && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Website available</span>
                      </p>
                    )}
                    */}

                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      {location.type === 'other' ? (
                        <span
                          className="inline-block px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: categoryColors[location.category] || '#6B7280' }}
                        >
                          {location.category}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {location.type === 'bosch'
                            ? 'Bosch Car Service'
                            : location.type === 'mercedes'
                              ? 'Mercedes-Benz Van Service'
                              : location.type === 'service_excellence'
                                ? 'HEERO Motors Excellence Center'
                                : 'HEERO Hub'}
                        </span>
                      )}
                      {/* Subcategories removed */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default React.memo(LocationSidebarComponent);
