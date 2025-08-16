import { Location } from '../type/location';

export function parseCSVData(csvText: string): Location[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const coordinates = values[3] || '';
    const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    
    // Determine type based on search query
    const searchQuery = values[6] || '';
    const type = searchQuery.toLowerCase().includes('mercedes') ? 'mercedes' : 'bosch';
    
    return {
      id: `location-${index}`,
      city: values[0] || 'Unknown City',
      url1: values[1] || '',
      address: values[2] || '',
      coordinates: coordinates,
      phoneNumber: values[4] || '',
      companyName: values[5] || '',
      searchQuery: searchQuery,
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng,
      type: type as 'bosch' | 'mercedes'
    };
  }).filter(location => location.lat !== 0 && location.lng !== 0);
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}