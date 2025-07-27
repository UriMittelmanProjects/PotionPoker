import { create } from 'zustand';
import {
  Group,
  GroupMember,
  GroupSession,
  GroupSessionPlayer,
  CreateGroupRequest,
  UpdateGroupRequest,
  CreateGroupSessionRequest,
  JoinGroupSessionRequest,
  EndGroupSessionRequest,
  GroupInviteLink,
  GroupStats,
  PlayerStats,
  GroupRole,
  User,
  SessionType
} from '../types';

interface GroupState {
  // Data
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: GroupMember[];
  groupSessions: GroupSession[];
  activeGroupSession: GroupSession | null;
  groupSessionPlayers: GroupSessionPlayer[];
  groupStats: GroupStats | null;
  playerStats: PlayerStats[];
  inviteLinks: GroupInviteLink[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isJoining: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  fetchGroups: () => Promise<void>;
  fetchGroupDetails: (groupId: string) => Promise<void>;
  createGroup: (groupData: CreateGroupRequest) => Promise<void>;
  updateGroup: (groupId: string, updateData: UpdateGroupRequest) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  // Member management
  fetchGroupMembers: (groupId: string) => Promise<void>;
  addGroupMember: (groupId: string, userId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateMemberRole: (groupId: string, userId: string, role: GroupRole) => Promise<void>;
  
  // Session management
  fetchGroupSessions: (groupId: string) => Promise<void>;
  createGroupSession: (groupId: string, sessionData: CreateGroupSessionRequest) => Promise<void>;
  joinGroupSession: (sessionId: string, joinData: JoinGroupSessionRequest) => Promise<void>;
  endGroupSession: (sessionId: string, endData: EndGroupSessionRequest) => Promise<void>;
  deleteGroupSession: (sessionId: string) => Promise<void>;
  
  // Invite links
  generateInviteLink: (groupId: string, maxUses?: number) => Promise<void>;
  fetchInviteLinks: (groupId: string) => Promise<void>;
  deactivateInviteLink: (linkId: string) => Promise<void>;
  joinViaInviteLink: (token: string) => Promise<void>;
  
  // Stats
  fetchGroupStats: (groupId: string) => Promise<void>;
  fetchPlayerStats: (groupId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  reset: () => void;
  setCurrentGroup: (group: Group | null) => void;
}

// Mock users
const mockUsers: User[] = [
  {
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
  {
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
  {
    id: 'user3',
    email: 'mike@example.com', 
    username: 'mike_bluff',
    firstName: 'Mike',
    lastName: 'Johnson',
    displayName: 'Mike J.',
    playingStatus: 'ONLINE' as any,
    statusVisibility: 'PUBLIC' as any,
    showPlayingStatus: true,
    totalHands: 750,
    totalSessions: 10,
    totalWinnings: 850,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user4',
    email: 'sarah@example.com',
    username: 'sarah_ace',
    firstName: 'Sarah',
    lastName: 'Wilson',
    displayName: 'Sarah W.',
    playingStatus: 'OFFLINE' as any,
    statusVisibility: 'FRIENDS_ONLY' as any,
    showPlayingStatus: false,
    totalHands: 650,
    totalSessions: 8,
    totalWinnings: 720,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock data
const mockGroups: Group[] = [
  {
    id: 'group1',
    name: 'Friday Night Poker',
    description: 'Weekly home game with friends',
    isPrivate: false,
    adminId: 'user1',
    admin: mockUsers[0],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
    memberCount: 6,
    sessionCount: 15,
    totalVolume: 8500
  },
  {
    id: 'group2',
    name: 'Office League',
    description: 'Monthly poker tournament at work',
    isPrivate: true,
    adminId: 'user1',
    admin: mockUsers[0],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-25'),
    memberCount: 12,
    sessionCount: 3,
    totalVolume: 2400
  }
];

const mockGroupMembers: GroupMember[] = [
  {
    id: 'member1',
    groupId: 'group1',
    userId: 'user1',
    user: mockUsers[0],
    role: GroupRole.ADMIN,
    joinedAt: new Date('2024-01-01')
  },
  {
    id: 'member2',
    groupId: 'group1',
    userId: 'user2',
    user: mockUsers[1],
    role: GroupRole.MEMBER,
    joinedAt: new Date('2024-01-02')
  },
  {
    id: 'member3',
    groupId: 'group1',
    userId: 'user3',
    user: mockUsers[2],
    role: GroupRole.MEMBER,
    joinedAt: new Date('2024-01-03')
  }
];

const mockGroupSessions: GroupSession[] = [
  {
    id: 'session1',
    groupId: 'group1',
    group: mockGroups[0],
    sessionType: SessionType.HOME_GAME,
    venue: "John's House",
    address: '123 Poker Street, Austin, TX',
    startTime: new Date('2024-01-20T19:00:00'),
    endTime: new Date('2024-01-20T23:30:00'),
    notes: 'Great turnout, everyone had fun!',
    isActive: false,
    createdAt: new Date('2024-01-20T19:00:00'),
    updatedAt: new Date('2024-01-20T23:30:00'),
    playerCount: 5,
    totalBuyIn: 1000,
    totalCashOut: 1000
  },
  {
    id: 'session2',
    groupId: 'group1',
    group: mockGroups[0],
    sessionType: SessionType.HOME_GAME,
    venue: "Mike's Place",
    address: '456 Card Avenue, Austin, TX',
    startTime: new Date('2024-01-26T19:30:00'),
    notes: 'Tonight is tournament night!',
    isActive: true,
    createdAt: new Date('2024-01-26T19:30:00'),
    updatedAt: new Date('2024-01-26T19:30:00'),
    playerCount: 3,
    totalBuyIn: 600,
    totalCashOut: 0
  }
];

export const useGroupStore = create<GroupState>((set, get) => ({
  // Initial state
  groups: [],
  currentGroup: null,
  groupMembers: [],
  groupSessions: [],
  activeGroupSession: null,
  groupSessionPlayers: [],
  groupStats: null,
  playerStats: [],
  inviteLinks: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isJoining: false,
  error: null,

  // Actions
  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ 
        groups: mockGroups,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch groups',
        isLoading: false 
      });
    }
  },

  fetchGroupDetails: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const group = mockGroups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }
      
      set({ 
        currentGroup: group,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group details',
        isLoading: false 
      });
    }
  },

  createGroup: async (groupData: CreateGroupRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup: Group = {
        id: Date.now().toString(),
        ...groupData,
        adminId: 'user1', // Current user
        admin: mockUsers[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 1,
        sessionCount: 0,
        totalVolume: 0
      };
      
      set(state => ({
        groups: [newGroup, ...state.groups],
        isCreating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create group',
        isCreating: false 
      });
    }
  },

  updateGroup: async (groupId: string, updateData: UpdateGroupRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? { ...group, ...updateData, updatedAt: new Date() }
            : group
        ),
        currentGroup: state.currentGroup?.id === groupId
          ? { ...state.currentGroup, ...updateData, updatedAt: new Date() }
          : state.currentGroup,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update group',
        isUpdating: false 
      });
    }
  },

  deleteGroup: async (groupId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groups: state.groups.filter(group => group.id !== groupId),
        currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete group',
        isUpdating: false 
      });
    }
  },

  fetchGroupMembers: async (groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const members = mockGroupMembers.filter(m => m.groupId === groupId);
      set({ groupMembers: members });
    } catch (error) {
      set({ error: 'Failed to fetch group members' });
    }
  },

  addGroupMember: async (groupId: string, userId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      const newMember: GroupMember = {
        id: Date.now().toString(),
        groupId,
        userId,
        user,
        role: GroupRole.MEMBER,
        joinedAt: new Date()
      };
      
      set(state => ({
        groupMembers: [...state.groupMembers, newMember],
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add member',
        isUpdating: false 
      });
    }
  },

  removeGroupMember: async (groupId: string, userId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groupMembers: state.groupMembers.filter(m => !(m.groupId === groupId && m.userId === userId)),
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove member',
        isUpdating: false 
      });
    }
  },

  updateMemberRole: async (groupId: string, userId: string, role: GroupRole) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groupMembers: state.groupMembers.map(member => 
          member.groupId === groupId && member.userId === userId
            ? { ...member, role }
            : member
        ),
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update member role',
        isUpdating: false 
      });
    }
  },

  fetchGroupSessions: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessions = mockGroupSessions.filter(s => s.groupId === groupId);
      const activeSession = sessions.find(s => s.isActive) || null;
      
      set({ 
        groupSessions: sessions,
        activeGroupSession: activeSession,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group sessions',
        isLoading: false 
      });
    }
  },

  createGroupSession: async (groupId: string, sessionData: CreateGroupSessionRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const group = mockGroups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');
      
      const newSession: GroupSession = {
        id: Date.now().toString(),
        groupId,
        group,
        ...sessionData,
        startTime: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        playerCount: 0,
        totalBuyIn: 0,
        totalCashOut: 0
      };
      
      set(state => ({
        groupSessions: [newSession, ...state.groupSessions],
        activeGroupSession: newSession,
        isCreating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create group session',
        isCreating: false 
      });
    }
  },

  joinGroupSession: async (sessionId: string, joinData: JoinGroupSessionRequest) => {
    set({ isJoining: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock joining session logic
      set(state => ({
        groupSessions: state.groupSessions.map(session => 
          session.id === sessionId
            ? {
                ...session,
                playerCount: session.playerCount + 1,
                totalBuyIn: session.totalBuyIn + joinData.buyIn,
                updatedAt: new Date()
              }
            : session
        ),
        isJoining: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join session',
        isJoining: false 
      });
    }
  },

  endGroupSession: async (sessionId: string, endData: EndGroupSessionRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        groupSessions: state.groupSessions.map(session => 
          session.id === sessionId
            ? {
                ...session,
                endTime: new Date(),
                isActive: false,
                totalCashOut: session.totalBuyIn, // Simplified
                updatedAt: new Date()
              }
            : session
        ),
        activeGroupSession: state.activeGroupSession?.id === sessionId ? null : state.activeGroupSession,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to end session',
        isUpdating: false 
      });
    }
  },

  deleteGroupSession: async (sessionId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        groupSessions: state.groupSessions.filter(s => s.id !== sessionId),
        activeGroupSession: state.activeGroupSession?.id === sessionId ? null : state.activeGroupSession,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isUpdating: false 
      });
    }
  },

  generateInviteLink: async (groupId: string, maxUses?: number) => {
    set({ isCreating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newLink: GroupInviteLink = {
        id: Date.now().toString(),
        groupId,
        token: Math.random().toString(36).substring(2, 15),
        createdBy: 'user1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        maxUses,
        currentUses: 0,
        isActive: true
      };
      
      set(state => ({
        inviteLinks: [newLink, ...state.inviteLinks],
        isCreating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate invite link',
        isCreating: false 
      });
    }
  },

  fetchInviteLinks: async (groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock - would filter by groupId in real implementation
      set({ inviteLinks: [] });
    } catch (error) {
      set({ error: 'Failed to fetch invite links' });
    }
  },

  deactivateInviteLink: async (linkId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        inviteLinks: state.inviteLinks.map(link => 
          link.id === linkId ? { ...link, isActive: false } : link
        ),
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to deactivate link',
        isUpdating: false 
      });
    }
  },

  joinViaInviteLink: async (token: string) => {
    set({ isJoining: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock implementation
      set({ isJoining: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to join via invite link',
        isJoining: false 
      });
    }
  },

  fetchGroupStats: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockStats: GroupStats = {
        totalSessions: 15,
        totalVolume: 8500,
        avgSessionLength: 4.2,
        mostActivePlayer: {
          user: mockUsers[0],
          sessionCount: 12
        },
        biggestWinner: {
          user: mockUsers[1],
          totalProfit: 850
        },
        recentActivity: []
      };
      
      set({ 
        groupStats: mockStats,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group stats',
        isLoading: false 
      });
    }
  },

  fetchPlayerStats: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockPlayerStats: PlayerStats[] = mockUsers.slice(0, 3).map((user, index) => ({
        userId: user.id,
        user,
        totalSessions: 12 - index * 2,
        totalBuyIn: 2400 - index * 300,
        totalCashOut: 2500 - index * 250,
        totalProfit: 100 - index * 50,
        avgSessionLength: 4.5 - index * 0.3,
        winRate: 0.67 - index * 0.1,
        biggestWin: 320 - index * 50,
        biggestLoss: -180 + index * 30
      }));
      
      set({ 
        playerStats: mockPlayerStats,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch player stats',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    groups: [],
    currentGroup: null,
    groupMembers: [],
    groupSessions: [],
    activeGroupSession: null,
    groupSessionPlayers: [],
    groupStats: null,
    playerStats: [],
    inviteLinks: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isJoining: false,
    error: null
  }),

  setCurrentGroup: (group: Group | null) => set({ currentGroup: group })
}));