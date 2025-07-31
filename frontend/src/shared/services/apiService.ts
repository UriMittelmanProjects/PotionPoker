import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API configuration
 */
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

/**
 * API response interface matching backend format
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * HTTP client configuration
 */
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

/**
 * API client class for handling HTTP requests to backend
 * Automatically handles authentication headers and error responses
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get stored auth token
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Build request headers
   */
  private async buildHeaders(config: RequestConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Add auth token if required
    if (config.requireAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.buildHeaders(config);
      
      const requestConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
      };

      // Add body for non-GET requests
      if (config.body && config.method !== 'GET') {
        requestConfig.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, requestConfig);
      const data = await response.json();

      // Handle non-200 status codes
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Network request failed') {
        return {
          success: false,
          message: 'Network connection failed. Please check your internet connection.',
          error: 'NETWORK_ERROR',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        error: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string, 
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string, 
    body?: any, 
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string, 
    body?: any, 
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    body?: any, 
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

/**
 * Auth API service functions
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    playingStatus: string;
    currentLocation: string | null;
    statusVisibility: string;
    totalSessions: number;
    totalWinnings: number;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/auth/register', userData);
  },

  /**
   * Send forgot password email
   */
  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<LoginResponse['user']>> => {
    return apiClient.get<LoginResponse['user']>('/auth/profile', { requireAuth: true });
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<LoginResponse['user']>): Promise<ApiResponse<LoginResponse['user']>> => {
    return apiClient.put<LoginResponse['user']>('/auth/profile', userData, { requireAuth: true });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>('/auth/logout', {}, { requireAuth: true });
  },
};

/**
 * Session API service functions
 */
import { 
  PokerSession, 
  CreateSessionRequest, 
  EndSessionRequest, 
  UpdateSessionRequest,
  LocationSuggestion,
  SessionStats 
} from '../types/session';

export interface SessionsResponse {
  sessions: PokerSession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BuyInData {
  amount: number;
}

export interface EndSessionData {
  cashOut: number;
  handsPlayed?: number;
  notes?: string;
}

/**
 * Session API service
 */
export const sessionApi = {
  /**
   * Create new session
   */
  createSession: async (sessionData: CreateSessionRequest): Promise<ApiResponse<PokerSession>> => {
    return apiClient.post<PokerSession>('/sessions', sessionData, { requireAuth: true });
  },

  /**
   * Get user's sessions with pagination
   */
  getSessions: async (page: number = 1, limit: number = 10, active?: boolean): Promise<ApiResponse<SessionsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(active !== undefined && { active: active.toString() })
    });
    return apiClient.get<SessionsResponse>(`/sessions?${params}`, { requireAuth: true });
  },

  /**
   * Get specific session
   */
  getSession: async (sessionId: string): Promise<ApiResponse<PokerSession>> => {
    return apiClient.get<PokerSession>(`/sessions/${sessionId}`, { requireAuth: true });
  },

  /**
   * Update session
   */
  updateSession: async (sessionId: string, updateData: UpdateSessionRequest): Promise<ApiResponse<PokerSession>> => {
    return apiClient.put<PokerSession>(`/sessions/${sessionId}`, updateData, { requireAuth: true });
  },

  /**
   * Add buy-in to session
   */
  addBuyIn: async (sessionId: string, buyInData: BuyInData): Promise<ApiResponse<PokerSession>> => {
    return apiClient.post<PokerSession>(`/sessions/${sessionId}/buyin`, buyInData, { requireAuth: true });
  },

  /**
   * End session
   */
  endSession: async (sessionId: string, endData: EndSessionData): Promise<ApiResponse<PokerSession>> => {
    return apiClient.post<PokerSession>(`/sessions/${sessionId}/end`, endData, { requireAuth: true });
  },

  /**
   * Delete session
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(`/sessions/${sessionId}`, { requireAuth: true });
  },

  /**
   * Get location suggestions
   */
  getLocationSuggestions: async (): Promise<ApiResponse<LocationSuggestion[]>> => {
    return apiClient.get<LocationSuggestion[]>('/sessions/location-suggestions', { requireAuth: true });
  },

  /**
   * Get session statistics
   */
  getSessionStats: async (): Promise<ApiResponse<SessionStats>> => {
    return apiClient.get<SessionStats>('/sessions/stats', { requireAuth: true });
  },
};