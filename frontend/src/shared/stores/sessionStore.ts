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
import { sessionApi, BuyInData, EndSessionData } from '../services/apiService';

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
  addBuyIn: (sessionId: string, buyInData: BuyInData) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  fetchSessions: (page?: number, limit?: number, active?: boolean) => Promise<void>;
  fetchSession: (sessionId: string) => Promise<void>;
  fetchActiveSession: () => Promise<void>;
  fetchLocationSuggestions: () => Promise<void>;
  fetchSessionStats: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}


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
      const response = await sessionApi.createSession(sessionData);
      
      if (response.success && response.data) {
        set(state => ({
          sessions: [response.data!, ...state.sessions],
          activeSession: response.data!,
          isCreating: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to create session',
          isCreating: false 
        });
      }
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
      const response = await sessionApi.endSession(sessionId, endData);
      
      if (response.success && response.data) {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? response.data! : session
          ),
          activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
          isUpdating: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to end session',
          isUpdating: false 
        });
      }
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
      const response = await sessionApi.updateSession(sessionId, updateData);
      
      if (response.success && response.data) {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? response.data! : session
          ),
          activeSession: state.activeSession?.id === sessionId 
            ? response.data! : state.activeSession,
          isUpdating: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to update session',
          isUpdating: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update session',
        isUpdating: false 
      });
    }
  },

  addBuyIn: async (sessionId: string, buyInData: BuyInData) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await sessionApi.addBuyIn(sessionId, buyInData);
      
      if (response.success && response.data) {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? response.data! : session
          ),
          activeSession: state.activeSession?.id === sessionId 
            ? response.data! : state.activeSession,
          isUpdating: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to add buy-in',
          isUpdating: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add buy-in',
        isUpdating: false 
      });
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await sessionApi.deleteSession(sessionId);
      
      if (response.success) {
        set(state => ({
          sessions: state.sessions.filter(session => session.id !== sessionId),
          activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
          isUpdating: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to delete session',
          isUpdating: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isUpdating: false 
      });
    }
  },

  fetchSessions: async (page: number = 1, limit: number = 10, active?: boolean) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await sessionApi.getSessions(page, limit, active);
      
      if (response.success && response.data) {
        set({ 
          sessions: response.data.sessions,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch sessions',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        isLoading: false 
      });
    }
  },

  fetchSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await sessionApi.getSession(sessionId);
      
      if (response.success && response.data) {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? response.data! : session
          ),
          isLoading: false
        }));
      } else {
        set({ 
          error: response.message || 'Failed to fetch session',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch session',
        isLoading: false 
      });
    }
  },

  fetchActiveSession: async () => {
    try {
      const response = await sessionApi.getSessions(1, 1, true);
      
      if (response.success && response.data && response.data.sessions.length > 0) {
        set({ activeSession: response.data.sessions[0] });
      } else {
        set({ activeSession: null });
      }
    } catch (error) {
      set({ error: 'Failed to fetch active session' });
    }
  },

  fetchLocationSuggestions: async () => {
    try {
      const response = await sessionApi.getLocationSuggestions();
      
      if (response.success && response.data) {
        set({ locationSuggestions: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch location suggestions' });
      }
    } catch (error) {
      set({ error: 'Failed to fetch location suggestions' });
    }
  },

  fetchSessionStats: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await sessionApi.getSessionStats();
      
      if (response.success && response.data) {
        set({ 
          sessionStats: response.data,
          isLoading: false 
        });
      } else {
        set({ 
          error: response.message || 'Failed to fetch stats',
          isLoading: false 
        });
      }
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