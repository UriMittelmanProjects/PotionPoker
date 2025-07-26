import { Location, LocationPin, LocationPinType, MapRegion, NearbyVenue } from '../types';
import { SessionType } from '../types';

/**
 * Location Utilities
 * 
 * Utilities for location-based functionality including pin generation,
 * distance calculations, and map region management.
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get pin color based on location type and user interaction
 */
export const getPinColor = (location: Location): string => {
  if (!location.isUserLocation) {
    return '#F44336'; // Red for nearby venues user hasn't visited
  }
  
  switch (location.sessionType) {
    case SessionType.LIVE_CASINO:
      return '#4CAF50'; // Green for live casinos user has played at
    case SessionType.HOME_GAME:
      return '#2196F3'; // Blue for home games user has played at
    case SessionType.ONLINE:
      return '#9C27B0'; // Purple for online (shouldn't appear on map typically)
    case SessionType.OTHER:
    default:
      return '#FF9800'; // Orange for other venues
  }
};

/**
 * Get pin type based on location data
 */
export const getPinType = (location: Location): LocationPinType => {
  if (!location.isUserLocation) {
    return LocationPinType.NEARBY_CASINO;
  }
  
  switch (location.sessionType) {
    case SessionType.LIVE_CASINO:
      return LocationPinType.USER_LIVE_CASINO;
    case SessionType.HOME_GAME:
      return LocationPinType.USER_HOME_GAME;
    case SessionType.OTHER:
    default:
      return LocationPinType.USER_OTHER;
  }
};

/**
 * Generate map pins from locations
 */
export const generateLocationPins = (locations: Location[]): LocationPin[] => {
  return locations.map(location => ({
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    type: getPinType(location),
    location,
    title: location.name,
    subtitle: location.isUserLocation 
      ? `${location.sessionCount} sessions • ${formatCurrency(location.totalProfit)}`
      : location.address,
    color: getPinColor(location),
  }));
};

/**
 * Calculate optimal map region to fit all pins
 */
export const calculateMapRegion = (pins: LocationPin[], padding: number = 0.01): MapRegion => {
  if (pins.length === 0) {
    // Default to Las Vegas if no pins
    return {
      latitude: 36.1699,
      longitude: -115.1398,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }
  
  if (pins.length === 1) {
    return {
      latitude: pins[0].latitude,
      longitude: pins[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }
  
  const latitudes = pins.map(pin => pin.latitude);
  const longitudes = pins.map(pin => pin.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  
  const latDelta = Math.max(maxLat - minLat + padding, 0.01);
  const lonDelta = Math.max(maxLon - minLon + padding, 0.01);
  
  return {
    latitude: centerLat,
    longitude: centerLon,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${amount.toFixed(0)}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (miles: number): string => {
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

/**
 * Get session type icon
 */
export const getSessionTypeIcon = (sessionType: SessionType): string => {
  switch (sessionType) {
    case SessionType.LIVE_CASINO:
      return '🏢';
    case SessionType.HOME_GAME:
      return '🏠';
    case SessionType.ONLINE:
      return '💻';
    case SessionType.OTHER:
    default:
      return '🎰';
  }
};

/**
 * Generate mock nearby venues (in a real app, this would be an API call)
 */
export const generateNearbyVenues = (
  centerLat: number,
  centerLon: number,
  radiusMiles: number = 50
): NearbyVenue[] => {
  // Mock data - in real app this would come from a venues API
  const mockVenues: NearbyVenue[] = [
    {
      id: 'venue-1',
      name: 'MGM Grand Casino',
      address: '3799 S Las Vegas Blvd, Las Vegas, NV',
      latitude: 36.1024,
      longitude: -115.1698,
      venueType: 'casino',
      distance: 0,
      rating: 4.2,
      hasPoker: true,
    },
    {
      id: 'venue-2',
      name: 'Aria Resort & Casino',
      address: '3730 S Las Vegas Blvd, Las Vegas, NV',
      latitude: 36.1062,
      longitude: -115.1781,
      venueType: 'casino',
      distance: 0,
      rating: 4.5,
      hasPoker: true,
    },
    {
      id: 'venue-3',
      name: 'Bellagio Hotel & Casino',
      address: '3600 S Las Vegas Blvd, Las Vegas, NV',
      latitude: 36.1126,
      longitude: -115.1767,
      venueType: 'casino',
      distance: 0,
      rating: 4.4,
      hasPoker: true,
    },
  ];
  
  return mockVenues
    .map(venue => ({
      ...venue,
      distance: calculateDistance(centerLat, centerLon, venue.latitude, venue.longitude)
    }))
    .filter(venue => venue.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Simple geocoding mock (in real app, use Google Maps or similar API)
 */
export const geocodeAddress = async (address: string): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  // Mock geocoding - in real app this would be an API call
  const mockCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
    'bellagio casino': { latitude: 36.1126, longitude: -115.1767 },
    'mgm grand': { latitude: 36.1024, longitude: -115.1698 },
    'aria casino': { latitude: 36.1062, longitude: -115.1781 },
    'commerce casino': { latitude: 34.0007, longitude: -118.1395 },
    'bicycle casino': { latitude: 33.8003, longitude: -118.1595 },
  };
  
  const normalizedAddress = address.toLowerCase();
  const match = Object.keys(mockCoordinates).find(key => 
    normalizedAddress.includes(key)
  );
  
  if (match) {
    return mockCoordinates[match];
  }
  
  // Default fallback coordinates
  return { latitude: 36.1699, longitude: -115.1398 };
};