import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location, MapFilters } from '../type/location';
import HEEROLogo from '../assets/HEERO Logo.svg?url';

interface MapComponentProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  filters: MapFilters;
}

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  selectedLocation,
  onLocationSelect,
  filters
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Filter locations based on current filters
  const filteredLocations = locations.filter(location => {
    const matchesType = (
      (filters.showBosch && location.type === 'bosch') ||
      (filters.showMercedes && location.type === 'mercedes') ||
      (filters.showServiceExcellence && location.type === 'service_excellence') ||
      (filters.showCertifiedHub && location.type === 'certified_hub')
    );
    const matchesSearch = filters.searchTerm === '' || 
      (location.city && location.city.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (location.companyName && location.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (location.address && location.address.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiaGVlcm9tb3RvcnMiLCJhIjoiY21lYjBkcHZrMHlxbTJpczVpcWp1MWU4eCJ9.oZNeZQUubzoLd_MZ84jbbQ';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/heeromotors/cmecq6mnd00gy01s6h1ri6hwd',
      center: [8.5417, 47.3769], // Switzerland center
      zoom: 6
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click event listener for existing markers in the map
    map.current.on('click', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        const feature = features[0];
        const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : [0, 0];
        // Find matching location from our data based on coordinates
        const matchedLocation = locations.find(location => {
          const tolerance = 0.001;
          return Math.abs(location.lng - coordinates[0]) < tolerance &&
                 Math.abs(location.lat - coordinates[1]) < tolerance;
        });
        if (matchedLocation) {
          let categoryName = '';
          let categoryClass = '';
          switch (matchedLocation.type) {
            case 'bosch':
              categoryName = 'Bosch Car Service';
              categoryClass = 'bg-red-100 text-red-800';
              break;
            case 'mercedes':
              categoryName = 'Mercedes-Benz Van Service';
              categoryClass = 'bg-gray-100 text-gray-800';
              break;
            case 'service_excellence':
              categoryName = 'Service Excellence Center HEERO MOTORS';
              categoryClass = 'bg-orange-100 text-[#F49D16]';
              break;
            case 'certified_hub':
              categoryName = 'Certified HEERO Hubs';
              categoryClass = 'bg-orange-100 text-[#F49D16]';
              break;
            default:
              categoryName = '';
              categoryClass = '';
          }
          const popupContent = `
            <div class="p-4 max-w-sm">
              <h3 class="font-bold text-lg mb-2 text-gray-800">${matchedLocation.companyName || ''}</h3>
              <div class="space-y-2 text-sm">
                <p class="flex items-start gap-2">
                  <span class="text-gray-500 min-w-0">📍</span>
                  <span class="text-gray-700">${matchedLocation.address || ''}</span>
                </p>
                ${matchedLocation.phoneNumber ? `
                  <p class="flex items-center gap-2">
                    <span class="text-gray-500">📞</span>
                    <a href="tel:${matchedLocation.phoneNumber}" class="text-blue-600 hover:underline">${matchedLocation.phoneNumber}</a>
                  </p>
                ` : ''}
                ${matchedLocation.url1 ? `
                  <p class="flex items-center gap-2">
                    <span class="text-gray-500">🌐</span>
                    <a href="${matchedLocation.url1}" target="_blank" class="text-blue-600 hover:underline">Visit Website</a>
                  </p>
                ` : ''}
                <div class="flex flex-wrap gap-2 items-center mt-2">
                  <span class="inline-block px-2 py-1 text-xs rounded-full ${categoryClass}">
                    ${categoryName}
                  </span>
                  ${matchedLocation.rating ? `
                    <span class="flex items-center gap-1 text-xs text-yellow-700 font-medium">
                      <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z"/></svg>
                      ${matchedLocation.rating}
                      ${matchedLocation.reviewCount ? `<span class="ml-2 text-gray-500">(${matchedLocation.reviewCount})</span>` : ''}
                    </span>
                  ` : ''}
                  ${matchedLocation.subcategories && matchedLocation.subcategories.length > 0 ? `
                    <span class="flex items-center gap-1 text-xs text-blue-700 font-medium">
                      <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a2 2 0 00-2 2v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2h-3V4a2 2 0 00-2-2zm0 2h2v2h-2V4zm-5 4h10v8H5V8z"/></svg>
                      ${matchedLocation.subcategories.slice(0,2).join(', ')}
                      ${matchedLocation.subcategories.length > 2 ? '<span class="ml-1">...</span>' : ''}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
          if (popup.current) {
            popup.current.remove();
          }
          popup.current = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'custom-popup'
          })
            .setLngLat(coordinates as [number, number])
            .setHTML(popupContent)
            .addTo(map.current!);
          onLocationSelect(matchedLocation);
        }
      }
    });

    // Change cursor on hover over markers
    map.current.on('mouseenter', ['mercedes-benz-van-services', 'bosch-car-services'], () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', ['mercedes-benz-van-services', 'bosch-car-services'], () => {
      map.current!.getCanvas().style.cursor = '';
    });
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Fit map to show all filtered locations
    if (filteredLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredLocations.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [filteredLocations]);

  // Handle selected location from sidebar
  useEffect(() => {
    if (!selectedLocation || !map.current) return;

    map.current.flyTo({
      center: [selectedLocation.lng, selectedLocation.lat],
      zoom: 12,
      duration: 1000
    });

    // Show popup for selected location
    if (popup.current) {
      popup.current.remove();
    }

    let categoryName = '';
    let categoryClass = '';
    switch (selectedLocation.type) {
      case 'bosch':
        categoryName = 'Bosch Car Service';
        categoryClass = 'bg-red-100 text-red-800';
        break;
      case 'mercedes':
        categoryName = 'Mercedes-Benz Van Service';
        categoryClass = 'bg-gray-100 text-gray-800';
        break;
      case 'service_excellence':
        categoryName = 'Service Excellence Center HEERO MOTORS';
        categoryClass = 'bg-orange-100 text-[#F49D16]';
        break;
      case 'certified_hub':
        categoryName = 'Certified HEERO Hubs';
        categoryClass = 'bg-orange-100 text-[#F49D16]';
        break;
      default:
        categoryName = '';
        categoryClass = '';
    }
    const popupContent = `
      <div class="p-4 max-w-sm">
        <h3 class="font-bold text-lg mb-2 text-gray-800">${selectedLocation.companyName || ''}</h3>
        <div class="space-y-2 text-sm">
          <p class="flex items-start gap-2">
            <span class="text-gray-500 min-w-0">📍</span>
            <span class="text-gray-700">${selectedLocation.address || ''}</span>
          </p>
          ${selectedLocation.phoneNumber ? `
            <p class="flex items-center gap-2">
              <span class="text-gray-500">📞</span>
              <a href="tel:${selectedLocation.phoneNumber}" class="text-blue-600 hover:underline">${selectedLocation.phoneNumber}</a>
            </p>
          ` : ''}
          ${selectedLocation.url1 ? `
            <p class="flex items-center gap-2">
              <span class="text-gray-500">🌐</span>
              <a href="${selectedLocation.url1}" target="_blank" class="text-blue-600 hover:underline">Visit Website</a>
            </p>
          ` : ''}
          <div class="flex flex-wrap gap-2 items-center mt-2">
            <span class="inline-block px-2 py-1 text-xs rounded-full ${categoryClass}">
              ${categoryName}
            </span>
            ${selectedLocation.rating ? `
              <span class="flex items-center gap-1 text-xs text-yellow-700 font-medium">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z"/></svg>
                ${selectedLocation.rating}
                ${selectedLocation.reviewCount ? `<span class="ml-2 text-gray-500">(${selectedLocation.reviewCount})</span>` : ''}
              </span>
            ` : ''}
            ${selectedLocation.subcategories && selectedLocation.subcategories.length > 0 ? `
              <span class="flex items-center gap-1 text-xs text-blue-700 font-medium">
                <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a2 2 0 00-2 2v2H5a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2h-3V4a2 2 0 00-2-2zm0 2h2v2h-2V4zm-5 4h10v8H5V8z"/></svg>
                ${selectedLocation.subcategories.slice(0,2).join(', ')}
                ${selectedLocation.subcategories.length > 2 ? '<span class="ml-1">...</span>' : ''}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    popup.current = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      className: 'custom-popup'
    })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .setHTML(popupContent)
      .addTo(map.current);
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Legend */}
      {showLegend && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Legend</h3>
            <button
              onClick={() => setShowLegend(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {/* Service Excellence Center HEERO MOTORS */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_337_28)">
                    <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#F49D16"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_337_28">
                      <rect width="130" height="130" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-gray-700">Service Excellence Center HEERO MOTORS</span>
            </div>
            {/* Certified HEERO Hubs */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_337_28)">
                    <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#F49D16"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_337_28">
                      <rect width="130" height="130" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-gray-700">Certified HEERO Hubs</span>
            </div>
            {/* Bosch Car Service */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
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
              </div>
              <span className="text-sm text-gray-700">Bosch Car Service</span>
            </div>
            {/* Mercedes-Benz Van Service */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M64 192C64 141.078 84.2285 92.2425 120.235 56.2355C156.242 20.2285 205.078 0 256 0C306.922 0 355.758 20.2285 391.764 56.2355C427.771 92.2425 448 141.078 448 192C448 320 256 512 256 512C256 512 64 320 64 192ZM176 192C176 213.217 184.429 233.566 199.431 248.569C214.434 263.571 234.783 272 256 272C277.217 272 297.566 263.571 312.569 248.569C327.571 233.566 336 213.217 336 192C336 170.783 327.571 150.434 312.569 135.431C297.566 120.429 277.217 112 256 112C234.783 112 214.434 120.429 199.431 135.431C184.429 150.434 176 170.783 176 192Z" fill="red"/>
                </svg>
              </div>
              <span className="text-sm text-gray-700">Mercedes-Benz Van Service</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Total locations: {filteredLocations.length}
            </p>
          </div>
        </div>
      )}

      {/* Legend toggle button when hidden */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10 hover:bg-gray-50 transition-colors"
          title="Show Legend"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MapComponent;