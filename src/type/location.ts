export interface Location {
  id: string;
  city: string | null;
  url1: string;
  address: string | null;
  phoneNumber: string | number | null;
  companyName: string | null;
    lat: number;
  lng: number;
  type: 'bosch' | 'mercedes' | 'service_excellence' | 'certified_hub';
  rating?: number;
  reviewCount?: number;
  // subcategories?: string[];
}

export interface MapFilters {
  showBosch: boolean;
  showMercedes: boolean;
  showServiceExcellence: boolean;
  showCertifiedHub: boolean;
}