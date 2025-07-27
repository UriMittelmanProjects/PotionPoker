import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { 
  Group, 
  GroupSession, 
  GroupSessionPlayer, 
  GroupMember,
  CreateGroupSessionRequest,
  JoinGroupSessionRequest,
  EndGroupSessionRequest,
  SessionType 
} from '../shared/types';
import { useGroupStore } from '../shared/stores/groupStore';

interface GroupSessionScreenProps {
  group: Group;
  session?: GroupSession;
  onClose: () => void;
  onSessionCreated?: () => void;
  onSessionEnded?: () => void;
}

interface PlayerRowProps {
  player: GroupSessionPlayer;
  canEdit: boolean;
  onUpdatePlayer?: (playerId: string, buyIn: number, cashOut?: number, notes?: string) => void;
  onRemovePlayer?: (playerId: string) => void;
}

function PlayerRow({ player, canEdit, onUpdatePlayer, onRemovePlayer }: PlayerRowProps) {
  const [editing, setEditing] = useState(false);
  const [buyIn, setBuyIn] = useState(player.buyIn.toString());
  const [cashOut, setCashOut] = useState(player.cashOut?.toString() || '');
  const [notes, setNotes] = useState(player.notes || '');

  const profit = (player.cashOut || 0) - player.buyIn;

  const handleSave = () => {
    const buyInNum = parseFloat(buyIn) || 0;
    const cashOutNum = cashOut ? parseFloat(cashOut) : undefined;
    
    onUpdatePlayer?.(player.id, buyInNum, cashOutNum, notes);
    setEditing(false);
  };

  const handleCancel = () => {
    setBuyIn(player.buyIn.toString());
    setCashOut(player.cashOut?.toString() || '');
    setNotes(player.notes || '');
    setEditing(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (editing) {
    return (
      <View style={styles.playerEditRow}>
        <Text style={styles.playerName}>
          {player.user.displayName || `${player.user.firstName} ${player.user.lastName}`}
        </Text>
        
        <View style={styles.editInputs}>
          <View style={styles.editField}>
            <Text style={styles.editLabel}>Buy-in</Text>
            <TextInput
              style={styles.editInput}
              value={buyIn}
              onChangeText={setBuyIn}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          
          <View style={styles.editField}>
            <Text style={styles.editLabel}>Cash-out</Text>
            <TextInput
              style={styles.editInput}
              value={cashOut}
              onChangeText={setCashOut}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
        
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          multiline
        />
        
        <View style={styles.editActions}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.playerRow}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {player.user.displayName || `${player.user.firstName} ${player.user.lastName}`}
        </Text>
        <Text style={styles.playerUsername}>@{player.user.username}</Text>
      </View>
      
      <View style={styles.playerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Buy-in</Text>
          <Text style={styles.statValue}>{formatCurrency(player.buyIn)}</Text>
        </View>
        
        {player.cashOut !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cash-out</Text>
            <Text style={styles.statValue}>{formatCurrency(player.cashOut)}</Text>
          </View>
        )}
        
        {player.cashOut !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>P&L</Text>
            <Text style={[
              styles.statValue,
              { color: profit >= 0 ? '#28a745' : '#dc3545' }
            ]}>
              {profit >= 0 ? '+' : ''}{formatCurrency(Math.abs(profit))}
            </Text>
          </View>
        )}
      </View>
      
      {canEdit && (
        <View style={styles.playerActions}>
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onRemovePlayer?.(player.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const sessionTypeOptions = [
  { value: SessionType.LIVE_CASINO, label: 'Live Casino' },
  { value: SessionType.HOME_GAME, label: 'Home Game' },
  { value: SessionType.ONLINE, label: 'Online' },
  { value: SessionType.OTHER, label: 'Other' },
];

export default function GroupSessionScreen({ 
  group, 
  session,
  onClose, 
  onSessionCreated,
  onSessionEnded
}: GroupSessionScreenProps) {
  const {
    createGroupSession,
    joinGroupSession,
    endGroupSession,
    fetchGroupMembers,
    groupMembers,
    groupSessionPlayers,
    isCreating,
    isJoining,
    isUpdating,
    error
  } = useGroupStore();

  const [mode, setMode] = useState<'create' | 'manage'>(session ? 'manage' : 'create');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  
  // Create session form
  const [createForm, setCreateForm] = useState<CreateGroupSessionRequest>({
    sessionType: SessionType.HOME_GAME,
    venue: '',
    address: '',
    notes: '',
  });

  // Join session form
  const [joinForm, setJoinForm] = useState<JoinGroupSessionRequest>({
    buyIn: 0,
    notes: '',
  });

  const currentUserId = 'user1'; // Mock current user
  const isAdmin = group.adminId === currentUserId;
  const isActive = session?.isActive ?? false;

  // Mock session players data
  const mockPlayers: GroupSessionPlayer[] = session ? [
    {
      id: 'player1',
      groupSessionId: session.id,
      userId: 'user1',
      user: { 
        id: 'user1', 
        email: 'john@example.com', 
        username: 'john_poker', 
        firstName: 'John', 
        lastName: 'Smith', 
        displayName: 'John S.',
        playingStatus: 'OFFLINE' as any,
        statusVisibility: 'PUBLIC' as any,
        showPlayingStatus: true,
        totalHands: 1250,
        totalSessions: 15,
        totalWinnings: 2100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      buyIn: 200,
      cashOut: session.isActive ? undefined : 350,
      profit: session.isActive ? undefined : 150,
      notes: 'Playing tight tonight'
    },
    {
      id: 'player2',
      groupSessionId: session.id,
      userId: 'user2',
      user: { 
        id: 'user2', 
        email: 'jane@example.com', 
        username: 'jane_cards', 
        firstName: 'Jane', 
        lastName: 'Doe', 
        displayName: 'Jane D.',
        playingStatus: 'OFFLINE' as any,
        statusVisibility: 'PUBLIC' as any,
        showPlayingStatus: true,
        totalHands: 980,
        totalSessions: 12,
        totalWinnings: 1400,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      buyIn: 200,
      cashOut: session.isActive ? undefined : 180,
      profit: session.isActive ? undefined : -20,
      notes: ''
    },
  ] : [];

  useEffect(() => {
    if (session) {
      fetchGroupMembers(group.id);
    }
  }, [session, group.id]);

  const handleCreateSession = async () => {
    if (!createForm.venue.trim()) {
      Alert.alert('Error', 'Venue name is required');
      return;
    }

    try {
      await createGroupSession(group.id, createForm);
      onSessionCreated?.();
      setMode('manage');
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  const handleJoinSession = async () => {
    if (!joinForm.buyIn || joinForm.buyIn <= 0) {
      Alert.alert('Error', 'Valid buy-in amount is required');
      return;
    }

    try {
      await joinGroupSession(session!.id, joinForm);
      setShowAddPlayer(false);
      setJoinForm({ buyIn: 0, notes: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to join session');
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this group session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await endGroupSession(session!.id, { cashOut: 0 });
              onSessionEnded?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to end session');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (mode === 'create') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Group Session</Text>
          <TouchableOpacity
            onPress={handleCreateSession}
            disabled={!createForm.venue.trim() || isCreating}
            style={[styles.createButton, (!createForm.venue.trim() || isCreating) && styles.disabledButton]}
          >
            <Text style={[styles.createText, (!createForm.venue.trim() || isCreating) && styles.disabledText]}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Type</Text>
            <View style={styles.sessionTypeContainer}>
              {sessionTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sessionTypeOption,
                    createForm.sessionType === option.value && styles.selectedOption,
                  ]}
                  onPress={() => setCreateForm(prev => ({ ...prev, sessionType: option.value }))}
                >
                  <Text
                    style={[
                      styles.sessionTypeText,
                      createForm.sessionType === option.value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Venue name *"
              value={createForm.venue}
              onChangeText={(text) => setCreateForm(prev => ({ ...prev, venue: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Address (optional)"
              value={createForm.address}
              onChangeText={(text) => setCreateForm(prev => ({ ...prev, address: text }))}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes about this session..."
              value={createForm.notes}
              onChangeText={(text) => setCreateForm(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Manage session mode
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>Group Session</Text>
        <View style={styles.headerActions}>
          {isAdmin && isActive && (
            <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Session Info */}
        {session && (
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionVenue}>{session.venue}</Text>
                {session.address && (
                  <Text style={styles.sessionAddress}>{session.address}</Text>
                )}
                <Text style={styles.sessionDate}>
                  Started: {formatDateTime(session.startTime)}
                </Text>
              </View>
              {isActive && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeText}>LIVE</Text>
                </View>
              )}
            </View>

            <View style={styles.sessionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Players</Text>
                <Text style={styles.statValue}>{mockPlayers.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Buy-in</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(mockPlayers.reduce((sum, p) => sum + p.buyIn, 0))}
                </Text>
              </View>
              {!isActive && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Cash-out</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(mockPlayers.reduce((sum, p) => sum + (p.cashOut || 0), 0))}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Players */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Players ({mockPlayers.length})</Text>
            {isActive && (
              <TouchableOpacity onPress={() => setShowAddPlayer(true)} style={styles.addPlayerButton}>
                <Text style={styles.addPlayerText}>+ Add Player</Text>
              </TouchableOpacity>
            )}
          </View>

          {mockPlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              canEdit={isAdmin && isActive}
            />
          ))}

          {mockPlayers.length === 0 && (
            <Text style={styles.emptyText}>No players have joined yet</Text>
          )}
        </View>

        {/* Add Player Form */}
        {showAddPlayer && (
          <View style={styles.addPlayerForm}>
            <Text style={styles.formTitle}>Join Session</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Buy-in Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter buy-in amount"
                value={joinForm.buyIn.toString()}
                onChangeText={(text) => setJoinForm(prev => ({ ...prev, buyIn: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="Add notes (optional)"
                value={joinForm.notes}
                onChangeText={(text) => setJoinForm(prev => ({ ...prev, notes: text }))}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity onPress={() => setShowAddPlayer(false)} style={styles.cancelFormButton}>
                <Text style={styles.cancelFormText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoinSession}
                disabled={!joinForm.buyIn || isJoining}
                style={[styles.joinButton, (!joinForm.buyIn || isJoining) && styles.disabledButton]}
              >
                <Text style={[styles.joinButtonText, (!joinForm.buyIn || isJoining) && styles.disabledText]}>
                  {isJoining ? 'Joining...' : 'Join Session'}
                </Text>
              </TouchableOpacity>
            </View>
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledText: {
    color: '#999',
  },
  endButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionTypeOption: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedOption: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sessionTypeText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sessionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionVenue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sessionAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  activeChip: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addPlayerButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addPlayerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  playerRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playerEditRow: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  playerInfo: {
    marginBottom: 8,
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  editInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  editField: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  addPlayerForm: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelFormButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelFormText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});