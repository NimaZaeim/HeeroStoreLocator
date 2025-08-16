export interface Location {
  id: string;
  city: string;
  url1: string;
  address: string;
  coordinates: string;
  phoneNumber: string;
  companyName: string;
  searchQuery: string;
  lat: number;
  lng: number;
  type: 'bosch' | 'mercedes';
}

export interface MapFilters {
  showBosch: boolean;
  showMercedes: boolean;
  searchTerm: string;
}