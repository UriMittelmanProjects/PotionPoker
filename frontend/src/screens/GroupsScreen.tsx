import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGroupStore } from '../shared/stores/groupStore';
import { Group, GroupSession } from '../shared/types';
import CreateGroupScreen from './CreateGroupScreen';
import GroupDetailScreen from './GroupDetailScreen';
import GroupSessionScreen from './GroupSessionScreen';
import GroupStatsScreen from './GroupStatsScreen';

type ScreenMode = 'main' | 'create' | 'detail' | 'session' | 'stats';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

function GroupCard({ group, onPress }: GroupCardProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          {group.description && (
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description}
            </Text>
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
        <View style={styles.groupStatItem}>
          <Text style={styles.groupStatValue}>{group.memberCount}</Text>
          <Text style={styles.groupStatLabel}>Members</Text>
        </View>
        
        <View style={styles.groupStatItem}>
          <Text style={styles.groupStatValue}>{group.sessionCount}</Text>
          <Text style={styles.groupStatLabel}>Sessions</Text>
        </View>
        
        <View style={styles.groupStatItem}>
          <Text style={styles.groupStatValue}>{formatCurrency(group.totalVolume)}</Text>
          <Text style={styles.groupStatLabel}>Volume</Text>
        </View>
      </View>

      <View style={styles.groupFooter}>
        <Text style={styles.adminText}>
          Admin: {group.admin.displayName || `${group.admin.firstName} ${group.admin.lastName}`}
        </Text>
        <Text style={styles.createdText}>
          Created {new Intl.DateTimeFormat('en-US', {
            month: 'short',
            year: 'numeric'
          }).format(group.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GroupsScreen() {
  const { 
    groups, 
    fetchGroups, 
    setCurrentGroup,
    isLoading, 
    error 
  } = useGroupStore();

  const [screenMode, setScreenMode] = useState<ScreenMode>('main');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    setScreenMode('create');
  };

  const handleGroupCreated = () => {
    fetchGroups();
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setCurrentGroup(group);
    setScreenMode('detail');
  };

  const handleCreateSession = () => {
    setScreenMode('session');
  };

  const handleViewSession = (session: GroupSession) => {
    setSelectedSession(session);
    setScreenMode('session');
  };

  const handleViewStats = () => {
    setScreenMode('stats');
  };

  const handleSessionCreated = () => {
    fetchGroups();
  };

  const handleSessionEnded = () => {
    fetchGroups();
  };

  const handleBackToMain = () => {
    setScreenMode('main');
    setSelectedGroup(null);
    setSelectedSession(null);
    setCurrentGroup(null);
  };

  const handleBackToDetail = () => {
    setScreenMode('detail');
    setSelectedSession(null);
  };

  const currentUserId = 'user1'; // Mock current user
  const myGroups = groups.filter(g => g.adminId === currentUserId || true); // Mock - in real app, filter by membership
  const availableGroups = groups.filter(g => !g.isPrivate && g.adminId !== currentUserId).slice(0, 3); // Mock discovery

  // Render different screens based on mode
  if (screenMode === 'create') {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <CreateGroupScreen 
            onClose={handleBackToMain}
            onGroupCreated={handleGroupCreated}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (screenMode === 'detail' && selectedGroup) {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <GroupDetailScreen
            group={selectedGroup}
            onClose={handleBackToMain}
            onCreateSession={handleCreateSession}
            onViewSession={handleViewSession}
            onViewStats={handleViewStats}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (screenMode === 'session' && selectedGroup) {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <GroupSessionScreen
            group={selectedGroup}
            session={selectedSession || undefined}
            onClose={selectedSession ? handleBackToDetail : handleBackToMain}
            onSessionCreated={handleSessionCreated}
            onSessionEnded={handleSessionEnded}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (screenMode === 'stats' && selectedGroup) {
    return (
      <Modal animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <GroupStatsScreen
            group={selectedGroup}
            onClose={handleBackToDetail}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  const renderGroup = ({ item }: { item: Group }) => (
    <GroupCard group={item} onPress={() => handleGroupSelect(item)} />
  );

  const renderEmptyMyGroups = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first poker group to start tracking group sessions
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleCreateGroup}>
        <Text style={styles.emptyButtonText}>Create Your First Group</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyDiscovery = () => (
    <View style={styles.emptyDiscovery}>
      <Text style={styles.emptyDiscoveryText}>No public groups available</Text>
    </View>
  );

  // Main groups screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchGroups} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && groups.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* My Groups Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Groups ({myGroups.length})</Text>
            </View>
            
            {myGroups.length === 0 ? (
              renderEmptyMyGroups()
            ) : (
              <FlatList
                data={myGroups}
                renderItem={renderGroup}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.groupsList}
              />
            )}
          </View>

          {/* Discover Groups Section */}
          {myGroups.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Discover Groups</Text>
                <Text style={styles.sectionSubtitle}>Public groups you can join</Text>
              </View>
              
              {availableGroups.length === 0 ? (
                renderEmptyDiscovery()
              ) : (
                <FlatList
                  data={availableGroups}
                  renderItem={renderGroup}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.groupsList}
                />
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  groupsList: {
    paddingBottom: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  groupStatItem: {
    alignItems: 'center',
  },
  groupStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  groupStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  createdText: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDiscovery: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyDiscoveryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});