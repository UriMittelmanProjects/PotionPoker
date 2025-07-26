import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import LocationMapView from '../shared/components/LocationMapView';
import LocationList from '../shared/components/LocationList';
import LocationDetail from '../shared/components/LocationDetail';
import { 
  Location, 
  LocationPin, 
  LocationSession,
  LocationStats
} from '../shared/types';
import { 
  mockLocations, 
  mockLocationSessions, 
  mockLocationStats 
} from '../shared/data/mockData';
import { generateLocationPins } from '../shared/utils/locationUtils';

/**
 * LocationsScreen Component
 * 
 * Interactive map and list view showing poker session locations with color-coded pins.
 * Green pins for live casinos visited, blue for home games, red for nearby venues.
 * Supports switching between map and list views, with detailed location analysis.
 */
export default function LocationsScreen() {
  const [locations] = useState<Location[]>(mockLocations);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationDetail, setShowLocationDetail] = useState(false);

  const pins = generateLocationPins(locations);
  
  // Debug logging
  console.log('Locations count:', locations.length);
  console.log('Pins count:', pins.length);
  console.log('First location:', locations[0]);
  console.log('First pin:', pins[0]);

  const handlePinPress = (pin: LocationPin) => {
    if (pin.location) {
      setSelectedLocation(pin.location);
      setShowLocationDetail(true);
    }
  };

  const handleLocationPress = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationDetail(true);
  };

  const handleSessionPress = (session: LocationSession) => {
    console.log('Navigate to session details:', session.sessionId);
  };

  const getLocationSessions = (locationId: string): LocationSession[] => {
    return mockLocationSessions.filter(session => session.locationId === locationId);
  };

  const getLocationStats = (locationId: string): LocationStats => {
    return mockLocationStats[locationId] || {
      totalSessions: 0,
      totalProfit: 0,
      totalHours: 0,
      hourlyRate: 0,
      winRate: 0,
      biggestWin: 0,
      biggestLoss: 0,
      avgSessionLength: 0,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              🗺️ Map
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              📋 List
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.locationCount}>
          <Text style={styles.countText}>
            {locations.filter(l => l.isUserLocation).length} locations
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {viewMode === 'map' ? (
          <LocationMapView
            pins={pins}
            onPinPress={handlePinPress}
            showUserLocation={true}
          />
        ) : (
          <LocationList
            locations={locations}
            onLocationPress={handleLocationPress}
            showNearbyVenues={true}
          />
        )}
      </View>

      <Modal
        visible={showLocationDetail && selectedLocation !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationDetail(false)}
      >
        {selectedLocation && (
          <LocationDetail
            location={selectedLocation}
            sessions={getLocationSessions(selectedLocation.id)}
            stats={getLocationStats(selectedLocation.id)}
            onSessionPress={handleSessionPress}
            onClose={() => setShowLocationDetail(false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#2196F3',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  locationCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976d2',
  },
  content: {
    flex: 1,
  },
});