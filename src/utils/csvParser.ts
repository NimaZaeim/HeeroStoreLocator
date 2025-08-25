import { Location } from '../type/location';

export function parseCSVData(csvText: string): Location[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const coordinates = values[3] || '';
    const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
    
    // Determine type based on Category/Name instead of search query
    const nameOrCategory = `${values[5] || ''} ${values[6] || ''}`.toLowerCase();
    const type = (nameOrCategory.includes('mercedes') ? 'mercedes' : 'bosch') as Location['type'];
    const category = (values[6] || values[5] || '').trim();
    
    const loc: Location = {
      id: `location-${index}`,
      city: values[0] || 'Unknown City',
      url1: values[1] || '',
      address: values[2] || '',
      phoneNumber: values[4] || '',
      companyName: values[5] || '',
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng,
      type,
      category,
      rating: undefined,
      reviewCount: undefined
    };
    return loc;
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