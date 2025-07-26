import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { PokerSession, SessionType } from '../types';

interface SessionHistoryProps {
  sessions: PokerSession[];
  isPrivate?: boolean;
  onSessionPress?: (session: PokerSession) => void;
}

/**
 * SessionHistory Component
 * 
 * Displays a list of poker sessions in the profile tab. Can be hidden for privacy.
 * Shows session venue, profit/loss, duration, and session type icons.
 * Tapping a session navigates to session details.
 * 
 * @param sessions - Array of poker sessions to display
 * @param isPrivate - Whether to hide session list for privacy
 * @param onSessionPress - Callback when user taps on a session
 */
export default function SessionHistory({ 
  sessions, 
  isPrivate = false,
  onSessionPress 
}: SessionHistoryProps) {
  const getSessionTypeIcon = (type: SessionType): string => {
    switch (type) {
      case SessionType.LIVE_CASINO:
        return '🏢';
      case SessionType.HOME_GAME:
        return '🏠';
      case SessionType.ONLINE:
        return '💻';
      case SessionType.OTHER:
      default:
        return '🎰';
    }
  };

  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toFixed(0)}`;
  };

  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSessionItem = ({ item }: { item: PokerSession }) => (
    <TouchableOpacity 
      style={styles.sessionItem}
      onPress={() => onSessionPress?.(item)}
      disabled={!onSessionPress}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionIcon}>{getSessionTypeIcon(item.sessionType)}</Text>
          <View style={styles.sessionDetails}>
            <Text style={styles.sessionVenue} numberOfLines={1}>
              {item.venue || 'Unknown Venue'}
            </Text>
            <Text style={styles.sessionDate}>
              {formatDate(new Date(item.startTime))} • {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
        
        <View style={styles.sessionProfit}>
          <Text style={[
            styles.profitAmount,
            { color: (item.profit || 0) >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatCurrency(item.profit || 0)}
          </Text>
          {item.stakes && (
            <Text style={styles.sessionStakes}>{item.stakes}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isPrivate) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Session History</Text>
        <View style={styles.privateMessage}>
          <Text style={styles.privateText}>Session history is private</Text>
        </View>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Session History</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sessions yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Session History</Text>
      <FlatList
        data={sessions.slice(0, 10)}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      {sessions.length > 10 && (
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Sessions</Text>
        </TouchableOpacity>
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
    marginBottom: 15,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionVenue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  sessionProfit: {
    alignItems: 'flex-end',
  },
  profitAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sessionStakes: {
    fontSize: 12,
    color: '#666',
  },
  privateMessage: {
    padding: 20,
    alignItems: 'center',
  },
  privateText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});