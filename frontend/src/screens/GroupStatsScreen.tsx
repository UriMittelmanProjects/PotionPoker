import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Group, GroupStats, PlayerStats } from '../shared/types';
import { useGroupStore } from '../shared/stores/groupStore';

interface GroupStatsScreenProps {
  group: Group;
  onClose: () => void;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

function StatsCard({ title, value, subtitle, color = '#1a1a1a' }: StatsCardProps) {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>{title}</Text>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface PlayerStatsRowProps {
  playerStats: PlayerStats;
  rank: number;
}

function PlayerStatsRow({ playerStats, rank }: PlayerStatsRowProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const profitColor = playerStats.totalProfit >= 0 ? '#28a745' : '#dc3545';

  return (
    <View style={styles.playerRow}>
      <View style={styles.playerRank}>
        <Text style={styles.rankNumber}>#{rank}</Text>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {playerStats.user.displayName || `${playerStats.user.firstName} ${playerStats.user.lastName}`}
        </Text>
        <Text style={styles.playerUsername}>@{playerStats.user.username}</Text>
      </View>
      
      <View style={styles.playerStats}>
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Sessions</Text>
          <Text style={styles.statValue}>{playerStats.totalSessions}</Text>
        </View>
        
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Profit</Text>
          <Text style={[styles.statValue, { color: profitColor }]}>
            {playerStats.totalProfit >= 0 ? '+' : ''}{formatCurrency(Math.abs(playerStats.totalProfit))}
          </Text>
        </View>
        
        <View style={styles.statColumn}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>{Math.round(playerStats.winRate * 100)}%</Text>
        </View>
      </View>
    </View>
  );
}

export default function GroupStatsScreen({ group, onClose }: GroupStatsScreenProps) {
  const {
    fetchGroupStats,
    fetchPlayerStats,
    groupStats,
    playerStats,
    isLoading,
    error
  } = useGroupStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'players'>('overview');

  useEffect(() => {
    fetchGroupStats(group.id);
    fetchPlayerStats(group.id);
  }, [group.id]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1): string => {
    return num.toFixed(decimals);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'players', label: 'Player Stats' },
  ];

  // Sort players by total profit descending
  const sortedPlayerStats = [...playerStats].sort((a, b) => b.totalProfit - a.totalProfit);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{group.name} Stats</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id as 'overview' | 'players')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'overview' && groupStats && (
              <View>
                {/* Group Overview Stats */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Group Performance</Text>
                  <View style={styles.statsGrid}>
                    <StatsCard
                      title="Total Sessions"
                      value={groupStats.totalSessions.toString()}
                      subtitle="All time"
                    />
                    <StatsCard
                      title="Total Volume"
                      value={formatCurrency(groupStats.totalVolume)}
                      subtitle="Money played"
                    />
                    <StatsCard
                      title="Avg Session"
                      value={formatNumber(groupStats.avgSessionLength)}
                      subtitle="Hours per session"
                    />
                    <StatsCard
                      title="Members"
                      value={group.memberCount.toString()}
                      subtitle="Active players"
                    />
                  </View>
                </View>

                {/* Top Performers */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Top Performers</Text>
                  
                  <View style={styles.performerCard}>
                    <Text style={styles.performerTitle}>🏆 Most Active Player</Text>
                    <Text style={styles.performerName}>
                      {groupStats.mostActivePlayer.user.displayName || 
                       `${groupStats.mostActivePlayer.user.firstName} ${groupStats.mostActivePlayer.user.lastName}`}
                    </Text>
                    <Text style={styles.performerStat}>
                      {groupStats.mostActivePlayer.sessionCount} sessions played
                    </Text>
                  </View>

                  <View style={styles.performerCard}>
                    <Text style={styles.performerTitle}>💰 Biggest Winner</Text>
                    <Text style={styles.performerName}>
                      {groupStats.biggestWinner.user.displayName || 
                       `${groupStats.biggestWinner.user.firstName} ${groupStats.biggestWinner.user.lastName}`}
                    </Text>
                    <Text style={[styles.performerStat, { color: '#28a745' }]}>
                      +{formatCurrency(groupStats.biggestWinner.totalProfit)} total profit
                    </Text>
                  </View>
                </View>

                {/* Group Guidelines */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About Group Stats</Text>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                      • Stats include all completed group sessions
                    </Text>
                    <Text style={styles.infoText}>
                      • Player rankings based on total profit
                    </Text>
                    <Text style={styles.infoText}>
                      • Win rate calculated from profitable sessions
                    </Text>
                    <Text style={styles.infoText}>
                      • Volume includes all buy-ins across sessions
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'players' && (
              <View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Player Leaderboard</Text>
                  <Text style={styles.sectionSubtitle}>
                    Ranked by total profit • {playerStats.length} players
                  </Text>

                  {sortedPlayerStats.length === 0 ? (
                    <Text style={styles.emptyText}>No player data available</Text>
                  ) : (
                    <View style={styles.leaderboard}>
                      {sortedPlayerStats.map((player, index) => (
                        <PlayerStatsRow
                          key={player.userId}
                          playerStats={player}
                          rank={index + 1}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {/* Detailed Player Stats */}
                {sortedPlayerStats.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detailed Statistics</Text>
                    
                    {sortedPlayerStats.map((player) => (
                      <View key={player.userId} style={styles.detailedPlayerCard}>
                        <Text style={styles.detailedPlayerName}>
                          {player.user.displayName || `${player.user.firstName} ${player.user.lastName}`}
                        </Text>
                        
                        <View style={styles.detailedStatsGrid}>
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>Total Buy-in</Text>
                            <Text style={styles.detailedStatValue}>{formatCurrency(player.totalBuyIn)}</Text>
                          </View>
                          
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>Total Cash-out</Text>
                            <Text style={styles.detailedStatValue}>{formatCurrency(player.totalCashOut)}</Text>
                          </View>
                          
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>Avg Session</Text>
                            <Text style={styles.detailedStatValue}>{formatNumber(player.avgSessionLength)}h</Text>
                          </View>
                          
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>Biggest Win</Text>
                            <Text style={[styles.detailedStatValue, { color: '#28a745' }]}>
                              +{formatCurrency(player.biggestWin)}
                            </Text>
                          </View>
                          
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>Biggest Loss</Text>
                            <Text style={[styles.detailedStatValue, { color: '#dc3545' }]}>
                              {formatCurrency(player.biggestLoss)}
                            </Text>
                          </View>
                          
                          <View style={styles.detailedStatItem}>
                            <Text style={styles.detailedStatLabel}>ROI</Text>
                            <Text style={[
                              styles.detailedStatValue,
                              { color: player.totalProfit >= 0 ? '#28a745' : '#dc3545' }
                            ]}>
                              {((player.totalProfit / player.totalBuyIn) * 100).toFixed(1)}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007bff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  performerCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  performerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  performerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  performerStat: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#e7f3ff',
    borderColor: '#b8daff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#004085',
    marginBottom: 4,
  },
  leaderboard: {
    backgroundColor: '#fff',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  playerRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  playerUsername: {
    fontSize: 14,
    color: '#666',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statColumn: {
    alignItems: 'center',
    minWidth: 60,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 32,
  },
  detailedPlayerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  detailedPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailedStatItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  detailedStatLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailedStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
});