import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { QuickAction } from '../types';

interface QuickActionsProps {
  actions: QuickAction[];
  showHeader?: boolean;
}

/**
 * QuickActions Component
 * 
 * Grid of quick action buttons for common tasks like starting sessions,
 * viewing statistics, accessing groups, and managing ranges. Provides
 * fast access to key app functionality from the home dashboard.
 * 
 * @param actions - Array of quick action configurations
 * @param showHeader - Whether to show the section header
 */
export default function QuickActions({ 
  actions, 
  showHeader = true 
}: QuickActionsProps) {
  const handleActionPress = (action: QuickAction) => {
    if (action.disabled) {
      Alert.alert('Feature Unavailable', 'This feature is coming soon!');
      return;
    }
    
    try {
      action.action();
    } catch (error) {
      console.error('Quick action error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const renderActionButton = (action: QuickAction, index: number) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionButton,
        { backgroundColor: action.disabled ? '#f0f0f0' : action.color },
        index % 2 === 0 ? styles.leftButton : styles.rightButton
      ]}
      onPress={() => handleActionPress(action)}
      activeOpacity={action.disabled ? 1 : 0.7}
    >
      <Text style={[
        styles.actionIcon,
        { color: action.disabled ? '#999' : '#fff' }
      ]}>
        {action.icon}
      </Text>
      <Text style={[
        styles.actionTitle,
        { color: action.disabled ? '#999' : '#fff' }
      ]}>
        {action.title}
      </Text>
    </TouchableOpacity>
  );

  // Split actions into pairs for grid layout
  const actionPairs = [];
  for (let i = 0; i < actions.length; i += 2) {
    actionPairs.push(actions.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      )}
      
      <View style={styles.actionsGrid}>
        {actionPairs.map((pair, pairIndex) => (
          <View key={pairIndex} style={styles.actionRow}>
            {pair.map((action, index) => renderActionButton(action, index))}
          </View>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  actionsGrid: {
    paddingHorizontal: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1.6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  leftButton: {
    marginRight: 6,
  },
  rightButton: {
    marginLeft: 6,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});