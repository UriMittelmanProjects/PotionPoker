import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import PlayerSelector from '../shared/components/PlayerSelector';
import RoundSelector from '../shared/components/RoundSelector';
import RangeGrid from '../shared/components/RangeGrid';
import { 
  Player, 
  PlayerRange, 
  RangeRound,
} from '../shared/types';
import { mockPlayers, mockPlayerRanges } from '../shared/data/mockData';
import { getEqualOrBetterHands, calculateRangePercentage } from '../shared/utils/rangeUtils';

/**
 * RangeCreatorScreen Component
 * 
 * Main interface for creating and managing opponent player ranges.
 * Features iPhone contacts-style player list, 13x13 hand grid,
 * equalize range functionality, and round/label management.
 */
export default function RangeCreatorScreen() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const [selectedRound, setSelectedRound] = useState<RangeRound>(RangeRound.PREFLOP);
  const [currentLabel, setCurrentLabel] = useState<string>('');
  const [selectedHands, setSelectedHands] = useState<Set<string>>(new Set());
  const [selectedColor, setSelectedColor] = useState<string>('#4CAF50');
  const [showPlayerList, setShowPlayerList] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const colors = ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#795548'];

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerRange();
    }
  }, [selectedPlayer, selectedRound, currentLabel]);

  const loadPlayerRange = () => {
    if (!selectedPlayer) return;
    
    const existingRange = selectedPlayer.ranges.find(
      r => r.round === selectedRound && r.label === currentLabel
    );
    
    if (existingRange) {
      setSelectedHands(new Set(existingRange.hands));
      setSelectedColor(existingRange.color);
    } else {
      setSelectedHands(new Set());
    }
    setHasUnsavedChanges(false);
  };

  const handlePlayerSelect = (player: Player) => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Save before switching players?',
        [
          { text: 'Discard', onPress: () => switchPlayer(player) },
          { text: 'Save', onPress: () => handleSaveRange().then(() => switchPlayer(player)) },
        ]
      );
    } else {
      switchPlayer(player);
    }
  };

  const switchPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerList(false);
    setCurrentLabel('');
  };

  const handleCreatePlayer = (name: string) => {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name,
      ranges: [],
      lastUsed: new Date(),
    };
    
    setPlayers(prev => [newPlayer, ...prev]);
    setSelectedPlayer(newPlayer);
    setShowPlayerList(false);
  };

  const handleHandToggle = (hand: string) => {
    setSelectedHands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hand)) {
        newSet.delete(hand);
      } else {
        newSet.add(hand);
      }
      setHasUnsavedChanges(true);
      return newSet;
    });
  };

  const handleHandLongPress = (hand: string) => {
    Alert.alert(
      'Equalize Range',
      `Select all hands equal or better than ${hand}?`,
      [
        { text: 'Cancel' },
        { 
          text: 'Equalize', 
          onPress: () => {
            const equalOrBetter = getEqualOrBetterHands(hand);
            setSelectedHands(new Set(equalOrBetter));
            setHasUnsavedChanges(true);
          }
        }
      ]
    );
  };

  const handleSaveRange = async (): Promise<void> => {
    if (!selectedPlayer) return;
    
    const rangeData: Omit<PlayerRange, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      playerName: selectedPlayer.name,
      round: selectedRound,
      label: currentLabel,
      hands: Array.from(selectedHands),
      color: selectedColor,
    };
    
    // In a real app, this would save to backend
    console.log('Saving range:', rangeData);
    setHasUnsavedChanges(false);
    
    Alert.alert('Success', 'Range saved successfully!');
  };

  const handleClearRange = () => {
    Alert.alert(
      'Clear Range',
      'Remove all selected hands?',
      [
        { text: 'Cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            setSelectedHands(new Set());
            setHasUnsavedChanges(true);
          }
        }
      ]
    );
  };

  const rangePercentage = calculateRangePercentage(selectedHands);

  if (showPlayerList || !selectedPlayer) {
    return (
      <View style={styles.container}>
        <PlayerSelector
          players={players}
          selectedPlayer={selectedPlayer}
          onPlayerSelect={handlePlayerSelect}
          onCreatePlayer={handleCreatePlayer}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowPlayerList(true)}
        >
          <Text style={styles.backButtonText}>← Players</Text>
        </TouchableOpacity>
        
        <Text style={styles.playerName}>{selectedPlayer.name}</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, hasUnsavedChanges && styles.saveButtonActive]}
          onPress={handleSaveRange}
          disabled={!hasUnsavedChanges}
        >
          <Text style={[styles.saveButtonText, hasUnsavedChanges && styles.saveButtonTextActive]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <RoundSelector
        selectedRound={selectedRound}
        label={currentLabel}
        onRoundChange={setSelectedRound}
        onLabelChange={setCurrentLabel}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.rangeInfo}>
          <Text style={styles.rangeStats}>
            {selectedHands.size} hands ({rangePercentage.toFixed(1)}%)
          </Text>
          
          <View style={styles.colorSelector}>
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Text style={styles.colorCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <RangeGrid
          selectedHands={selectedHands}
          selectedColor={selectedColor}
          onHandToggle={handleHandToggle}
          onHandLongPress={handleHandLongPress}
        />
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearRange}>
            <Text style={styles.clearButtonText}>Clear Range</Text>
          </TouchableOpacity>
        </View>
        
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  saveButtonActive: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  saveButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  rangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rangeStats: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});