import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FriendActivity, ActivityType } from '../types';

interface ActivityFeedProps {
  activities: FriendActivity[];
  onActivityPress?: (activity: FriendActivity) => void;
  showHeader?: boolean;
}

/**
 * ActivityFeed Component
 * 
 * Displays recent friend activities in a feed format. Shows notifications
 * like session starts, big wins/losses, and join requests. Provides
 * social engagement and real-time updates from poker network.
 * 
 * @param activities - Array of friend activities to display
 * @param onActivityPress - Callback when user taps an activity
 * @param showHeader - Whether to show the section header
 */
export default function ActivityFeed({ 
  activities, 
  onActivityPress,
  showHeader = true 
}: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.SESSION_STARTED:
        return '🎰';
      case ActivityType.SESSION_ENDED:
        return '✅';
      case ActivityType.BIG_WIN:
        return '🎉';
      case ActivityType.BIG_LOSS:
        return '😤';
      case ActivityType.JOIN_REQUEST:
        return '👋';
      case ActivityType.LOCATION_CHECKIN:
        return '📍';
      default:
        return '🃏';
    }
  };

  const getActivityColor = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.SESSION_STARTED:
        return '#2196F3';
      case ActivityType.SESSION_ENDED:
        return '#4CAF50';
      case ActivityType.BIG_WIN:
        return '#4CAF50';
      case ActivityType.BIG_LOSS:
        return '#F44336';
      case ActivityType.JOIN_REQUEST:
        return '#FF9800';
      case ActivityType.LOCATION_CHECKIN:
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    
    const diffHours = Math.ceil(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderActivityItem = ({ item }: { item: FriendActivity }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        item.canJoin && styles.joinableActivity
      ]}
      onPress={() => onActivityPress?.(item)}
      disabled={!onActivityPress}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.type) }]}>
          <Text style={styles.iconText}>{getActivityIcon(item.type)}</Text>
        </View>
        
        <View style={styles.activityContent}>
          <View style={styles.activityInfo}>
            <Text style={styles.userName}>{item.user.displayName || `${item.user.firstName} ${item.user.lastName}`}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
          
          <Text style={styles.activityMessage}>{item.message}</Text>
          
          {item.location && (
            <Text style={styles.locationText}>📍 {item.location}</Text>
          )}
        </View>
      </View>
      
      {item.canJoin && (
        <View style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <Text style={styles.sectionTitle}>Friend Activity</Text>
        )}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Recent Activity</Text>
          <Text style={styles.emptyText}>
            Connect with friends to see their poker activities
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Friend Activity</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  activityItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  joinableActivity: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  activityMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  joinButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});