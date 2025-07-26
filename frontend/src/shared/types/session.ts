export enum SessionType {
  LIVE_CASINO = 'LIVE_CASINO',
  HOME_GAME = 'HOME_GAME',
  ONLINE = 'ONLINE',
  OTHER = 'OTHER'
}

export enum PlayingStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  PLAYING = 'PLAYING'
}

export interface PokerSession {
  id: string;
  userId: string;
  
  // Session Details
  sessionType: SessionType;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Financial Tracking
  initialBuyIn?: number;
  totalBuyIn: number;
  cashOut?: number;
  profit?: number;
  
  // Session Timing
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  
  // Game Details
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  
  // Status & Controls
  isActive: boolean;
  isComplete: boolean;
  updateStatus: boolean;
  notifyFriends: boolean;
  includeInStats: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionRequest {
  sessionType: SessionType;
  venue?: string;
  address?: string;
  initialBuyIn?: number;
  gameType?: string;
  stakes?: string;
  updateStatus?: boolean;
  notifyFriends?: boolean;
}

export interface EndSessionRequest {
  totalBuyIn: number;
  cashOut: number;
  duration?: number;
  handsPlayed?: number;
  notes?: string;
}

export interface UpdateSessionRequest {
  venue?: string;
  address?: string;
  totalBuyIn?: number;
  cashOut?: number;
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  duration?: number;
}

export interface LocationSuggestion {
  venue: string;
  address?: string;
  sessionType: SessionType;
  usageCount: number;
}

export interface SessionFilter {
  sessionType?: SessionType;
  dateFrom?: Date;
  dateTo?: Date;
  minProfit?: number;
  maxProfit?: number;
  venue?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalWinnings: number;
  totalHours: number;
  hourlyRate: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number;
  avgSessionLength: number;
}