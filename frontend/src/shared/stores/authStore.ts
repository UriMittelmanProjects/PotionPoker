import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User interface representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  playingStatus?: string;
  currentLocation?: string;
  statusVisibility: 'public' | 'friends' | 'private';
  totalSessions: number;
  totalWinnings: number;
}

/**
 * Auth store state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Auth store actions interface
 */
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

type AuthStore = AuthState & AuthActions;

// Constants for storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Auth store using Zustand for state management
 * Handles authentication state, token persistence, and auth actions
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  /**
   * Login user with email and password
   * Stores token and user data in AsyncStorage
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { token, user } = await response.json();
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Register new user account
   * Automatically logs in user after successful registration
   */
  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const { token, user } = await response.json();
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      set({ 
        token, 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Logout user and clear stored authentication data
   */
  logout: async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      
      // Reset state
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Load stored authentication data from AsyncStorage
   * Called on app startup to restore user session
   */
  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const [token, userJson] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
      
      if (token[1] && userJson[1]) {
        const user = JSON.parse(userJson[1]);
        set({ 
          token: token[1], 
          user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load auth error:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Send forgot password email
   */
  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Reset email failed',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual API call when backend is ready
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Clear any auth errors
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Update user data in store and AsyncStorage
   */
  updateUser: async (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));