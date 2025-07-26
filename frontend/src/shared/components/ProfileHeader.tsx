import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User, PlayingStatus } from '../types';

interface ProfileHeaderProps {
  user: User;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onSendMessage?: () => void;
  onAddFriend?: () => void;
}

/**
 * ProfileHeader Component
 * 
 * Instagram-style profile header displaying user's profile picture, display name,
 * username, playing status, and action buttons. Shows different buttons based on
 * whether viewing own profile or another user's profile.
 * 
 * @param user - User object containing profile information
 * @param isOwnProfile - Whether this is the current user's own profile
 * @param onEditProfile - Callback for edit profile button (own profile)
 * @param onSendMessage - Callback for message button (other users)
 * @param onAddFriend - Callback for add friend button (other users)
 */
export default function ProfileHeader({ 
  user, 
  isOwnProfile = true,
  onEditProfile,
  onSendMessage,
  onAddFriend
}: ProfileHeaderProps) {
  const getStatusColor = (status: PlayingStatus): string => {
    switch (status) {
      case PlayingStatus.PLAYING:
        return '#4CAF50';
      case PlayingStatus.ONLINE:
        return '#2196F3';
      case PlayingStatus.OFFLINE:
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: PlayingStatus): string => {
    switch (status) {
      case PlayingStatus.PLAYING:
        return user.currentLocation ? `Playing at ${user.currentLocation}` : 'Playing';
      case PlayingStatus.ONLINE:
        return 'Online';
      case PlayingStatus.OFFLINE:
      default:
        return 'Offline';
    }
  };

  const displayName = user.displayName || `${user.firstName} ${user.lastName}`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitials}>
              {user.firstName[0]}{user.lastName[0]}
            </Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(user.playingStatus) }]} />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {user.showPlayingStatus && (
            <Text style={[styles.status, { color: getStatusColor(user.playingStatus) }]}>
              {getStatusText(user.playingStatus)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {isOwnProfile ? (
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.socialActions}>
            <TouchableOpacity style={styles.messageButton} onPress={onSendMessage}>
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addFriendButton} onPress={onAddFriend}>
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#666',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  socialActions: {
    flexDirection: 'row',
    gap: 10,
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addFriendButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  addFriendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});