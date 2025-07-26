import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { LocationPin, MapRegion } from '../types';
import { calculateMapRegion } from '../utils/locationUtils';

interface LocationMapViewProps {
  pins: LocationPin[];
  onPinPress?: (pin: LocationPin) => void;
  initialRegion?: MapRegion;
  showUserLocation?: boolean;
}

/**
 * LocationMapView Component
 * 
 * Interactive map displaying poker session locations with color-coded pins.
 * Shows green pins for live casinos, blue for home games, red for nearby venues.
 * Supports pin interaction for viewing location details and session data.
 * 
 * Note: This is a mock implementation. In a real app, you would use react-native-maps
 * with proper MapView, Marker, and region management.
 * 
 * @param pins - Array of location pins to display
 * @param onPinPress - Callback when user taps a pin
 * @param initialRegion - Initial map region
 * @param showUserLocation - Whether to show user's current location
 */
export default function LocationMapView({ 
  pins, 
  onPinPress,
  initialRegion,
  showUserLocation = true 
}: LocationMapViewProps) {
  const [region, setRegion] = useState<MapRegion>(
    initialRegion || calculateMapRegion(pins)
  );
  const [selectedPin, setSelectedPin] = useState<LocationPin | null>(null);

  useEffect(() => {
    if (!initialRegion && pins.length > 0) {
      setRegion(calculateMapRegion(pins));
    }
  }, [pins, initialRegion]);

  const handlePinPress = (pin: LocationPin) => {
    setSelectedPin(pin);
    onPinPress?.(pin);
  };

  const screenWidth = Dimensions.get('window').width;
  const mapHeight = screenWidth * 0.8;

  // Mock map implementation - in real app, use MapView from react-native-maps
  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
          <Text style={styles.mapSubtext}>
            Lat: {region.latitude.toFixed(4)}, Lng: {region.longitude.toFixed(4)}
          </Text>
          <Text style={styles.pinCountText}>
            {pins.length} location{pins.length !== 1 ? 's' : ''} found
          </Text>
          
          <View style={styles.pinsContainer}>
            {pins.length > 0 ? (
              pins.map((pin, index) => (
                <TouchableOpacity
                  key={pin.id}
                  style={[
                    styles.pinButton,
                    {
                      backgroundColor: pin.color,
                      left: 20 + (index * 60) % (screenWidth - 80),
                      top: 80 + Math.floor(index / 5) * 60,
                    }
                  ]}
                  onPress={() => handlePinPress(pin)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pinText}>📍</Text>
                  <Text style={styles.pinLabel} numberOfLines={1}>
                    {pin.title.length > 8 ? pin.title.substring(0, 8) + '...' : pin.title}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noPinsMessage}>
                <Text style={styles.noPinsText}>No locations to display</Text>
              </View>
            )}
          </View>
          
          <View style={styles.mapLegend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Live Casinos (Visited)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.legendText}>Home Games (Visited)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Nearby Venues</Text>
            </View>
          </View>
        </View>
      </View>

      {selectedPin && (
        <View style={styles.selectedPinInfo}>
          <View style={styles.pinInfoHeader}>
            <Text style={styles.pinTitle}>{selectedPin.title}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedPin(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedPin.subtitle && (
            <Text style={styles.pinSubtitle}>{selectedPin.subtitle}</Text>
          )}
          {selectedPin.location && (
            <View style={styles.locationStats}>
              <Text style={styles.statText}>
                Sessions: {selectedPin.location.sessionCount}
              </Text>
              <Text style={[
                styles.statText,
                { color: selectedPin.location.totalProfit >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                P&L: {selectedPin.location.totalProfit >= 0 ? '+' : ''}${selectedPin.location.totalProfit.toFixed(0)}
              </Text>
              <Text style={styles.statText}>
                Hourly: ${selectedPin.location.hourlyRate.toFixed(0)}/hr
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setRegion(calculateMapRegion(pins))}
        >
          <Text style={styles.controlButtonText}>Fit All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            // In real app, this would center on user location
            console.log('Center on user location');
          }}
        >
          <Text style={styles.controlButtonText}>My Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    position: 'relative',
    paddingTop: 20,
  },
  mapPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pinCountText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 20,
  },
  pinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pinButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinText: {
    fontSize: 16,
  },
  pinLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
  },
  noPinsMessage: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -10 }],
  },
  noPinsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  mapLegend: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendPin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#333',
  },
  selectedPinInfo: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#333',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  controlButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});