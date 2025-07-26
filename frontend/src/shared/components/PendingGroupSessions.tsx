import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { PendingGroupSession } from '../types';

interface PendingGroupSessionsProps {
  sessions: PendingGroupSession[];
  onSessionPress?: (session: PendingGroupSession) => void;
  onJoinSession?: (session: PendingGroupSession) => void;
  showHeader?: boolean;
}

/**
 * PendingGroupSessions Component
 * 
 * Displays group sessions awaiting user participation. Shows sessions
 * from user's groups that are starting soon or currently active,
 * with options to join or view details.
 * 
 * @param sessions - Array of pending group sessions
 * @param onSessionPress - Callback when user taps a session
 * @param onJoinSession - Callback when user wants to join a session
 * @param showHeader - Whether to show the section header
 */
export default function PendingGroupSessions({ 
  sessions, 
  onSessionPress,
  onJoinSession,
  showHeader = true 
}: PendingGroupSessionsProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSessionStatus = (session: PendingGroupSession): { text: string; color: string } => {
    const now = new Date();
    const diffMinutes = Math.floor((session.startTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return { text: 'LIVE NOW', color: '#4CAF50' };
    } else if (diffMinutes <= 30) {
      return { text: `STARTS IN ${diffMinutes}M`, color: '#FF9800' };
    } else if (diffMinutes <= 120) {
      return { text: `STARTS IN ${Math.floor(diffMinutes / 60)}H`, color: '#2196F3' };
    }
    
    return { text: 'SCHEDULED', color: '#666' };
  };

  const renderSessionItem = ({ item }: { item: PendingGroupSession }) => {
    const status = getSessionStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => onSessionPress?.(item)}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <Text style={styles.groupName}>{item.group.name}</Text>
            <Text style={styles.sessionVenue} numberOfLines={1}>
              📍 {item.venue}
            </Text>
            <View style={styles.sessionMeta}>
              <Text style={styles.dateTime}>
                {formatDate(item.startTime)} • {formatTime(item.startTime)}
              </Text>
              <Text style={styles.playerCount}>
                {item.playerCount} player{item.playerCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.sessionStatus}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sessionActions}>
          {item.hasJoined ? (
            <View style={styles.joinedIndicator}>
              <Text style={styles.joinedText}>✓ Joined</Text>
            </View>
          ) : item.canJoin ? (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => onJoinSession?.(item)}
            >
              <Text style={styles.joinButtonText}>Join Session</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.cantJoinIndicator}>
              <Text style={styles.cantJoinText}>Session Full</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => onSessionPress?.(item)}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <Text style={styles.sectionTitle}>Group Sessions</Text>
        )}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Pending Sessions</Text>
          <Text style={styles.emptyText}>
            Join a group or create a session to see upcoming games
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            Group Sessions ({sessions.length})
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
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
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sessionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionVenue: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTime: {
    fontSize: 12,
    color: '#666',
  },
  playerCount: {
    fontSize: 12,
    color: '#666',
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedIndicator: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  joinedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  cantJoinIndicator: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cantJoinText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
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
  },
});