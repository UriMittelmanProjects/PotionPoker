import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { StatusVisibility, PlayingStatus } from '../types';

interface PrivacyControlsProps {
  statusVisibility: StatusVisibility;
  showPlayingStatus: boolean;
  playingStatus: PlayingStatus;
  currentLocation?: string;
  onStatusVisibilityChange: (visibility: StatusVisibility) => void;
  onShowPlayingStatusChange: (show: boolean) => void;
  onPlayingStatusChange: (status: PlayingStatus) => void;
  onLocationChange: () => void;
}

/**
 * PrivacyControls Component
 * 
 * Provides controls for managing privacy settings including status visibility,
 * playing status display, and current location. Allows users to control who
 * can see their poker activities and status.
 * 
 * @param statusVisibility - Current status visibility setting
 * @param showPlayingStatus - Whether to show playing status to others
 * @param playingStatus - Current playing status
 * @param currentLocation - Current location if playing
 * @param onStatusVisibilityChange - Callback for status visibility changes
 * @param onShowPlayingStatusChange - Callback for playing status display toggle
 * @param onPlayingStatusChange - Callback for playing status changes
 * @param onLocationChange - Callback for location changes
 */
export default function PrivacyControls({
  statusVisibility,
  showPlayingStatus,
  playingStatus,
  currentLocation,
  onStatusVisibilityChange,
  onShowPlayingStatusChange,
  onPlayingStatusChange,
  onLocationChange
}: PrivacyControlsProps) {
  const getVisibilityLabel = (visibility: StatusVisibility): string => {
    switch (visibility) {
      case StatusVisibility.PUBLIC:
        return 'Public';
      case StatusVisibility.FRIENDS_ONLY:
        return 'Friends Only';
      case StatusVisibility.PRIVATE:
        return 'Private';
      default:
        return 'Public';
    }
  };

  const getStatusLabel = (status: PlayingStatus): string => {
    switch (status) {
      case PlayingStatus.PLAYING:
        return 'Playing';
      case PlayingStatus.ONLINE:
        return 'Online';
      case PlayingStatus.OFFLINE:
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  const getStatusDescription = (status: PlayingStatus): string => {
    switch (status) {
      case PlayingStatus.PLAYING:
        return currentLocation ? `Playing at ${currentLocation}` : 'Currently in a poker session';
      case PlayingStatus.ONLINE:
        return 'Available and looking for games';
      case PlayingStatus.OFFLINE:
        return 'Not actively playing poker';
      default:
        return 'Not actively playing poker';
    }
  };

  const cycleStatusVisibility = () => {
    const visibilityOrder = [
      StatusVisibility.PUBLIC,
      StatusVisibility.FRIENDS_ONLY,
      StatusVisibility.PRIVATE
    ];
    const currentIndex = visibilityOrder.indexOf(statusVisibility);
    const nextIndex = (currentIndex + 1) % visibilityOrder.length;
    onStatusVisibilityChange(visibilityOrder[nextIndex]);
  };

  const cyclePlayingStatus = () => {
    const statusOrder = [
      PlayingStatus.OFFLINE,
      PlayingStatus.ONLINE,
      PlayingStatus.PLAYING
    ];
    const currentIndex = statusOrder.indexOf(playingStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onPlayingStatusChange(statusOrder[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Privacy & Status</Text>
      
      <View style={styles.controlGroup}>
        <Text style={styles.controlLabel}>Status Visibility</Text>
        <TouchableOpacity style={styles.statusButton} onPress={cycleStatusVisibility}>
          <Text style={styles.statusButtonText}>{getVisibilityLabel(statusVisibility)}</Text>
        </TouchableOpacity>
        <Text style={styles.controlDescription}>
          Who can see your poker activities and status
        </Text>
      </View>

      <View style={styles.controlGroup}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.controlLabel}>Show Playing Status</Text>
            <Text style={styles.controlDescription}>
              Display when you're playing poker
            </Text>
          </View>
          <Switch
            value={showPlayingStatus}
            onValueChange={onShowPlayingStatusChange}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={showPlayingStatus ? '#fff' : '#fff'}
          />
        </View>
      </View>

      {showPlayingStatus && (
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Current Status</Text>
          <TouchableOpacity style={styles.statusButton} onPress={cyclePlayingStatus}>
            <Text style={styles.statusButtonText}>{getStatusLabel(playingStatus)}</Text>
          </TouchableOpacity>
          <Text style={styles.controlDescription}>
            {getStatusDescription(playingStatus)}
          </Text>
          
          {playingStatus === PlayingStatus.PLAYING && (
            <TouchableOpacity style={styles.locationButton} onPress={onLocationChange}>
              <Text style={styles.locationButtonText}>
                {currentLocation ? `📍 ${currentLocation}` : '📍 Set Location'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  controlDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statusButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
});