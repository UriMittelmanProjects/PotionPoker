import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions 
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSessionStore } from '../shared/stores/sessionStore';
import { PokerSession } from '../shared/types';
import CreateSessionScreen from './CreateSessionScreen';
import SessionHistoryScreen from './SessionHistoryScreen';
import ActiveSessionScreen from './ActiveSessionScreen';
import SessionDetailScreen from './SessionDetailScreen';

type ScreenMode = 'main' | 'create' | 'active' | 'detail';

export default function SessionsScreen() {
  const { activeSession, fetchActiveSession, sessions, fetchSessions } = useSessionStore();
  const [screenMode, setScreenMode] = useState<ScreenMode>('main');
  const [selectedSession, setSelectedSession] = useState<PokerSession | null>(null);

  useEffect(() => {
    fetchActiveSession();
    fetchSessions();
  }, []);

  const handleCreateSession = () => {
    setScreenMode('create');
  };

  const handleSessionCreated = () => {
    fetchActiveSession();
    fetchSessions();
  };

  const handleViewActiveSession = () => {
    if (activeSession) {
      setSelectedSession(activeSession);
      setScreenMode('active');
    }
  };

  const handleSessionSelect = (session: PokerSession) => {
    setSelectedSession(session);
    if (session.isActive) {
      setScreenMode('active');
    } else {
      setScreenMode('detail');
    }
  };

  const handleSessionEnded = () => {
    fetchActiveSession();
    fetchSessions();
  };

  const handleSessionUpdated = () => {
    fetchSessions();
  };

  const handleSessionDeleted = () => {
    fetchSessions();
  };

  const handleBackToMain = () => {
    setScreenMode('main');
    setSelectedSession(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalProfit = sessions.reduce((sum, session) => sum + (session.profit || 0), 0);
  const completedSessions = sessions.filter(s => s.isComplete).length;

  const getChartData = () => {
    const completedSessionsData = sessions
      .filter(s => s.isComplete)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(-10); // Last 10 sessions

    if (completedSessionsData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    let runningTotal = 0;
    const labels = completedSessionsData.map((_, index) => `S${index + 1}`);
    const data = completedSessionsData.map(session => {
      runningTotal += session.profit || 0;
      return runningTotal;
    });

    return {
      labels,
      datasets: [{ data }]
    };
  };

  // Render different screens based on mode
  if (screenMode === 'create') {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <CreateSessionScreen 
            onClose={handleBackToMain}
            onSessionCreated={handleSessionCreated}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (screenMode === 'active' && selectedSession) {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ActiveSessionScreen
            session={selectedSession}
            onClose={handleBackToMain}
            onSessionEnded={handleSessionEnded}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (screenMode === 'detail' && selectedSession) {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <SessionDetailScreen
            session={selectedSession}
            onClose={handleBackToMain}
            onSessionUpdated={handleSessionUpdated}
            onSessionDeleted={handleSessionDeleted}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  // Main sessions screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sessions</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateSession}
        >
          <Text style={styles.createButtonText}>+ Start Session</Text>
        </TouchableOpacity>
      </View>

      {/* Performance Chart */}
      {completedSessions > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Performance Trend</Text>
          <LineChart
            data={getChartData()}
            width={Dimensions.get('window').width - 32}
            height={180}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              style: {
                borderRadius: 12,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#007bff'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: totalProfit >= 0 ? '#28a745' : '#dc3545' }
          ]}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalProfit))}
          </Text>
          <Text style={styles.statLabel}>Total P&L</Text>
        </View>
      </View>

      {/* Active Session Card */}
      {activeSession && (
        <TouchableOpacity 
          style={styles.activeSessionCard}
          onPress={handleViewActiveSession}
        >
          <View style={styles.activeSessionHeader}>
            <Text style={styles.activeSessionTitle}>Active Session</Text>
            <View style={styles.activeIndicator}>
              <Text style={styles.activeIndicatorText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.activeSessionVenue}>
            {activeSession.venue || 'Unnamed Session'}
          </Text>
          <Text style={styles.activeSessionDetails}>
            Buy-in: {formatCurrency(activeSession.totalBuyIn)} • 
            Started: {new Date(activeSession.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Session History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Session History</Text>
        <SessionHistoryScreen onSessionSelect={handleSessionSelect} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSessionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeSessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  activeIndicator: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  activeSessionVenue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  activeSessionDetails: {
    fontSize: 12,
    color: '#666',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
});