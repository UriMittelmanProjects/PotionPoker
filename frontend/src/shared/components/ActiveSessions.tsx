import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { PokerSession, SessionType } from '../types';

interface ActiveSessionsProps {
  sessions: PokerSession[];
  onSessionPress?: (session: PokerSession) => void;
  onEndSession?: (session: PokerSession) => void;
  showHeader?: boolean;
}

/**
 * ActiveSessions Component
 * 
 * Displays currently active poker sessions with live duration tracking,
 * current profit/loss, and quick actions to update or end sessions.
 * Provides real-time session management from the home dashboard.
 * 
 * @param sessions - Array of active poker sessions
 * @param onSessionPress - Callback when user taps a session
 * @param onEndSession - Callback when user wants to end a session
 * @param showHeader - Whether to show the section header
 */
export default function ActiveSessions({ 
  sessions, 
  onSessionPress,
  onEndSession,
  showHeader = true 
}: ActiveSessionsProps) {
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

  const formatDuration = (startTime: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startTime.getTime());
    const totalMinutes = Math.floor(diffTime / (1000 * 60));
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toFixed(0)}`;
  };

  const getCurrentProfit = (session: PokerSession): number => {
    if (session.cashOut && session.totalBuyIn) {
      return session.cashOut - session.totalBuyIn;
    }
    return 0;
  };

  const renderSessionItem = ({ item }: { item: PokerSession }) => {
    const currentProfit = getCurrentProfit(item);
    const duration = formatDuration(item.startTime);

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => onSessionPress?.(item)}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <View style={styles.sessionTitle}>
              <Text style={styles.sessionIcon}>
                {getSessionTypeIcon(item.sessionType)}
              </Text>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionVenue} numberOfLines={1}>
                  {item.venue || 'Unnamed Session'}
                </Text>
                <Text style={styles.sessionMeta}>
                  {item.stakes && `${item.stakes} • `}{duration}
                </Text>
              </View>
            </View>
            
            <View style={styles.sessionStats}>
              <Text style={styles.buyInText}>
                Buy-in: ${item.totalBuyIn.toFixed(0)}
              </Text>
              <Text style={[
                styles.profitText,
                { color: currentProfit >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(currentProfit)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sessionActions}>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => onSessionPress?.(item)}
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.endButton}
            onPress={() => onEndSession?.(item)}
          >
            <Text style={styles.endButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <Text style={styles.sectionTitle}>Active Sessions</Text>
        )}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎰</Text>
          <Text style={styles.emptyTitle}>No Active Sessions</Text>
          <Text style={styles.emptyText}>
            Start a new session to track your live poker play
          </Text>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            Active Sessions ({sessions.length})
          </Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    borderLeftColor: '#4CAF50',
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionVenue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: '#666',
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  buyInText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  profitText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  endButtonText: {
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
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});