import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { HandCombination } from '../types';

interface RangeGridProps {
  selectedHands: Set<string>;
  selectedColor: string;
  onHandToggle: (hand: string) => void;
  onHandLongPress?: (hand: string) => void;
}

/**
 * RangeGrid Component
 * 
 * Standard 13x13 poker hand matrix with AA at top-left and 23o at bottom-right.
 * Displays suited hands above diagonal, pairs on diagonal, offsuit below diagonal.
 * Supports hand selection with customizable colors and long press for equalize function.
 * 
 * @param selectedHands - Set of currently selected hands
 * @param selectedColor - Color to highlight selected hands
 * @param onHandToggle - Callback when hand is selected/deselected
 * @param onHandLongPress - Callback for long press (equalize range)
 */
export default function RangeGrid({ 
  selectedHands, 
  selectedColor, 
  onHandToggle,
  onHandLongPress 
}: RangeGridProps) {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const screenWidth = Dimensions.get('window').width;
  const gridPadding = 20;
  const cellSize = (screenWidth - gridPadding * 2) / 13;

  const generateHandCombinations = (): HandCombination[][] => {
    const grid: HandCombination[][] = [];
    
    for (let row = 0; row < 13; row++) {
      const rowHands: HandCombination[] = [];
      
      for (let col = 0; col < 13; col++) {
        const rank1 = ranks[row];
        const rank2 = ranks[col];
        
        let hand: string;
        let suited: boolean;
        
        if (row === col) {
          hand = `${rank1}${rank2}`;
          suited = false;
        } else if (row < col) {
          hand = `${rank1}${rank2}s`;
          suited = true;
        } else {
          hand = `${rank1}${rank2}o`;
          suited = false;
        }
        
        rowHands.push({
          hand,
          suited,
          rank1,
          rank2,
          position: { row, col }
        });
      }
      
      grid.push(rowHands);
    }
    
    return grid;
  };

  const handCombinations = generateHandCombinations();

  const getHandDisplayText = (combination: HandCombination): string => {
    const { rank1, rank2, suited } = combination;
    
    if (rank1 === rank2) {
      return `${rank1}${rank2}`;
    }
    
    return suited ? `${rank1}${rank2}s` : `${rank1}${rank2}o`;
  };

  const getCellStyle = (combination: HandCombination) => {
    const isSelected = selectedHands.has(combination.hand);
    const isPair = combination.rank1 === combination.rank2;
    const isSuited = combination.suited;
    
    let backgroundColor = '#f8f9fa';
    
    if (isSelected) {
      backgroundColor = selectedColor;
    } else if (isPair) {
      backgroundColor = '#e9ecef';
    } else if (isSuited) {
      backgroundColor = '#e3f2fd';
    }
    
    return [
      styles.cell,
      {
        backgroundColor,
        width: cellSize,
        height: cellSize,
      }
    ];
  };

  const getTextStyle = (combination: HandCombination) => {
    const isSelected = selectedHands.has(combination.hand);
    
    return [
      styles.cellText,
      {
        color: isSelected ? '#fff' : '#333',
        fontWeight: isSelected ? ('bold' as const) : ('500' as const),
        fontSize: cellSize * 0.2,
      }
    ];
  };

  const handleCellPress = (combination: HandCombination) => {
    onHandToggle(combination.hand);
  };

  const handleCellLongPress = (combination: HandCombination) => {
    onHandLongPress?.(combination.hand);
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {handCombinations.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((combination, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={getCellStyle(combination)}
                onPress={() => handleCellPress(combination)}
                onLongPress={() => handleCellLongPress(combination)}
                activeOpacity={0.7}
              >
                <Text style={getTextStyle(combination)}>
                  {getHandDisplayText(combination)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#e9ecef' }]} />
          <Text style={styles.legendText}>Pairs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#e3f2fd' }]} />
          <Text style={styles.legendText}>Suited</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#f8f9fa' }]} />
          <Text style={styles.legendText}>Offsuit</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  grid: {
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSquare: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});