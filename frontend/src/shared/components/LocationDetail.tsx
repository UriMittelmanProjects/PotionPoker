import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Location, LocationSession, LocationStats } from '../types';
import { formatCurrency, getSessionTypeIcon } from '../utils/locationUtils';

interface LocationDetailProps {
  location: Location;
  sessions: LocationSession[];
  stats: LocationStats;
  onSessionPress?: (session: LocationSession) => void;
  onClose?: () => void;
}

/**
 * LocationDetail Component
 * 
 * Detailed view of a specific location showing session history, statistics,
 * and performance data. Displays all sessions played at the venue with
 * profit/loss breakdown and key metrics.
 * 
 * @param location - Location data and basic stats
 * @param sessions - Array of sessions played at this location
 * @param stats - Detailed performance statistics for this location
 * @param onSessionPress - Callback when user taps a session
 * @param onClose - Callback to close the detail view
 */
export default function LocationDetail({ 
  location, 
  sessions, 
  stats,
  onSessionPress,
  onClose 
}: LocationDetailProps) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const renderSessionItem = ({ item }: { item: LocationSession }) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => onSessionPress?.(item)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
          <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
        </View>
        
        <View style={styles.sessionResult}>
          <Text style={[
            styles.sessionProfit,
            { color: item.profit >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatCurrency(item.profit)}
          </Text>
          {item.stakes && (
            <Text style={styles.sessionStakes}>{item.stakes}</Text>
          )}
        </View>
      </View>
      
      {item.gameType && (
        <Text style={styles.sessionGameType}>{item.gameType}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.locationIcon}>
            {getSessionTypeIcon(location.sessionType)}
          </Text>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            {location.address && (
              <Text style={styles.locationAddress}>{location.address}</Text>
            )}
          </View>
        </View>
        
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: stats.totalProfit >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(stats.totalProfit)}
              </Text>
              <Text style={styles.statLabel}>Total P&L</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalHours.toFixed(0)}h</Text>
              <Text style={styles.statLabel}>Hours Played</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: stats.hourlyRate >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                ${stats.hourlyRate.toFixed(0)}/hr
              </Text>
              <Text style={styles.statLabel}>Hourly Rate</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(stats.winRate * 100).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avgSessionLength.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Avg Length</Text>
            </View>
          </View>

          {(stats.biggestWin > 0 || stats.biggestLoss < 0) && (
            <View style={styles.extremesRow}>
              <View style={styles.extremeItem}>
                <Text style={styles.extremeLabel}>Biggest Win</Text>
                <Text style={[styles.extremeValue, { color: '#4CAF50' }]}>
                  {formatCurrency(stats.biggestWin)}
                </Text>
              </View>
              
              <View style={styles.extremeItem}>
                <Text style={styles.extremeLabel}>Biggest Loss</Text>
                <Text style={[styles.extremeValue, { color: '#F44336' }]}>
                  {formatCurrency(stats.biggestLoss)}
                </Text>
              </View>
            </View>
          )}

          {stats.favoriteStakes && (
            <View style={styles.favoriteStakes}>
              <Text style={styles.favoriteStakesLabel}>Most Played Stakes</Text>
              <Text style={styles.favoriteStakesValue}>{stats.favoriteStakes}</Text>
            </View>
          )}
        </View>

        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            Session History ({sessions.length})
          </Text>
          
          {sessions.length > 0 ? (
            <FlatList
              data={sessions}
              renderItem={renderSessionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sessions recorded</Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  statItem: {
    width: '33.33%',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  extremesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  extremeItem: {
    alignItems: 'center',
  },
  extremeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  extremeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteStakes: {
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  favoriteStakesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  favoriteStakesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionsSection: {
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  sessionItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#666',
  },
  sessionResult: {
    alignItems: 'flex-end',
  },
  sessionProfit: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sessionStakes: {
    fontSize: 12,
    color: '#666',
  },
  sessionGameType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bottomPadding: {
    height: 30,
  },
});