import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { PokerSession } from '../types';

interface ChartPoint {
  x: number;
  y: number;
  date: Date;
  value: number;
}

interface SwipeableChartsProps {
  sessions: PokerSession[];
}

type ChartType = 'earnings' | 'hourly' | 'cashouts';
type TimePeriod = '1W' | '1M' | '3M' | '1Y' | 'ALL';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;
const chartHeight = 200;

export default function SwipeableCharts({ sessions }: SwipeableChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('earnings');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M');
  const scrollViewRef = useRef<ScrollView>(null);

  const chartTitles: Record<ChartType, string> = {
    earnings: 'Net Earnings',
    hourly: 'Earnings per Hour',
    cashouts: 'Cashouts'
  };

  const timePeriods: TimePeriod[] = ['1W', '1M', '3M', '1Y', 'ALL'];

  const filterSessionsByPeriod = (sessions: PokerSession[], period: TimePeriod): PokerSession[] => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
        return sessions.filter(s => s.isComplete);
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return sessions.filter(s => s.isComplete && new Date(s.startTime) >= startDate);
  };

  const generateChartData = (chartType: ChartType): ChartPoint[] => {
    const filteredSessions = filterSessionsByPeriod(sessions, timePeriod);
    const sortedSessions = filteredSessions.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    let cumulativeEarnings = 0;
    const points: ChartPoint[] = [];

    sortedSessions.forEach((session, index) => {
      let value: number;
      
      switch (chartType) {
        case 'earnings':
          cumulativeEarnings += session.profit || 0;
          value = cumulativeEarnings;
          break;
        case 'hourly':
          const hours = (session.duration || 0) / 60;
          value = hours > 0 ? (session.profit || 0) / hours : 0;
          break;
        case 'cashouts':
          value = session.cashOut || 0;
          break;
        default:
          value = 0;
      }

      const x = (index / Math.max(sortedSessions.length - 1, 1)) * chartWidth;
      points.push({
        x,
        y: 0, // Will be calculated after we know min/max
        date: new Date(session.startTime),
        value
      });
    });

    if (points.length === 0) return [];

    // Calculate Y positions
    const values = points.map(p => p.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    return points.map(point => ({
      ...point,
      y: chartHeight - 40 - ((point.value - minValue) / range) * (chartHeight - 80)
    }));
  };

  const getCurrentValue = (): number => {
    const data = generateChartData(activeChart);
    return data.length > 0 ? data[data.length - 1].value : 0;
  };

  const formatValue = (value: number, chartType: ChartType): string => {
    switch (chartType) {
      case 'earnings':
      case 'cashouts':
        return value >= 0 ? `+$${value.toFixed(0)}` : `-$${Math.abs(value).toFixed(0)}`;
      case 'hourly':
        return `$${value.toFixed(0)}/hr`;
      default:
        return value.toString();
    }
  };

  const renderChart = (chartType: ChartType) => {
    const data = generateChartData(chartType);
    
    if (data.length < 2) {
      return (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Not enough data</Text>
        </View>
      );
    }

    const currentValue = data[data.length - 1].value;
    const isPositive = currentValue >= 0;

    // Create polyline points string
    const points = data.map(point => `${point.x},${point.y}`).join(' ');

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartTitle}>{chartTitles[chartType]}</Text>
            <Text style={[
              styles.chartValue,
              { color: chartType === 'hourly' || isPositive ? '#00C896' : '#FF5050' }
            ]}>
              {formatValue(currentValue, chartType)}
            </Text>
          </View>
        </View>

        <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
          {/* Grid lines */}
          <Line
            x1="0"
            y1={chartHeight / 2}
            x2={chartWidth}
            y2={chartHeight / 2}
            stroke="#E5E5E5"
            strokeWidth="1"
            opacity="0.5"
          />
          
          {/* Chart line */}
          <Polyline
            points={points}
            fill="none"
            stroke={chartType === 'hourly' || isPositive ? '#00C896' : '#FF5050'}
            strokeWidth="2"
          />
          
          {/* Last point indicator */}
          {data.length > 0 && (
            <Circle
              cx={data[data.length - 1].x}
              cy={data[data.length - 1].y}
              r="4"
              fill={chartType === 'hourly' || isPositive ? '#00C896' : '#FF5050'}
            />
          )}
        </Svg>
      </View>
    );
  };

  const charts: ChartType[] = ['earnings', 'hourly', 'cashouts'];

  return (
    <View style={styles.container}>
      {/* Time period selector */}
      <View style={styles.periodSelector}>
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              timePeriod === period && styles.activePeriodButton
            ]}
            onPress={() => setTimePeriod(period)}
          >
            <Text style={[
              styles.periodText,
              timePeriod === period && styles.activePeriodText
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveChart(charts[pageIndex]);
        }}
        style={styles.chartScrollView}
      >
        {charts.map((chartType) => (
          <View key={chartType} style={[styles.chartPage, { width: screenWidth }]}>
            {renderChart(chartType)}
          </View>
        ))}
      </ScrollView>

      {/* Chart indicators */}
      <View style={styles.indicators}>
        {charts.map((chartType, index) => (
          <TouchableOpacity
            key={chartType}
            style={[
              styles.indicator,
              activeChart === chartType && styles.activeIndicator
            ]}
            onPress={() => {
              setActiveChart(chartType);
              scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
  },
  activePeriodButton: {
    backgroundColor: '#F0F0F0',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activePeriodText: {
    color: '#000000',
  },
  chartScrollView: {
    flexGrow: 0,
  },
  chartPage: {
    paddingHorizontal: 20,
  },
  chartContainer: {
    height: chartHeight + 60,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  chart: {
    alignSelf: 'center',
  },
  emptyChart: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 20,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5E7',
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
});