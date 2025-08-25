export interface Location {
  id: string;
  city: string | null;
  url1: string;
  address: string | null;
  phoneNumber: string | number | null;
  companyName: string | null;
  lat: number;
  lng: number;
  // canonical type used for icons/priority; 'other' for any new categories
  type: 'bosch' | 'mercedes' | 'service_excellence' | 'certified_hub' | 'other';
  // raw category string from the sheet (used for dynamic categories)
  category: string;
  rating?: number;
  reviewCount?: number;
  // subcategories?: string[];
}

export interface MapFilters {
  showBosch: boolean;
  showMercedes: boolean;
  showServiceExcellence: boolean;
  showCertifiedHub: boolean;
  // dynamic category toggles keyed by raw category label
  dynamic: Record<string, boolean>;
}