import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, Text, TouchableOpacity } from 'react-native';
import ActivityFeed from '../shared/components/ActivityFeed';
import ActiveSessions from '../shared/components/ActiveSessions';
import QuickActions from '../shared/components/QuickActions';
import PerformanceSummary from '../shared/components/PerformanceSummary';
import PendingGroupSessions from '../shared/components/PendingGroupSessions';
import { 
  DashboardData, 
  FriendActivity, 
  PokerSession, 
  PendingGroupSession,
  QuickStats 
} from '../shared/types';
import { 
  mockDashboardData, 
  mockQuickActions, 
  mockQuickStats 
} from '../shared/data/mockData';

/**
 * HomeScreen Component
 * 
 * Central dashboard with Robinhood-style finance app aesthetic.
 * Shows recent sessions, pending group sessions, friend activity,
 * performance summary with charts, and quick action buttons.
 */
export default function HomeScreen() {
  const [dashboardData] = useState<DashboardData>(mockDashboardData);
  const [quickStats] = useState<QuickStats>(mockQuickStats);

  const handleActivityPress = (activity: FriendActivity) => {
    if (activity.canJoin) {
      Alert.alert(
        'Join Session?', 
        `Join ${activity.user.firstName} at ${activity.location}?`,
        [
          { text: 'Cancel' },
          { text: 'Join', onPress: () => console.log('Joining session:', activity.sessionId) }
        ]
      );
    } else {
      console.log('View activity details:', activity.id);
    }
  };

  const handleSessionPress = (session: PokerSession) => {
    console.log('Navigate to session details:', session.id);
  };

  const handleEndSession = (session: PokerSession) => {
    Alert.alert(
      'End Session?',
      `End your session at ${session.venue}?`,
      [
        { text: 'Cancel' },
        { text: 'End Session', onPress: () => console.log('Ending session:', session.id) }
      ]
    );
  };

  const handleGroupSessionPress = (session: PendingGroupSession) => {
    console.log('Navigate to group session:', session.id);
  };

  const handleJoinGroupSession = (session: PendingGroupSession) => {
    Alert.alert(
      'Join Group Session?',
      `Join ${session.group.name} at ${session.venue}?`,
      [
        { text: 'Cancel' },
        { text: 'Join', onPress: () => console.log('Joining group session:', session.id) }
      ]
    );
  };

  const handleViewPerformanceDetails = () => {
    console.log('Navigate to detailed statistics');
  };

  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toFixed(0)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with quick stats */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Good evening,</Text>
          <Text style={styles.userName}>John</Text>
        </View>
        
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={[styles.statValue, { color: quickStats.totalProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
              {formatCurrency(quickStats.totalProfit)}
            </Text>
            <Text style={styles.statLabel}>All Time</Text>
          </View>
          
          <View style={styles.headerStat}>
            <Text style={styles.statValue}>{quickStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Performance Summary */}
        <PerformanceSummary
          summary={dashboardData.performanceSummary}
          onViewDetails={handleViewPerformanceDetails}
        />

        {/* Quick Actions */}
        <QuickActions actions={mockQuickActions} />

        {/* Active Sessions */}
        <ActiveSessions
          sessions={dashboardData.activeSessions}
          onSessionPress={handleSessionPress}
          onEndSession={handleEndSession}
        />

        {/* Pending Group Sessions */}
        <PendingGroupSessions
          sessions={dashboardData.pendingGroupSessions}
          onSessionPress={handleGroupSessionPress}
          onJoinSession={handleJoinGroupSession}
        />

        {/* Friend Activity */}
        <ActivityFeed
          activities={dashboardData.friendActivity}
          onActivityPress={handleActivityPress}
        />
        
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 30,
  },
  headerStat: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  bottomPadding: {
    height: 30,
  },
});