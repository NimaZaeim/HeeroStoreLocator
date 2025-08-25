import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Location, MapFilters } from '../type/location';
import heeroLogo from '../assets/HEERO Logo.svg';

interface MapComponentProps {
  locations: Location[];
  onLocationSelect: (location: Location | null) => void;
  filters: MapFilters;
  selectedLocation: Location | null; // Receive selectedLocation as prop
  categoryColors: Record<string, string>;
}

const MapComponent: React.FC<MapComponentProps> = ({
  locations,
  onLocationSelect,
  filters,
  selectedLocation, // Destructure selectedLocation prop
  categoryColors
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const SOURCE_ID = 'locations';
  const CLUSTER_ICON_LAYER_ID = 'cluster-icons';
  const UNCLUSTERED_LAYER_ID = 'unclustered-icons';
  const geojsonRef = useRef<any>({ type: 'FeatureCollection', features: [] as any[] });
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showLegend, setShowLegend] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Open by default on desktop (md+), closed on mobile
    }
    return true;
  });
  // Europe default view
  const [mapView, setMapView] = useState<{center: [number, number], zoom: number}>({center: [10, 50], zoom: 4});

  // Filter locations based on current filters (memoized)
  const filteredLocations = React.useMemo(() => locations.filter(location => {
    const isKnown = (
      (filters.showBosch && location.type === 'bosch') ||
      (filters.showMercedes && location.type === 'mercedes') ||
      (filters.showServiceExcellence && location.type === 'service_excellence') ||
      (filters.showCertifiedHub && location.type === 'certified_hub')
    );
    const isDynamic = location.type === 'other' && (filters.dynamic[location.category] ?? true);
    return isKnown || isDynamic;
  }), [locations, filters]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiaGVlcm9tb3RvcnMiLCJhIjoiY21lYjBkcHZrMHlxbTJpczVpcWp1MWU4eCJ9.oZNeZQUubzoLd_MZ84jbbQ';

    const europeBounds: mapboxgl.LngLatBoundsLike = [
      [-10.0, 36.5], // SW: tight Atlantic/North Africa buffer
      [30.0, 70.0]   // NE: Scandinavia/western Russia buffer; excludes Middle East
    ];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/heeromotors/cmecq6mnd00gy01s6h1ri6hwd',
      center: mapView.center,
      zoom: mapView.zoom,
      minZoom: 3.9, // keep Europe as main focus; prevent zooming out too far
      maxBounds: europeBounds,
      renderWorldCopies: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Build source and layers once the style has loaded
    map.current.on('load', () => {
      setMapReady(true);
      // Initialize source with current filtered data
      const initialData = toGeoJSON(filteredLocations);
      geojsonRef.current = initialData;
      map.current!.addSource(SOURCE_ID, {
        type: 'geojson',
        data: initialData,
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
        clusterProperties: {
          priority: ['min', ['get', 'priority']]
        }
      } as any);

      
      
      // Icons for clusters and unclustered points (no counts), with collision avoidance and priority
      (async () => {
        const rasterizeSvg = (svg: string, size: number) => new Promise<ImageData>((resolve) => {
          const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            resolve(ctx.getImageData(0, 0, size, size));
          };
          img.src = url;
        });

        const addIcon = async (name: string, svg: string, size: number) => {
          if (map.current!.hasImage(name)) return;
          const imageData = await rasterizeSvg(svg, size);
          map.current!.addImage(name, imageData, { pixelRatio: 1 });
        };

        const svgService = `<svg width="48" height="48" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#272F39"/></g></svg>`;
  const svgHub = `<svg width="36" height="36" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#1D3661"/></g></svg>`;
  const svgBosch = `<svg width="32" height="32" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.75)"/></g></svg>`;
  const svgMercedes = `<svg width="32" height="32" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="rgba(1,104,139,0.3)"/></g></svg>`;

        await Promise.all([
          addIcon('icon-service', svgService, 48),
          addIcon('icon-hub', svgHub, 36),
          addIcon('icon-bosch', svgBosch, 32),
          addIcon('icon-mercedes', svgMercedes, 32),
        ]);

        // Cluster icons layer (shows a single icon per cluster based on highest priority)
        map.current!.addLayer({
          id: CLUSTER_ICON_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['has', 'point_count'],
          layout: {
            'icon-image': ['match', ['get', 'priority'], 0, 'icon-service', 1, 'icon-hub', 2, 'icon-bosch', 3, 'icon-mercedes', 'icon-mercedes'],
            'symbol-sort-key': ['get', 'priority']
          }
        } as any);

        // Unclustered icons layer
        map.current!.addLayer({
          id: UNCLUSTERED_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': ['get', 'icon'],
            'symbol-sort-key': ['get', 'priority']
          }
        } as any);
      })();

      
      // Click cluster icon to zoom in
      map.current!.on('click', CLUSTER_ICON_LAYER_ID, (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: [CLUSTER_ICON_LAYER_ID] });
        const clusterId = features[0]?.properties?.cluster_id as number | undefined;
        const source = map.current!.getSource(SOURCE_ID) as (mapboxgl.GeoJSONSource & { getClusterExpansionZoom?: (id: number, cb: (err: any, zoom: number) => void) => void });
        if (!source || clusterId === undefined || typeof source.getClusterExpansionZoom !== 'function') return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const centerArr = (features[0].geometry as any).coordinates;
          const center: [number, number] = [
            Number(centerArr[0] ?? 0),
            Number(centerArr[1] ?? 0)
          ];
          const safeZoom = typeof zoom === 'number' && !isNaN(zoom) ? zoom : 10;
          map.current!.easeTo({ center, zoom: safeZoom });
        });
      });

      // Click unclustered to select
      map.current!.on('click', UNCLUSTERED_LAYER_ID, (e) => {
        const feature = e.features?.[0] as any;
        if (!feature) return;
        const p = feature.properties || {};
        const sel: Location = {
          id: p.id,
          type: p.type,
          companyName: p.companyName || null,
          address: p.address || null,
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lng),
          url1: p.url1 || '',
          rating: p.rating ? parseFloat(p.rating) : undefined,
          reviewCount: p.reviewCount ? parseInt(p.reviewCount) : undefined,
          // subcategories: p.subcategories ? JSON.parse(p.subcategories) : undefined,
          phoneNumber: p.phoneNumber || null,
          city: p.city || null,
          category: p.category || ''
        };
        onLocationSelect(sel);
      });

      // Pointer cursor for icons
      map.current!.on('mouseenter', CLUSTER_ICON_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', CLUSTER_ICON_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = '';
      });
      map.current!.on('mouseenter', UNCLUSTERED_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', UNCLUSTERED_LAYER_ID, () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Resize map when container size changes (e.g., sidebar collapses/expands)
  useEffect(() => {
    if (!mapContainer.current || !map.current) return;
    let raf = 0;
    const resize = () => {
      if (!map.current) return;
      map.current.resize();
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resize);
    });
    ro.observe(mapContainer.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  
  // slug for safe icon IDs
  function slug(input: string) {
    return (input || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function toGeoJSON(locs: Location[]) {
    return {
      type: 'FeatureCollection',
      features: locs.map((l) => ({
        type: 'Feature',
        properties: {
          id: l.id,
          type: l.type,
          icon: l.type === 'other' ? `icon-dyn-${slug(l.category)}` : (l.type === 'service_excellence' ? 'icon-service' : l.type === 'certified_hub' ? 'icon-hub' : l.type === 'bosch' ? 'icon-bosch' : 'icon-mercedes'),
          priority: l.type === 'other' ? 4 : (l.type === 'service_excellence' ? 0 : l.type === 'certified_hub' ? 1 : l.type === 'bosch' ? 2 : 3),
          companyName: l.companyName,
          address: l.address,
          category: l.category,
          color: l.type === 'other' ? (categoryColors[l.category] || '#6B7280') : null,
          lat: l.lat,
          lng: l.lng,
          url1: l.url1,
          rating: l.rating ?? null,
          reviewCount: l.reviewCount ?? null,
          // subcategories: JSON.stringify(l.subcategories ?? []),
          phoneNumber: l.phoneNumber,
          city: l.city
        },
        geometry: {
          type: 'Point',
          coordinates: [l.lng, l.lat]
        }
      }))
    } as any;
  }

  
  // Ensure dynamic icons (HEERO logo on colored circle) are registered for all dynamic categories
  React.useEffect(() => {
    if (!map.current || !mapReady) return;
    const cats = Array.from(new Set(locations.filter(l => l.type === 'other').map(l => l.category)));
    if (!cats.length) return;
    const loadLogo = () => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = heeroLogo as string;
    });
    (async () => {
      let logo: HTMLImageElement;
      try { logo = await loadLogo(); } catch { return; }
      for (const cat of cats) {
        const id = `icon-dyn-${slug(cat)}`;
        if (map.current!.hasImage(id)) continue;
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const color = categoryColors[cat] || '#6B7280';
        ctx.clearRect(0, 0, size, size);
        // draw logo full-size and tint to category color
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(logo, 0, 0, size, size);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'source-over';
        const imageData = ctx.getImageData(0, 0, size, size);
        try { map.current!.addImage(id, imageData, { pixelRatio: 1 }); } catch {}
      }
    })();
  }, [locations, categoryColors, mapReady]);

  
  // Update source data when filteredLocations change
  useEffect(() => {
    if (!map.current) return;
    const src = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (src && (src as any).setData) {
      const data = toGeoJSON(filteredLocations);
      geojsonRef.current = data;
      (src as any).setData(data);
    }
  }, [filteredLocations]);

  useEffect(() => {
    if (!map.current) return;
    // Only fit bounds when filteredLocations change and map is at initial view
    // do not auto-fit; keep default Europe view unless user interacts
  }, [filteredLocations]);

  // Use selectedLocation from props in useEffect
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
    let isDynamic = selectedLocation.type === 'other';
    switch (selectedLocation.type) {
      case 'bosch':
        categoryName = 'Bosch Car Service';
        categoryClass = 'bg-gray-100 text-gray-700';
        break;
      case 'mercedes':
        categoryName = 'Mercedes-Benz Van Service';
        categoryClass = 'bg-gray-100 text-gray-700';
        break;
      case 'service_excellence':
        categoryName = 'HEERO Motors Excellence Center';
        categoryClass = 'bg-gray-100 text-gray-700';
        break;
      case 'certified_hub':
        categoryName = 'HEERO Hub';
        categoryClass = 'bg-gray-100 text-gray-700';
        break;
      default:
        categoryName = selectedLocation.category || '';
        categoryClass = '';
    }

    const popupContent = `
      <div class="p-4 max-w-sm">
        <h3 class="font-bold text-lg mb-2 text-gray-800">${selectedLocation.companyName || ''}</h3>
        <div class="space-y-2 text-sm">
          <!-- Website button removed as requested -->
          <div class="flex flex-wrap gap-2 items-center mt-2">
            ${isDynamic ? `
              <span class="inline-block px-2 py-1 text-xs rounded-full text-white" style="background:${categoryColors[selectedLocation.category] || '#6B7280'}">
                ${selectedLocation.category}
              </span>
            ` : `
              <span class="inline-block px-2 py-1 text-xs rounded-full ${categoryClass}">
                ${categoryName}
              </span>
            `}
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
                    <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#272F39"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_337_28">
                      <rect width="130" height="130" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-gray-700">HEERO Motors Excellence Center</span>
            </div>
            {/* Certified HEERO Hubs */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
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
              </div>
              <span className="text-sm text-gray-700">HEERO Hub</span>
            </div>
            {/* Bosch Car Service */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-6 h-6 block"> 
                  <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_337_28)">
                      <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#A1A49F"/>
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
                <svg width="24" height="24" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_337_28)">
                    <path d="M65 0C29.1 0 0 29.1 0 65C0 100.9 29.1 130 65 130C100.9 130 130 100.9 130 65C130 29.1 100.9 0 65 0ZM65 120C36.5 120 12.7 98.1 10.2 69.7H30V89.7H60V79.7H40V69.7H60V59.7H40V49.7H60V39.7H30V59.7H10.3C13.2 29.5 40.2 7.4 70.4 10.3C96.5 12.9 117.2 33.5 119.7 59.6H100.1V39.6H70.1V49.6H90.1V59.6H70.1V69.6H90.1V79.6H70.1V89.6H100.1V69.6H119.8C117.3 98 93.6 119.9 65 119.9V120Z" fill="#1E3A8A"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_337_28">
                      <rect width="130" height="130" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <span className="text-sm text-gray-700">Mercedes-Benz Van Service</span>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {Array.from(new Set(filteredLocations.filter(l => l.type === 'other').map(l => l.category))).sort().map(cat => (
              <div className="flex items-center gap-3" key={cat}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <span
                    className="inline-block"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: categoryColors[cat] || '#6B7280',
                      WebkitMask: `url(${heeroLogo}) no-repeat center / contain`,
                      mask: `url(${heeroLogo}) no-repeat center / contain`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-700">{cat}</span>
              </div>
            ))}
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
          onClick={() => {
            if (map.current) {
              setMapView({center: [map.current.getCenter().lng, map.current.getCenter().lat], zoom: map.current.getZoom()});
            }
            setShowLegend(true);
          }}
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
