import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LocationSuggestion, SessionType } from '../types';

interface LocationSuggestionsProps {
  suggestions: LocationSuggestion[];
  onSelectLocation: (location: LocationSuggestion) => void;
  isLoading?: boolean;
}

const getSessionTypeLabel = (type: SessionType): string => {
  switch (type) {
    case SessionType.LIVE_CASINO:
      return 'Casino';
    case SessionType.HOME_GAME:
      return 'Home Game';
    case SessionType.ONLINE:
      return 'Online';
    case SessionType.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
};

const getSessionTypeColor = (type: SessionType): string => {
  switch (type) {
    case SessionType.LIVE_CASINO:
      return '#28a745';
    case SessionType.HOME_GAME:
      return '#007bff';
    case SessionType.ONLINE:
      return '#ffc107';
    case SessionType.OTHER:
      return '#6c757d';
    default:
      return '#6c757d';
  }
};

export default function LocationSuggestions({ 
  suggestions, 
  onSelectLocation,
  isLoading = false 
}: LocationSuggestionsProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Locations</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading suggestions...</Text>
        </View>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Locations</Text>
        <Text style={styles.emptyText}>No recent locations to suggest</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Locations</Text>
      <Text style={styles.subtitle}>Tap to auto-fill location details</Text>
      
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={`${suggestion.venue}-${index}`}
          style={styles.suggestionCard}
          onPress={() => onSelectLocation(suggestion)}
        >
          <View style={styles.suggestionHeader}>
            <Text style={styles.venueName}>{suggestion.venue}</Text>
            <View style={[
              styles.typeChip,
              { backgroundColor: getSessionTypeColor(suggestion.sessionType) }
            ]}>
              <Text style={styles.typeText}>
                {getSessionTypeLabel(suggestion.sessionType)}
              </Text>
            </View>
          </View>
          
          {suggestion.address && (
            <Text style={styles.address}>{suggestion.address}</Text>
          )}
          
          <View style={styles.usageContainer}>
            <Text style={styles.usageText}>
              Used {suggestion.usageCount} time{suggestion.usageCount > 1 ? 's' : ''}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  usageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  usageText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});