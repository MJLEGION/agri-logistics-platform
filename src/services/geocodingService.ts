/**
 * Geocoding Service - Address to Coordinates Conversion
 * Provides Rwanda-specific location mapping without requiring external APIs
 * 
 * Used to convert addresses to coordinates when they're not available
 */

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Rwanda major cities and locations with their coordinates
// Used as fallback when addresses don't have coordinates
const RWANDA_LOCATIONS: Record<string, LocationCoords> = {
  // Kigali (capital)
  'kigali': { latitude: -1.9536, longitude: 30.0605 },
  'kigali city': { latitude: -1.9536, longitude: 30.0605 },
  'kigali center': { latitude: -1.9540, longitude: 30.0576 },
  'kigali market': { latitude: -1.9403, longitude: 30.0589 },
  'downtown kigali': { latitude: -1.9536, longitude: 30.0605 },
  'nyarutarama': { latitude: -1.9486, longitude: 30.0872 },
  'kimihurura': { latitude: -1.9503, longitude: 30.0857 },
  'remera': { latitude: -1.9571, longitude: 30.0994 },
  'kacyiru': { latitude: -1.9438, longitude: 30.0734 },
  'muhima': { latitude: -1.9527, longitude: 30.0529 },
  'gisement': { latitude: -1.9625, longitude: 30.0456 },
  
  // Other major cities
  'butare': { latitude: -2.5974, longitude: 29.7399 },
  'huye': { latitude: -2.5974, longitude: 29.7399 },
  'gisenyi': { latitude: -1.7039, longitude: 29.2562 },
  'kibuye': { latitude: -1.7039, longitude: 29.2562 },
  'ruhengeri': { latitude: -1.5, longitude: 29.6 },
  'musanze': { latitude: -1.5, longitude: 29.6 },
  'muhanga': { latitude: -1.9762, longitude: 30.1844 },
  'kigali special economic zone': { latitude: -1.9762, longitude: 30.1844 },
  'gitarama': { latitude: -1.9762, longitude: 30.1844 },
  'kayonza': { latitude: -2.0222, longitude: 30.6 },
  'kirehe': { latitude: -1.2833, longitude: 31.0 },
  'kisoro': { latitude: -1.2833, longitude: 29.1667 },
  'nyungwe': { latitude: -2.45, longitude: 29.3 },
  'lake kivu': { latitude: -1.6833, longitude: 29.1667 },
  'volcanoes national park': { latitude: -1.5, longitude: 29.6 },
};

/**
 * Kigali zone codes mapping - "kk" codes represent zones in Kigali
 * These are distributed around the city for realistic route calculations
 */
const KIGALI_ZONES: Record<string, LocationCoords> = {
  'kk1': { latitude: -1.9400, longitude: 30.0400 },
  'kk2': { latitude: -1.9450, longitude: 30.0550 },
  'kk3': { latitude: -1.9500, longitude: 30.0700 },
  'kk4': { latitude: -1.9550, longitude: 30.0850 },
  'kk5': { latitude: -1.9600, longitude: 30.1000 },
  'kk6': { latitude: -1.9300, longitude: 30.0300 },
  'kk7': { latitude: -1.9350, longitude: 30.0450 },
  'kk8': { latitude: -1.9650, longitude: 30.0550 },
  'kk9': { latitude: -1.9700, longitude: 30.0700 },
  'kk10': { latitude: -1.9750, longitude: 30.0900 },
  'kk100': { latitude: -1.9250, longitude: 30.0200 },
  'kk101': { latitude: -1.9200, longitude: 30.0400 },
  'kk200': { latitude: -1.9800, longitude: 30.1100 },
  'kk201': { latitude: -1.9850, longitude: 30.0800 },
  'kk229': { latitude: -1.9480, longitude: 30.0620 },
  'kk226': { latitude: -1.9520, longitude: 30.0680 },
  'kk230': { latitude: -1.9510, longitude: 30.0750 },
};

/**
 * Geocode a location address to coordinates
 * Returns approximate Rwanda coordinates based on address
 * Supports Kigali zone codes (kk###, kk###a, etc.)
 * 
 * @param address - Address string to geocode
 * @returns LocationCoords object with latitude and longitude
 */
export const geocodeAddress = (address: string): LocationCoords => {
  if (!address || typeof address !== 'string') {
    // Default to central Kigali
    return { latitude: -1.9536, longitude: 30.0605 };
  }

  const normalizedAddress = address.toLowerCase().trim().replace(/\s+/g, ''); // Remove all spaces

  // Try Kigali zone codes first (e.g., "kk229a", "kk226", "kk1")
  if (normalizedAddress.startsWith('kk')) {
    // Extract the numeric/alphanumeric part
    const zoneMatch = normalizedAddress.match(/^kk(\d+[a-z]?)/);
    if (zoneMatch) {
      const zoneCode = 'kk' + zoneMatch[1];
      if (KIGALI_ZONES[zoneCode]) {
        console.log(`📍 Geocoded Kigali zone "${address}" to coordinates`);
        return KIGALI_ZONES[zoneCode];
      }
      
      // If exact zone not found but starts with kk, use a distributed location
      // based on the numeric value to spread addresses across Kigali
      const zoneNum = parseInt(zoneMatch[1]);
      if (!isNaN(zoneNum)) {
        // Distribute zones across Kigali with a pseudo-random but deterministic pattern
        const latOffset = ((zoneNum % 20) - 10) * 0.003; // ~300m grid
        const lngOffset = ((Math.floor(zoneNum / 20) % 20) - 10) * 0.003; // ~300m grid
        
        console.log(`📍 Geocoded Kigali zone "${address}" to calculated coordinates`);
        return {
          latitude: -1.9536 + latOffset,
          longitude: 30.0605 + lngOffset,
        };
      }
    }
  }

  // Try exact match in Rwanda locations
  if (RWANDA_LOCATIONS[normalizedAddress]) {
    return RWANDA_LOCATIONS[normalizedAddress];
  }

  // Try partial matches in Rwanda locations
  for (const [key, coords] of Object.entries(RWANDA_LOCATIONS)) {
    if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
      return coords;
    }
  }

  // Also try with original spacing for location names that might have spaces
  const originalNormalized = address.toLowerCase().trim();
  if (RWANDA_LOCATIONS[originalNormalized]) {
    return RWANDA_LOCATIONS[originalNormalized];
  }

  for (const [key, coords] of Object.entries(RWANDA_LOCATIONS)) {
    if (originalNormalized.includes(key) || key.includes(originalNormalized)) {
      return coords;
    }
  }

  // If no match found, return default central Kigali
  // This ensures the app always has valid coordinates
  console.warn(
    `Address "${address}" not found in location database. Using default Kigali coordinates.`
  );
  return { latitude: -1.9536, longitude: 30.0605 };
};

/**
 * Ensure location has valid coordinates
 * If coordinates are missing but address is available, geocode the address
 * 
 * @param location - Location object that may have missing coordinates
 * @returns Location object with guaranteed valid coordinates
 */
export const ensureCoordinates = (location: any): any => {
  if (!location) {
    return {
      latitude: -1.9536,
      longitude: 30.0605,
      address: 'Default Location',
    };
  }

  // If coordinates are already valid, return as-is
  if (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude)
  ) {
    return location;
  }

  // If address is available, geocode it
  if (location.address) {
    const coords = geocodeAddress(location.address);
    return {
      ...location,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }

  // Fallback to default
  return {
    ...location,
    latitude: -1.9536,
    longitude: 30.0605,
    address: location.address || 'Unknown Location',
  };
};

/**
 * Validate that a location has valid coordinates
 * 
 * @param location - Location to validate
 * @returns true if location has valid latitude and longitude
 */
export const isValidLocation = (location: any): boolean => {
  if (!location) return false;
  
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    !isNaN(location.latitude) &&
    !isNaN(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
};

/**
 * Get best available coordinates for a location
 * Priority: existing coordinates > geocoded address > default
 * 
 * @param location - Location object
 * @returns Valid LocationCoords guaranteed
 */
export const getCoordinates = (location: any): LocationCoords => {
  const validated = ensureCoordinates(location);
  return {
    latitude: validated.latitude,
    longitude: validated.longitude,
  };
};

export default {
  geocodeAddress,
  ensureCoordinates,
  isValidLocation,
  getCoordinates,
};