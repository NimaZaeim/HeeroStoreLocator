import { Location } from '../type/location';
import { parseCSVData } from '../utils/csvParser';
import csvData from '../assets/Bosch_Mercedes_Service_Centers.csv?raw';

export const locations: Location[] = parseCSVData(csvData);