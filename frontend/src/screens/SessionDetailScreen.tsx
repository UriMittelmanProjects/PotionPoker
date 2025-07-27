import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { PokerSession, SessionType, UpdateSessionRequest } from '../shared/types';
import { useSessionStore } from '../shared/stores/sessionStore';

interface SessionDetailScreenProps {
  session: PokerSession;
  onClose: () => void;
  onSessionUpdated?: () => void;
  onSessionDeleted?: () => void;
}

const sessionTypeOptions = [
  { value: SessionType.LIVE_CASINO, label: 'Live Casino' },
  { value: SessionType.HOME_GAME, label: 'Home Game' },
  { value: SessionType.ONLINE, label: 'Online' },
  { value: SessionType.OTHER, label: 'Other' },
];

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function SessionDetailScreen({ 
  session, 
  onClose, 
  onSessionUpdated,
  onSessionDeleted 
}: SessionDetailScreenProps) {
  const { updateSession, deleteSession, isUpdating, error } = useSessionStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState<UpdateSessionRequest>({
    venue: session.venue || '',
    address: session.address || '',
    totalBuyIn: session.totalBuyIn,
    cashOut: session.cashOut || 0,
    gameType: session.gameType || '',
    stakes: session.stakes || '',
    handsPlayed: session.handsPlayed,
    notes: session.notes || '',
    duration: session.duration,
  });

  const currentProfit = (editData.cashOut || 0) - (editData.totalBuyIn || 0);
  const originalProfit = session.profit || 0;

  const handleSave = async () => {
    try {
      await updateSession(session.id, editData);
      setIsEditing(false);
      onSessionUpdated?.();
      Alert.alert('Success', 'Session updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update session. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
              onSessionDeleted?.();
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setEditData({
      venue: session.venue || '',
      address: session.address || '',
      totalBuyIn: session.totalBuyIn,
      cashOut: session.cashOut || 0,
      gameType: session.gameType || '',
      stakes: session.stakes || '',
      handsPlayed: session.handsPlayed,
      notes: session.notes || '',
      duration: session.duration,
    });
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Session Details</Text>
        
        <View style={styles.headerActions}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave} 
                disabled={isUpdating}
                style={[styles.saveButton, isUpdating && styles.disabledButton]}
              >
                <Text style={[styles.saveText, isUpdating && styles.disabledText]}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Session Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={[
              styles.statusChip,
              { backgroundColor: session.isActive ? '#28a745' : '#6c757d' }
            ]}>
              <Text style={styles.statusText}>
                {session.isActive ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profitContainer}>
            <Text style={styles.profitLabel}>
              {isEditing ? 'Current Profit/Loss' : 'Final Profit/Loss'}
            </Text>
            <Text style={[
              styles.profitValue,
              { color: (isEditing ? currentProfit : originalProfit) >= 0 ? '#28a745' : '#dc3545' }
            ]}>
              {(isEditing ? currentProfit : originalProfit) >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(isEditing ? currentProfit : originalProfit))}
            </Text>
          </View>
        </View>

        {/* Session Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Timeline</Text>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Started</Text>
              <Text style={styles.timelineValue}>
                {formatDateTime(session.startTime)}
              </Text>
            </View>
            
            {session.endTime && (
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Ended</Text>
                <Text style={styles.timelineValue}>
                  {formatDateTime(session.endTime)}
                </Text>
              </View>
            )}
            
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Duration</Text>
              <Text style={styles.timelineValue}>
                {isEditing && editData.duration !== undefined 
                  ? formatDuration(editData.duration)
                  : formatDuration(session.duration)
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Total Buy-in</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={(editData.totalBuyIn || 0).toString()}
                onChangeText={(text) => {
                  const amount = parseFloat(text) || 0;
                  setEditData(prev => ({ ...prev, totalBuyIn: amount }));
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.displayValue}>{formatCurrency(session.totalBuyIn)}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cash-out</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.cashOut?.toString() || ''}
                onChangeText={(text) => {
                  const amount = text ? parseFloat(text) : 0;
                  setEditData(prev => ({ ...prev, cashOut: amount }));
                }}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.displayValue}>
                {session.cashOut ? formatCurrency(session.cashOut) : 'N/A'}
              </Text>
            )}
          </View>
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Venue</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.venue}
                onChangeText={(text) => setEditData(prev => ({ ...prev, venue: text }))}
                placeholder="Venue name"
              />
            ) : (
              <Text style={styles.displayValue}>{session.venue || 'Not specified'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.address}
                onChangeText={(text) => setEditData(prev => ({ ...prev, address: text }))}
                placeholder="Address"
                multiline
                numberOfLines={2}
              />
            ) : (
              <Text style={styles.displayValue}>{session.address || 'Not specified'}</Text>
            )}
          </View>
        </View>

        {/* Game Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Game Type</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.gameType}
                onChangeText={(text) => setEditData(prev => ({ ...prev, gameType: text }))}
                placeholder="e.g., No Limit Hold'em"
              />
            ) : (
              <Text style={styles.displayValue}>{session.gameType || 'Not specified'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Stakes</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.stakes}
                onChangeText={(text) => setEditData(prev => ({ ...prev, stakes: text }))}
                placeholder="e.g., 1/2, 2/5"
              />
            ) : (
              <Text style={styles.displayValue}>{session.stakes || 'Not specified'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hands Played</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.handsPlayed?.toString() || ''}
                onChangeText={(text) => {
                  const hands = text ? parseInt(text, 10) : undefined;
                  setEditData(prev => ({ ...prev, handsPlayed: hands }));
                }}
                keyboardType="numeric"
                placeholder="Number of hands"
              />
            ) : (
              <Text style={styles.displayValue}>{session.handsPlayed || 'Not specified'}</Text>
            )}
          </View>

          {isEditing && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration Override (minutes)</Text>
              <TextInput
                style={styles.input}
                value={editData.duration?.toString() || ''}
                onChangeText={(text) => {
                  const duration = text ? parseInt(text, 10) : undefined;
                  setEditData(prev => ({ ...prev, duration }));
                }}
                keyboardType="numeric"
                placeholder="Leave blank for auto-calculated"
              />
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={editData.notes}
              onChangeText={(text) => setEditData(prev => ({ ...prev, notes: text }))}
              placeholder="Session notes..."
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={styles.displayValue}>
              {session.notes || 'No notes added'}
            </Text>
          )}
        </View>

        {/* Delete Button (only when not editing) */}
        {!isEditing && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isUpdating}
            >
              <Text style={styles.deleteButtonText}>Delete Session</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontSize: 16,
    color: '#007bff',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveText: {
    color: '#fff',
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
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
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  profitContainer: {
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: '700',
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
  timelineContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
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
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  displayValue: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});