import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PerformanceSummary as PerformanceSummaryType, ChartDataPoint } from '../types';

interface PerformanceSummaryProps {
  summary: PerformanceSummaryType;
  onViewDetails?: () => void;
  showHeader?: boolean;
}

/**
 * PerformanceSummary Component
 * 
 * Displays poker performance charts and key metrics in a finance-app style.
 * Shows profit/loss trends, session counts, and hourly rates with
 * interactive time period selection (7d, 30d, monthly).
 * 
 * @param summary - Performance data with charts and time periods
 * @param onViewDetails - Callback to view detailed statistics
 * @param showHeader - Whether to show the section header
 */
export default function PerformanceSummary({ 
  summary, 
  onViewDetails,
  showHeader = true 
}: PerformanceSummaryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'month'>('7d');

  const formatCurrency = (amount: number): string => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${amount.toFixed(0)}`;
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case '7d':
        return summary.last7Days;
      case '30d':
        return summary.last30Days;
      case 'month':
        return summary.currentMonth;
      default:
        return summary.last7Days;
    }
  };

  const currentData = getCurrentData();
  const hourlyRate = currentData.hours > 0 ? currentData.profit / currentData.hours : 0;

  // Mock chart component - in real app, use a charting library
  const renderChart = () => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 70;
    const chartHeight = 120;
    
    return (
      <View style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>📈 Profit Chart</Text>
          <Text style={styles.chartSubtext}>Last {selectedPeriod}</Text>
          
          {/* Mock chart bars */}
          <View style={styles.mockChart}>
            {summary.chartData.slice(0, 7).map((point, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: Math.max(Math.abs(point.profit) / 10, 5),
                    backgroundColor: point.profit >= 0 ? '#4CAF50' : '#F44336',
                    marginBottom: point.profit < 0 ? Math.abs(point.profit) / 10 : 0,
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetailsText}>Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time period selector */}
      <View style={styles.periodSelector}>
        {[
          { key: '7d', label: '7D' },
          { key: '30d', label: '30D' },
          { key: 'month', label: 'Month' }
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriodButton
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period.key && styles.selectedPeriodText
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main profit display */}
      <View style={styles.mainStats}>
        <Text style={[
          styles.mainProfit,
          { color: currentData.profit >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {formatCurrency(currentData.profit)}
        </Text>
        <Text style={styles.periodLabel}>
          Last {selectedPeriod === 'month' ? 'Month' : selectedPeriod}
        </Text>
      </View>

      {/* Chart */}
      {renderChart()}

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentData.sessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentData.hours.toFixed(0)}h</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[
            styles.statValue,
            { color: hourlyRate >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            ${hourlyRate.toFixed(0)}/hr
          </Text>
          <Text style={styles.statLabel}>Hourly</Text>
        </View>
      </View>
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
  viewDetailsText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedPeriodButton: {
    backgroundColor: '#2196F3',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  mainStats: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainProfit: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  chartPlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chartText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  mockChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 4,
  },
  chartBar: {
    width: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});