import { Location } from '../type/location';


export async function loadLocations(): Promise<Location[]> {
	const boschResponse = await fetch('/bosch_car_service_mapbox.geojson');
	const boschGeoJson = await boschResponse.json();
	const mercedesResponse = await fetch('/mercedes_benz_van_service_mapbox.geojson');
	const mercedesGeoJson = await mercedesResponse.json();
	const serviceExcellenceResponse = await fetch('/Service_Excellence_Center.geojson');
	const serviceExcellenceGeoJson = await serviceExcellenceResponse.json();
	const certifiedHubResponse = await fetch('/Certified_HEERO_Hubs.geojson');
	const certifiedHubGeoJson = await certifiedHubResponse.json();

	function parseGeoJsonFeatures(features: any[], type: Location['type']): Location[] {
		return features
			.filter(f => f.geometry && f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates))
			.map((f, idx) => {
				const props = f.properties || {};
				const coords = f.geometry.coordinates;
				// For new categories, use different property names
				let companyName = props.Company_Name || props['Company Name'] || null;
				let address = props.Address || props.Adress || null;
				return {
					id: `${type}-location-${idx}`,
					city: props.City || null,
					url1: props.URL1 || '',
					address,
					phoneNumber: props.PhoneNumber || null,
					companyName,
					searchQuery: props.Search_Query || null,
					lat: coords[1],
					lng: coords[0],
					type,
					rating: props.Rating || null,
					reviewCount: props.Review_Count || null,
					subcategories: props.Subcategories ? props.Subcategories.replace(/"/g, '').split(',') : [],
				};
			});
	}

	const boschLocations: Location[] = parseGeoJsonFeatures(boschGeoJson.features, 'bosch');
	const mercedesLocations: Location[] = parseGeoJsonFeatures(mercedesGeoJson.features, 'mercedes');
	const serviceExcellenceLocations: Location[] = parseGeoJsonFeatures(serviceExcellenceGeoJson.features, 'service_excellence');
	const certifiedHubLocations: Location[] = parseGeoJsonFeatures(certifiedHubGeoJson.features, 'certified_hub');
	return [
		...serviceExcellenceLocations,
		...certifiedHubLocations,
		...boschLocations,
		...mercedesLocations
	];
}