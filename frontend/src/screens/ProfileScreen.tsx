import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import ProfileHeader from '../shared/components/ProfileHeader';
import ProfileStats from '../shared/components/ProfileStats';
import SessionHistory from '../shared/components/SessionHistory';
import PrivacyControls from '../shared/components/PrivacyControls';
import { 
  User, 
  PokerSession, 
  ProfileStats as ProfileStatsType,
  PlayingStatus,
  StatusVisibility
} from '../shared/types';
import { mockUser, mockSessions, mockProfileStats } from '../shared/data/mockData';

/**
 * ProfileScreen Component
 * 
 * Main profile tab displaying user's poker profile with Instagram-style layout.
 * Shows profile header, statistics, session history, and privacy controls.
 * Supports both own profile view and other users' profiles.
 */
export default function ProfileScreen() {
  const [user, setUser] = useState<User>(mockUser);
  const [sessions] = useState<PokerSession[]>(mockSessions);
  const [stats] = useState<ProfileStatsType>(mockProfileStats);
  const [isOwnProfile] = useState(true);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Navigate to edit profile screen');
  };

  const handleSendMessage = () => {
    Alert.alert('Send Message', 'Navigate to messaging screen');
  };

  const handleAddFriend = () => {
    Alert.alert('Add Friend', 'Send friend request');
  };

  const handleStatusVisibilityChange = (visibility: StatusVisibility) => {
    setUser(prev => ({ ...prev, statusVisibility: visibility }));
  };

  const handleShowPlayingStatusChange = (show: boolean) => {
    setUser(prev => ({ ...prev, showPlayingStatus: show }));
  };

  const handlePlayingStatusChange = (status: PlayingStatus) => {
    setUser(prev => ({ ...prev, playingStatus: status }));
  };

  const handleLocationChange = () => {
    Alert.alert('Set Location', 'Choose your current playing location');
  };

  const handleSessionPress = (session: PokerSession) => {
    Alert.alert('Session Details', `Navigate to session: ${session.venue}`);
  };

  const shouldShowPrivateHistory = user.statusVisibility === StatusVisibility.PRIVATE && !isOwnProfile;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
          onSendMessage={handleSendMessage}
          onAddFriend={handleAddFriend}
        />
        
        <View style={styles.separator} />
        
        <ProfileStats stats={stats} />
        
        <View style={styles.separator} />
        
        <SessionHistory
          sessions={sessions}
          isPrivate={shouldShowPrivateHistory}
          onSessionPress={handleSessionPress}
        />
        
        {isOwnProfile && (
          <>
            <View style={styles.separator} />
            
            <PrivacyControls
              statusVisibility={user.statusVisibility}
              showPlayingStatus={user.showPlayingStatus}
              playingStatus={user.playingStatus}
              currentLocation={user.currentLocation}
              onStatusVisibilityChange={handleStatusVisibilityChange}
              onShowPlayingStatusChange={handleShowPlayingStatusChange}
              onPlayingStatusChange={handlePlayingStatusChange}
              onLocationChange={handleLocationChange}
            />
          </>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  separator: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  bottomPadding: {
    height: 30,
  },
});