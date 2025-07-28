import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
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
import { useAuthStore } from '../shared/stores/authStore';

/**
 * ProfileScreen Component
 * 
 * Main profile tab displaying user's poker profile with Instagram-style layout.
 * Shows profile header, statistics, session history, and privacy controls.
 * Supports both own profile view and other users' profiles.
 */
export default function ProfileScreen() {
  const { user: authUser, logout, isAuthenticated } = useAuthStore();
  const [user, setUser] = useState<User>(authUser || mockUser);
  const [sessions] = useState<PokerSession[]>(mockSessions);
  const [stats] = useState<ProfileStatsType>(mockProfileStats);
  const [isOwnProfile] = useState(true);

  // Debug authentication state
  useEffect(() => {
    console.log('👤 ProfileScreen: Auth state:', {
      isAuthenticated,
      hasAuthUser: !!authUser,
      authUserEmail: authUser?.email,
      isOwnProfile,
      userDisplayName: user.firstName + ' ' + user.lastName
    });
  }, [isAuthenticated, authUser, isOwnProfile, user]);

  // Sync with auth store when user data changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

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

  const handleLogout = async () => {
    console.log('🔴 handleLogout called');
    
    // Skip confirmation for now to test if logout works
    try {
      console.log('🚪 Calling logout function...');
      await logout();
      console.log('✅ Logout completed successfully');
      // Note: Navigation should happen automatically via AppNavigator
      // when isAuthenticated becomes false
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Use console instead of Alert for debugging
      console.log('❌ Logout failed:', error.message);
    }
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
        
        {isOwnProfile ? (
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
            
            <View style={styles.separator} />
            
            <View style={styles.logoutSection}>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => {
                  console.log('🔴 LOGOUT BUTTON PRESSED!');
                  handleLogout();
                }}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={{ padding: 20 }}>
            <Text>DEBUG: isOwnProfile is false, logout button not showing</Text>
          </View>
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
  logoutSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});