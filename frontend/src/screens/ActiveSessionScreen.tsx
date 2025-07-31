import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { PokerSession, EndSessionRequest } from '../shared/types';
import { useSessionStore } from '../shared/stores/sessionStore';
import { formatCurrency, formatDuration } from '../shared/utils/dateUtils';

interface ActiveSessionScreenProps {
  session: PokerSession;
  onClose: () => void;
  onSessionEnded?: () => void;
}


export default function ActiveSessionScreen({ 
  session, 
  onClose, 
  onSessionEnded 
}: ActiveSessionScreenProps) {
  const { endSession, updateSession, addBuyIn, isUpdating, error } = useSessionStore();
  
  const [endData, setEndData] = useState<EndSessionRequest>({
    cashOut: 0,
    handsPlayed: session.handsPlayed,
    notes: session.notes || '',
  });

  const [additionalBuyIn, setAdditionalBuyIn] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for live duration display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const currentProfit = endData.cashOut - session.totalBuyIn;
  const currentDuration = formatDuration(session.startTime, currentTime);

  const handleAddBuyIn = async () => {
    const amount = parseFloat(additionalBuyIn);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid buy-in amount');
      return;
    }

    try {
      await addBuyIn(session.id, { amount });
      setAdditionalBuyIn('');
      Alert.alert('Success', 'Buy-in added successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to add buy-in. Please try again.');
    }
  };

  const handleEndSession = async () => {
    if (endData.cashOut <= 0) {
      Alert.alert('Invalid Cash-out', 'Please enter your cash-out amount');
      return;
    }

    const finalEndData = {
      ...endData,
    };

    Alert.alert(
      'End Session',
      `Are you sure you want to end this session?\n\nProfit/Loss: ${formatCurrency(currentProfit)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession(session.id, finalEndData);
              onSessionEnded?.();
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Failed to end session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateSession = async () => {
    try {
      await updateSession(session.id, {
        handsPlayed: endData.handsPlayed,
        notes: endData.notes,
      });
      Alert.alert('Success', 'Session updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update session. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Session</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.sessionInfoCard}>
          <Text style={styles.venueName}>{session.venue || 'Unnamed Session'}</Text>
          {session.address && (
            <Text style={styles.address}>{session.address}</Text>
          )}
          <View style={styles.sessionMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{currentDuration}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Current Profit/Loss</Text>
              <Text style={[
                styles.metricValue,
                { color: currentProfit >= 0 ? '#28a745' : '#dc3545' }
              ]}>
                {currentProfit >= 0 ? '+' : ''}{formatCurrency(Math.abs(currentProfit))}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buy-ins</Text>
          <View style={styles.buyInContainer}>
            <Text style={styles.totalBuyIn}>
              Total: {formatCurrency(session.totalBuyIn)}
            </Text>
            
            <View style={styles.addBuyInContainer}>
              <TextInput
                style={styles.buyInInput}
                placeholder="Add buy-in amount"
                value={additionalBuyIn}
                onChangeText={setAdditionalBuyIn}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddBuyIn}
                disabled={!additionalBuyIn}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hands Played</Text>
            <TextInput
              style={styles.input}
              placeholder="Number of hands"
              value={endData.handsPlayed?.toString() || ''}
              onChangeText={(text) => {
                const hands = text ? parseInt(text, 10) : undefined;
                setEndData(prev => ({ ...prev, handsPlayed: hands }));
              }}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Session notes..."
              value={endData.notes}
              onChangeText={(text) => setEndData(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateSession}
            disabled={isUpdating}
          >
            <Text style={styles.updateButtonText}>
              {isUpdating ? 'Updating...' : 'Update Session'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>End Session</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cash-out Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="Final cash-out amount"
              value={endData.cashOut > 0 ? endData.cashOut.toString() : ''}
              onChangeText={(text) => {
                const amount = text ? parseFloat(text) : 0;
                setEndData(prev => ({ ...prev, cashOut: amount }));
              }}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              Required to end session
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Duration Override</Text>
            <TextInput
              style={styles.input}
              placeholder={`Auto-calculated: ${Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / (1000 * 60))} minutes`}
              value=""
              onChangeText={(text) => {
                // Duration is handled by backend
              }}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              Leave blank to use actual time played
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.endButton, (!endData.cashOut || isUpdating) && styles.disabledButton]}
            onPress={handleEndSession}
            disabled={!endData.cashOut || isUpdating}
          >
            <Text style={[styles.endButtonText, (!endData.cashOut || isUpdating) && styles.disabledText]}>
              {isUpdating ? 'Ending Session...' : 'End Session'}
            </Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
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
  sessionInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sessionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  buyInContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  totalBuyIn: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  addBuyInContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buyInInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
});