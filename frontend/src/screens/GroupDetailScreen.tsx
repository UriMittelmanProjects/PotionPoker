import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Group, GroupMember, GroupSession, GroupRole } from '../shared/types';
import { useGroupStore } from '../shared/stores/groupStore';

interface GroupDetailScreenProps {
  group: Group;
  onClose: () => void;
  onCreateSession?: () => void;
  onViewSession?: (session: GroupSession) => void;
  onViewStats?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

interface MemberCardProps {
  member: GroupMember;
  isCurrentUser: boolean;
  canManage: boolean;
  onRemoveMember?: (userId: string) => void;
  onChangeRole?: (userId: string, role: GroupRole) => void;
}

function MemberCard({ 
  member, 
  isCurrentUser, 
  canManage, 
  onRemoveMember, 
  onChangeRole 
}: MemberCardProps) {
  const handleRemove = () => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.user.displayName || member.user.firstName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveMember?.(member.userId) }
      ]
    );
  };

  const handleRoleChange = () => {
    const newRole = member.role === GroupRole.ADMIN ? GroupRole.MEMBER : GroupRole.ADMIN;
    const action = newRole === GroupRole.ADMIN ? 'promote to admin' : 'remove admin privileges';
    
    Alert.alert(
      'Change Role',
      `${action} for ${member.user.displayName || member.user.firstName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => onChangeRole?.(member.userId, newRole) }
      ]
    );
  };

  return (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.user.displayName || `${member.user.firstName} ${member.user.lastName}`}
        </Text>
        <Text style={styles.memberUsername}>@{member.user.username}</Text>
        <View style={styles.memberMeta}>
          <View style={[
            styles.roleChip,
            { backgroundColor: member.role === GroupRole.ADMIN ? '#007bff' : '#6c757d' }
          ]}>
            <Text style={styles.roleText}>{member.role}</Text>
          </View>
          <Text style={styles.joinDate}>Joined {formatDate(member.joinedAt)}</Text>
        </View>
      </View>
      
      {canManage && !isCurrentUser && (
        <View style={styles.memberActions}>
          <TouchableOpacity onPress={handleRoleChange} style={styles.roleButton}>
            <Text style={styles.roleButtonText}>
              {member.role === GroupRole.ADMIN ? 'Remove Admin' : 'Make Admin'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface SessionCardProps {
  session: GroupSession;
  onPress: () => void;
}

function SessionCard({ session, onPress }: SessionCardProps) {
  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionVenue}>{session.venue}</Text>
          <Text style={styles.sessionDate}>{formatDateTime(session.startTime)}</Text>
        </View>
        {session.isActive && (
          <View style={styles.activeChip}>
            <Text style={styles.activeText}>LIVE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDetail}>
          {session.playerCount} player{session.playerCount !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.sessionDetail}>
          Volume: {formatCurrency(session.totalBuyIn)}
        </Text>
        {session.endTime && (
          <Text style={styles.sessionDetail}>
            Duration: {Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))}m
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function GroupDetailScreen({ 
  group, 
  onClose, 
  onCreateSession,
  onViewSession,
  onViewStats
}: GroupDetailScreenProps) {
  const {
    fetchGroupMembers,
    fetchGroupSessions,
    generateInviteLink,
    removeGroupMember,
    updateMemberRole,
    groupMembers,
    groupSessions,
    activeGroupSession,
    isLoading,
    isUpdating,
    error
  } = useGroupStore();

  const [showAllMembers, setShowAllMembers] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const currentUserId = 'user1'; // Mock current user
  const isAdmin = group.adminId === currentUserId;
  
  useEffect(() => {
    fetchGroupMembers(group.id);
    fetchGroupSessions(group.id);
  }, [group.id]);

  const handleGenerateInvite = async () => {
    try {
      await generateInviteLink(group.id);
      Alert.alert('Success', 'Invite link generated! You can share it with friends.');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate invite link');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeGroupMember(group.id, userId);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  const handleChangeRole = async (userId: string, role: GroupRole) => {
    try {
      await updateMemberRole(group.id, userId, role);
    } catch (error) {
      Alert.alert('Error', 'Failed to update member role');
    }
  };

  const displayedMembers = showAllMembers ? groupMembers : groupMembers.slice(0, 3);
  const displayedSessions = showAllSessions ? groupSessions : groupSessions.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{group.name}</Text>
        <View style={styles.headerActions}>
          {isAdmin && (
            <TouchableOpacity onPress={onCreateSession} style={styles.createSessionButton}>
              <Text style={styles.createSessionText}>+ Session</Text>
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

        {/* Group Info */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.description && (
                <Text style={styles.groupDescription}>{group.description}</Text>
              )}
            </View>
            <View style={styles.groupMeta}>
              <View style={[
                styles.privacyChip,
                { backgroundColor: group.isPrivate ? '#dc3545' : '#28a745' }
              ]}>
                <Text style={styles.privacyText}>
                  {group.isPrivate ? 'Private' : 'Public'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{group.memberCount}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{group.sessionCount}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(group.totalVolume)}</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        {/* Active Session */}
        {activeGroupSession && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Session</Text>
            <SessionCard 
              session={activeGroupSession}
              onPress={() => onViewSession?.(activeGroupSession)}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {isAdmin && (
              <TouchableOpacity style={styles.actionButton} onPress={handleGenerateInvite}>
                <Text style={styles.actionButtonText}>📤 Generate Invite Link</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={onViewStats}>
              <Text style={styles.actionButtonText}>📊 View Group Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members ({group.memberCount})</Text>
            {groupMembers.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllMembers(!showAllMembers)}>
                <Text style={styles.showMoreText}>
                  {showAllMembers ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            displayedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.userId === currentUserId}
                canManage={isAdmin}
                onRemoveMember={handleRemoveMember}
                onChangeRole={handleChangeRole}
              />
            ))
          )}
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {groupSessions.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllSessions(!showAllSessions)}>
                <Text style={styles.showMoreText}>
                  {showAllSessions ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : groupSessions.length === 0 ? (
            <Text style={styles.emptyText}>No sessions yet</Text>
          ) : (
            displayedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => onViewSession?.(session)}
              />
            ))
          )}
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
  createSessionButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createSessionText: {
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
  groupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
  },
  groupMeta: {
    alignItems: 'flex-end',
  },
  privacyChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
  showMoreText: {
    fontSize: 14,
    color: '#007bff',
  },
  actionsContainer: {
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  memberCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  joinDate: {
    fontSize: 12,
    color: '#888',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionVenue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
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
  sessionDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionDetail: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});