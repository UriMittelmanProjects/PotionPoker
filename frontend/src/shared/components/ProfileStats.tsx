import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileStats as ProfileStatsType } from '../types';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

/**
 * ProfileStats Component
 * 
 * Displays poker statistics in a grid layout similar to Instagram profile stats.
 * Shows key metrics like total sessions, winnings, hourly rate, and win rate.
 * Used in the Profile tab to give users a quick overview of their performance.
 * 
 * @param stats - ProfileStats object containing all poker performance metrics
 */
export default function ProfileStats({ stats }: ProfileStatsProps) {
  const formatCurrency = (amount: number): string => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000) {
      return `${amount >= 0 ? '+' : '-'}$${(absAmount / 1000).toFixed(1)}k`;
    }
    return `${amount >= 0 ? '+' : ''}$${amount.toFixed(0)}`;
  };

  const formatHours = (hours: number): string => {
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k`;
    }
    return hours.toFixed(0);
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const formatHourlyRate = (rate: number): string => {
    return `$${rate.toFixed(0)}/hr`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[
            styles.statNumber, 
            { color: stats.totalWinnings >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatCurrency(stats.totalWinnings)}
          </Text>
          <Text style={styles.statLabel}>Total P&L</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formatHours(stats.totalHours)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={[
            styles.statNumber,
            { color: stats.hourlyRate >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {formatHourlyRate(stats.hourlyRate)}
          </Text>
          <Text style={styles.statLabel}>Hourly</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{formatPercentage(stats.winRate)}</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{stats.avgSessionLength.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Avg Length</Text>
        </View>
      </View>

      {(stats.biggestWin > 0 || stats.biggestLoss < 0) && (
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
              {formatCurrency(stats.biggestWin)}
            </Text>
            <Text style={styles.statLabel}>Biggest Win</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>
              {formatCurrency(stats.biggestLoss)}
            </Text>
            <Text style={styles.statLabel}>Biggest Loss</Text>
          </View>
          <View style={styles.stat} />
        </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});