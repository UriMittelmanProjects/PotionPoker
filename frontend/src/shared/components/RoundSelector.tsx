import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { RangeRound } from '../types';

interface RoundSelectorProps {
  selectedRound: RangeRound;
  label?: string;
  onRoundChange: (round: RangeRound) => void;
  onLabelChange: (label: string) => void;
}

/**
 * RoundSelector Component
 * 
 * Dropdown selector for poker rounds (preflop, flop, turn, river) with
 * custom labeling functionality. Allows users to categorize their ranges
 * by betting round and add descriptive labels.
 * 
 * @param selectedRound - Currently selected betting round
 * @param label - Optional custom label for the range
 * @param onRoundChange - Callback when round selection changes
 * @param onLabelChange - Callback when label changes
 */
export default function RoundSelector({ 
  selectedRound, 
  label = '',
  onRoundChange,
  onLabelChange 
}: RoundSelectorProps) {
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);

  const rounds: { value: RangeRound; label: string; description: string }[] = [
    { 
      value: RangeRound.PREFLOP, 
      label: 'Preflop', 
      description: 'Starting hand ranges before the flop' 
    },
    { 
      value: RangeRound.FLOP, 
      label: 'Flop', 
      description: 'Ranges after seeing the flop' 
    },
    { 
      value: RangeRound.TURN, 
      label: 'Turn', 
      description: 'Ranges after the turn card' 
    },
    { 
      value: RangeRound.RIVER, 
      label: 'River', 
      description: 'Ranges after the river card' 
    },
  ];

  const getRoundLabel = (round: RangeRound): string => {
    const roundData = rounds.find(r => r.value === round);
    return roundData?.label || 'Preflop';
  };

  const handleRoundSelect = (round: RangeRound) => {
    onRoundChange(round);
    setShowRoundModal(false);
  };

  const handleLabelSave = () => {
    onLabelChange(tempLabel);
    setShowLabelModal(false);
  };

  const handleLabelCancel = () => {
    setTempLabel(label);
    setShowLabelModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.roundSelector}
          onPress={() => setShowRoundModal(true)}
        >
          <Text style={styles.roundLabel}>Round: {getRoundLabel(selectedRound)}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.labelSelector}
          onPress={() => {
            setTempLabel(label);
            setShowLabelModal(true);
          }}
        >
          <Text style={styles.labelText}>
            {label || 'Add Label'}
          </Text>
          <Text style={styles.dropdownIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Round Selection Modal */}
      <Modal
        visible={showRoundModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Round</Text>
            
            {rounds.map((round) => (
              <TouchableOpacity
                key={round.value}
                style={[
                  styles.roundOption,
                  selectedRound === round.value && styles.selectedRoundOption
                ]}
                onPress={() => handleRoundSelect(round.value)}
              >
                <Text style={[
                  styles.roundOptionLabel,
                  selectedRound === round.value && styles.selectedRoundOptionLabel
                ]}>
                  {round.label}
                </Text>
                <Text style={styles.roundOptionDescription}>
                  {round.description}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowRoundModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Label Input Modal */}
      <Modal
        visible={showLabelModal}
        transparent
        animationType="fade"
        onRequestClose={handleLabelCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Range Label</Text>
            
            <TextInput
              style={styles.labelInput}
              placeholder="Enter custom label (optional)"
              value={tempLabel}
              onChangeText={setTempLabel}
              autoFocus
              placeholderTextColor="#999"
              maxLength={50}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleLabelCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleLabelSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  roundSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roundLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  labelSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  labelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  roundOption: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedRoundOption: {
    backgroundColor: '#e3f2fd',
  },
  roundOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedRoundOptionLabel: {
    color: '#1976d2',
  },
  roundOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  labelInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});