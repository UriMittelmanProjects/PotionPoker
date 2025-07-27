import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Location } from '../types';
import { formatCurrency, getSessionTypeIcon } from '../utils/locationUtils';

interface LocationListProps {
  locations: Location[];
  onLocationPress: (location: Location) => void;
  showNearbyVenues?: boolean;
}

/**
 * LocationList Component
 * 
 * List view of poker locations showing session counts, profit/loss,
 * and key statistics. Provides alternative to map view for users
 * who prefer list format. Shows both visited and nearby venues.
 * 
 * @param locations - Array of locations to display
 * @param onLocationPress - Callback when user taps a location
 * @param showNearbyVenues - Whether to include nearby venues user hasn't visited
 */
export default function LocationList({ 
  locations, 
  onLocationPress,
  showNearbyVenues = true 
}: LocationListProps) {
  const userLocations = locations.filter(loc => loc.isUserLocation);
  const nearbyLocations = locations.filter(loc => !loc.isUserLocation);

  const formatLastVisited = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => onLocationPress(item)}
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationIcon}>
          <Text style={styles.iconText}>
            {getSessionTypeIcon(item.sessionType)}
          </Text>
        </View>
        
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={1}>
            {item.name}
          </Text>
          
          {item.address && (
            <Text style={styles.locationAddress} numberOfLines={1}>
              {item.address}
            </Text>
          )}
          
          {item.isUserLocation && (
            <Text style={styles.lastVisited}>
              Last visited: {formatLastVisited(item.lastVisited)}
            </Text>
          )}
        </View>
        
        <View style={styles.locationStats}>
          {item.isUserLocation ? (
            <>
              <Text style={styles.sessionCount}>
                {item.sessionCount} session{item.sessionCount !== 1 ? 's' : ''}
              </Text>
              <Text style={[
                styles.totalProfit,
                { color: item.totalProfit >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(item.totalProfit)}
              </Text>
              <Text style={styles.hourlyRate}>
                ${item.hourlyRate.toFixed(0)}/hr
              </Text>
            </>
          ) : (
            <Text style={styles.nearbyLabel}>Nearby</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title} ({count})
      </Text>
    </View>
  );

  if (userLocations.length === 0 && nearbyLocations.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyTitle}>No Locations Found</Text>
        <Text style={styles.emptyText}>
          Start tracking your poker sessions to see locations on the map
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[
          ...(userLocations.length > 0 ? [{ type: 'header', title: 'Your Locations', count: userLocations.length }] : []),
          ...userLocations.map(loc => ({ type: 'location', ...loc })),
          ...(showNearbyVenues && nearbyLocations.length > 0 ? [{ type: 'header', title: 'Nearby Venues', count: nearbyLocations.length }] : []),
          ...(showNearbyVenues ? nearbyLocations.map(loc => ({ type: 'location', ...loc })) : []),
        ]}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return renderSectionHeader((item as any).title, (item as any).count);
          }
          return renderLocationItem({ item: item as Location });
        }}
        keyExtractor={(item, index) => 
          item.type === 'header' ? `header-${index}` : `location-${(item as any).id}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingVertical: 10,
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  locationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  locationInfo: {
    flex: 1,
    marginRight: 10,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  lastVisited: {
    fontSize: 11,
    color: '#999',
  },
  locationStats: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  sessionCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  totalProfit: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  hourlyRate: {
    fontSize: 12,
    color: '#666',
  },
  nearbyLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});