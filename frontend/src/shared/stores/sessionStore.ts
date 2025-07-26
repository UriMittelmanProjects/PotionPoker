import { create } from 'zustand';
import { 
  PokerSession, 
  CreateSessionRequest, 
  EndSessionRequest, 
  UpdateSessionRequest,
  LocationSuggestion,
  SessionFilter,
  SessionStats,
  SessionType 
} from '../types';

interface SessionState {
  // Data
  sessions: PokerSession[];
  activeSession: PokerSession | null;
  locationSuggestions: LocationSuggestion[];
  sessionStats: SessionStats | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  createSession: (sessionData: CreateSessionRequest) => Promise<void>;
  endSession: (sessionId: string, endData: EndSessionRequest) => Promise<void>;
  updateSession: (sessionId: string, updateData: UpdateSessionRequest) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  fetchSessions: (filter?: SessionFilter) => Promise<void>;
  fetchActiveSession: () => Promise<void>;
  fetchLocationSuggestions: () => Promise<void>;
  fetchSessionStats: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Mock data for development
const mockSessions: PokerSession[] = [
  {
    id: '1',
    userId: 'user1',
    sessionType: SessionType.LIVE_CASINO,
    venue: 'Bellagio Casino',
    address: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
    latitude: 36.1126,
    longitude: -115.1767,
    totalBuyIn: 500,
    cashOut: 750,
    profit: 250,
    startTime: new Date('2024-01-15T20:00:00'),
    endTime: new Date('2024-01-16T02:30:00'),
    duration: 390,
    gameType: "No Limit Hold'em",
    stakes: '2/5',
    handsPlayed: 185,
    notes: 'Great table dynamics, very profitable session',
    isActive: false,
    isComplete: true,
    updateStatus: true,
    notifyFriends: true,
    includeInStats: true,
    createdAt: new Date('2024-01-15T20:00:00'),
    updatedAt: new Date('2024-01-16T02:30:00')
  },
  {
    id: '2',
    userId: 'user1',
    sessionType: SessionType.HOME_GAME,
    venue: "John's Home Game",
    address: '123 Poker Street, Austin, TX',
    totalBuyIn: 200,
    cashOut: 150,
    profit: -50,
    startTime: new Date('2024-01-10T19:00:00'),
    endTime: new Date('2024-01-10T23:45:00'),
    duration: 285,
    gameType: "No Limit Hold'em",
    stakes: '1/2',
    handsPlayed: 95,
    notes: 'Fun social game with friends',
    isActive: false,
    isComplete: true,
    updateStatus: true,
    notifyFriends: false,
    includeInStats: true,
    createdAt: new Date('2024-01-10T19:00:00'),
    updatedAt: new Date('2024-01-10T23:45:00')
  }
];

const mockLocationSuggestions: LocationSuggestion[] = [
  {
    venue: 'Bellagio Casino',
    address: '3600 S Las Vegas Blvd, Las Vegas, NV 89109',
    sessionType: SessionType.LIVE_CASINO,
    usageCount: 5
  },
  {
    venue: "John's Home Game",
    address: '123 Poker Street, Austin, TX',
    sessionType: SessionType.HOME_GAME,
    usageCount: 3
  },
  {
    venue: 'Commerce Casino',
    address: '6131 Telegraph Rd, Commerce, CA 90040',
    sessionType: SessionType.LIVE_CASINO,
    usageCount: 2
  }
];

const mockStats: SessionStats = {
  totalSessions: 15,
  totalWinnings: 2450,
  totalHours: 85.5,
  hourlyRate: 28.65,
  biggestWin: 850,
  biggestLoss: -320,
  winRate: 0.67,
  avgSessionLength: 5.7
};

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessions: [],
  activeSession: null,
  locationSuggestions: [],
  sessionStats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,

  // Actions
  createSession: async (sessionData: CreateSessionRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession: PokerSession = {
        id: Date.now().toString(),
        userId: 'user1',
        ...sessionData,
        totalBuyIn: sessionData.initialBuyIn || 0,
        startTime: new Date(),
        isActive: true,
        isComplete: false,
        updateStatus: sessionData.updateStatus ?? true,
        notifyFriends: sessionData.notifyFriends ?? true,
        includeInStats: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set(state => ({
        sessions: [newSession, ...state.sessions],
        activeSession: newSession,
        isCreating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create session',
        isCreating: false 
      });
    }
  },

  endSession: async (sessionId: string, endData: EndSessionRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        sessions: state.sessions.map(session => 
          session.id === sessionId 
            ? {
                ...session,
                ...endData,
                profit: endData.cashOut - endData.totalBuyIn,
                endTime: new Date(),
                isActive: false,
                isComplete: true,
                includeInStats: (endData.duration || 0) >= 2,
                updatedAt: new Date()
              }
            : session
        ),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to end session',
        isUpdating: false 
      });
    }
  },

  updateSession: async (sessionId: string, updateData: UpdateSessionRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        sessions: state.sessions.map(session => 
          session.id === sessionId 
            ? {
                ...session,
                ...updateData,
                profit: updateData.cashOut && updateData.totalBuyIn 
                  ? updateData.cashOut - updateData.totalBuyIn 
                  : session.profit,
                updatedAt: new Date()
              }
            : session
        ),
        activeSession: state.activeSession?.id === sessionId 
          ? { ...state.activeSession, ...updateData, updatedAt: new Date() }
          : state.activeSession,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update session',
        isUpdating: false 
      });
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        sessions: state.sessions.filter(session => session.id !== sessionId),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
        isUpdating: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isUpdating: false 
      });
    }
  },

  fetchSessions: async (filter?: SessionFilter) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredSessions = [...mockSessions];
      
      if (filter) {
        if (filter.sessionType) {
          filteredSessions = filteredSessions.filter(s => s.sessionType === filter.sessionType);
        }
        if (filter.venue) {
          filteredSessions = filteredSessions.filter(s => 
            s.venue?.toLowerCase().includes(filter.venue!.toLowerCase())
          );
        }
        if (filter.dateFrom) {
          filteredSessions = filteredSessions.filter(s => s.startTime >= filter.dateFrom!);
        }
        if (filter.dateTo) {
          filteredSessions = filteredSessions.filter(s => s.startTime <= filter.dateTo!);
        }
      }
      
      set({ 
        sessions: filteredSessions,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false 
      });
    }
  },

  fetchActiveSession: async () => {
    try {
      // Mock API call to check for active session
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const activeSession = mockSessions.find(s => s.isActive);
      set({ activeSession: activeSession || null });
    } catch (error) {
      set({ error: 'Failed to fetch active session' });
    }
  },

  fetchLocationSuggestions: async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 200));
      set({ locationSuggestions: mockLocationSuggestions });
    } catch (error) {
      set({ error: 'Failed to fetch location suggestions' });
    }
  },

  fetchSessionStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ 
        sessionStats: mockStats,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
  
  reset: () => set({
    sessions: [],
    activeSession: null,
    locationSuggestions: [],
    sessionStats: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    error: null
  })
}));