export enum SessionType {
  LIVE_CASINO = 'live_casino',
  HOME_GAME = 'home_game',
  ONLINE = 'online',
  OTHER = 'other'
}

export enum PlayingStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  PLAYING = 'PLAYING'
}

export interface BuyIn {
  id: string;
  sessionId: string;
  amount: number;
  timestamp: string;
}

export interface PokerSession {
  id: string;
  userId: string;
  
  // Session Details
  sessionType: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Financial Tracking
  totalBuyIn: number;
  cashOut?: number;
  profit?: number;
  
  // Session Timing
  startTime: string;
  endTime?: string;
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
  
  createdAt: string;
  updatedAt: string;
  buyIns: BuyIn[];
}

export interface CreateSessionRequest {
  sessionType: SessionType;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  initialBuyIn?: number;
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  updateStatus?: boolean;
  notifyFriends?: boolean;
}

export interface EndSessionRequest {
  cashOut: number;
  handsPlayed?: number;
  notes?: string;
}

export interface UpdateSessionRequest {
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  updateStatus?: boolean;
  notifyFriends?: boolean;
}

export interface LocationSuggestion {
  venue: string;
  address?: string;
  sessionType: string;
  sessionCount: number;
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
  completedSessions: number;
  activeSessions: number;
  totalBuyIns: number;
  totalCashOuts: number;
  totalProfit: number;
  averageProfit: number;
  biggestWin: number;
  biggestLoss: number;
  averageSessionLength: number;
  totalHoursPlayed: number;
  hourlyRate: number;
}