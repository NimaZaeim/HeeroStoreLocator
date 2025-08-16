import React from 'react';
import { Search, MapPin, Phone, Globe, Filter } from 'lucide-react';
import { Location } from '../type/location';
import HEEROLogo from '../assets/HEERO Logo.svg?url';

interface LocationSidebarProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  filters: {
    showBosch: boolean;
    showMercedes: boolean;
    searchTerm: string;
  };
  onFiltersChange: (filters: {
    showBosch: boolean;
    showMercedes: boolean;
    searchTerm: string;
  }) => void;
}

const LocationSidebar: React.FC<LocationSidebarProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  filters,
  onFiltersChange
}) => {
  const filteredLocations = locations.filter(location => {
    const matchesType = (
      (filters.showBosch && location.type === 'bosch') ||
      (filters.showMercedes && location.type === 'mercedes')
    );
    
    const matchesSearch = filters.searchTerm === '' || 
      location.city.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      location.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const boschCount = locations.filter(l => l.type === 'bosch').length;
  const mercedesCount = locations.filter(l => l.type === 'mercedes').length;

  return (
    <div className="w-96 bg-white shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Service Locations</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search locations..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({
              ...filters,
              searchTerm: e.target.value
            })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filter by Service Type</span>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.showBosch}
              onChange={(e) => onFiltersChange({
                ...filters,
                showBosch: e.target.checked
              })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 block"> 
                      <svg width="16" height="16" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_337_28)">
                          <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="black"/>
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

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.showMercedes}
              onChange={(e) => onFiltersChange({
                ...filters,
                showMercedes: e.target.checked
              })}
              className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            />
                   <div className="flex items-center gap-2">
                     <span className="w-4 h-4 flex items-center justify-center"> 
                       <svg width="16" height="16" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M64 192C64 141.078 84.2285 92.2425 120.235 56.2355C156.242 20.2285 205.078 0 256 0C306.922 0 355.758 20.2285 391.764 56.2355C427.771 92.2425 448 141.078 448 192C448 320 256 512 256 512C256 512 64 320 64 192ZM176 192C176 213.217 184.429 233.566 199.431 248.569C214.434 263.571 234.783 272 256 272C277.217 272 297.566 263.571 312.569 248.569C327.571 233.566 336 213.217 336 192C336 170.783 327.571 150.434 312.569 135.431C297.566 120.429 277.217 112 256 112C234.783 112 214.434 120.429 199.431 135.431C184.429 150.434 176 170.783 176 192Z" fill="red"/>
                       </svg>
                     </span>
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Mercedes-Benz Van Service ({mercedesCount})
              </span>
            </div>
          </label>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredLocations.length} of {locations.length} locations
          </p>
        </div>
      </div>

      {/* Location List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLocations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">
              <MapPin className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No locations found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
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
                                   <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="black"/>
                                 </g>
                                 <defs>
                                   <clipPath id="clip0_337_28">
                                     <rect width="130" height="130" fill="white"/>
                                   </clipPath>
                                 </defs>
                               </svg>
                             </span>
                    ) : (
                      <span className="w-6 h-6 flex items-center justify-center"> 
                        <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M64 192C64 141.078 84.2285 92.2425 120.235 56.2355C156.242 20.2285 205.078 0 256 0C306.922 0 355.758 20.2285 391.764 56.2355C427.771 92.2425 448 141.078 448 192C448 320 256 512 256 512C256 512 64 320 64 192ZM176 192C176 213.217 184.429 233.566 199.431 248.569C214.434 263.571 234.783 272 256 272C277.217 272 297.566 263.571 312.569 248.569C327.571 233.566 336 213.217 336 192C336 170.783 327.571 150.434 312.569 135.431C297.566 120.429 277.217 112 256 112C234.783 112 214.434 120.429 199.431 135.431C184.429 150.434 176 170.783 176 192Z" fill="red"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                      {location.companyName}
                    </h3>
                    
                    <div className="space-y-1">
                      {location.city && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{location.city}</span>
                        </p>
                      )}
                      
                      {location.phoneNumber && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{location.phoneNumber}</span>
                        </p>
                      )}
                      
                      {location.url1 && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Website available</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        location.type === 'bosch' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.type === 'bosch' ? 'Bosch Service' : 'Mercedes Service'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSidebar;