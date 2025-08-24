import Papa from 'papaparse';
import { Location } from '../type/location';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQLHRDFzkLWpZdpaqQ6rZ18-opD1szaCaOPJsKwxGlPx5o49V8BFDOZc6EMMd1YwqMjZgBpA5IuaMDi/pub?output=csv';

interface SheetRow {
  Category: string;
  Name: string;
  Address: string;
  Latitude: string;
  Longitude: string;
  Website: string;
  Rating: string;
  'Review Count': string;
  Subcategories: string;
    'Phone Number': string;
  City: string;
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const response = await fetch(SHEET_URL);
    const csv = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<SheetRow>(csv, {
        header: true,
        complete: (results) => {
          const locations: Location[] = results.data
            .filter(row => {
              // Skip empty rows and ones without coordinates
              if (!row || (!row.Latitude && !row.Longitude)) return false;
              const hasCoords = row.Latitude && row.Longitude;
              return hasCoords;
            })
            .map((row, index) => {
              const category = row.Category?.toLowerCase() || '';
              const type = category.includes('bosch') ? 'bosch' :
                          category.includes('mercedes') ? 'mercedes' :
                          (category.includes('service excellence') || category.includes('heero motors excellence center')) ? 'service_excellence' :
                          (category.includes('certified heero hub') || category.includes('heero hub')) ? 'certified_hub' : 'bosch';
              
              return {
                id: `location-${index}`,
                type,
                companyName: row.Name || null,
                address: row.Address || null,
                lat: parseFloat(row.Latitude) || 0,
                lng: parseFloat(row.Longitude) || 0,
                url1: row.Website || '',
                rating: row.Rating ? parseFloat(row.Rating) : undefined,
                reviewCount: row['Review Count'] ? parseInt(row['Review Count']) : undefined,
                // subcategories: row.Subcategories ? row.Subcategories.split(',').map(s => s.trim()) : undefined,
                phoneNumber: row['Phone Number'] || null,
                city: row.City || null
              };
            });

          resolve(locations.filter(loc => loc.lat !== 0 && loc.lng !== 0));
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}
