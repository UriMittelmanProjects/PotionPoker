import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { PokerSession, SessionType, SessionFilter } from '../shared/types';
import { useSessionStore } from '../shared/stores/sessionStore';

interface SessionHistoryScreenProps {
  onSessionSelect: (session: PokerSession) => void;
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

interface SessionCardProps {
  session: PokerSession;
  onPress: () => void;
}

function SessionCard({ session, onPress }: SessionCardProps) {
  const profit = session.profit || 0;
  const profitColor = profit >= 0 ? '#28a745' : '#dc3545';
  const profitSymbol = profit >= 0 ? '+' : '';

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {session.venue || 'Unnamed Session'}
          </Text>
          <Text style={styles.sessionDate}>
            {formatDate(session.startTime)}
          </Text>
        </View>
        
        <View style={styles.sessionMeta}>
          <View style={[
            styles.typeChip,
            { backgroundColor: getSessionTypeColor(session.sessionType) }
          ]}>
            <Text style={styles.typeText}>
              {getSessionTypeLabel(session.sessionType)}
            </Text>
          </View>
          
          <Text style={[styles.profitText, { color: profitColor }]}>
            {profitSymbol}{formatCurrency(Math.abs(profit))}
          </Text>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Buy-in</Text>
          <Text style={styles.detailValue}>{formatCurrency(session.totalBuyIn)}</Text>
        </View>
        
        {session.cashOut !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cash-out</Text>
            <Text style={styles.detailValue}>{formatCurrency(session.cashOut)}</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{formatDuration(session.duration)}</Text>
        </View>
        
        {session.stakes && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Stakes</Text>
            <Text style={styles.detailValue}>{session.stakes}</Text>
          </View>
        )}
      </View>

      {!session.isComplete && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>Active Session</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SessionHistoryScreen({ onSessionSelect }: SessionHistoryScreenProps) {
  const { sessions, isLoading, fetchSessions } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SessionType | undefined>();

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchQuery || 
      session.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || session.sessionType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const typeFilters = [
    { value: undefined, label: 'All' },
    { value: SessionType.LIVE_CASINO, label: 'Casino' },
    { value: SessionType.HOME_GAME, label: 'Home Game' },
    { value: SessionType.ONLINE, label: 'Online' },
    { value: SessionType.OTHER, label: 'Other' },
  ];

  const renderSession = ({ item }: { item: PokerSession }) => (
    <SessionCard 
      session={item} 
      onPress={() => onSessionSelect(item)} 
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Sessions Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedType 
          ? 'Try adjusting your filters' 
          : 'Start your first poker session to see it here'
        }
      </Text>
    </View>
  );

  if (isLoading && sessions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterContainer}>
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterChip,
                selectedType === filter.value && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedType(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === filter.value && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={isLoading}
        onRefresh={() => fetchSessions()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  activeFilterChip: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  profitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    alignItems: 'center',
    minWidth: '20%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activeIndicator: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#28a745',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});