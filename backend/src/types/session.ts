export interface CreateSessionRequest {
  sessionType: 'live_casino' | 'home_game' | 'online' | 'other';
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  initialBuyIn?: number;
  updateStatus?: boolean;
  notifyFriends?: boolean;
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

export interface AddBuyInRequest {
  amount: number;
}

export interface EndSessionRequest {
  cashOut: number;
  handsPlayed?: number;
  notes?: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  sessionType: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  totalBuyIn: number;
  cashOut?: number;
  profit?: number;
  gameType?: string;
  stakes?: string;
  handsPlayed?: number;
  notes?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isActive: boolean;
  isComplete: boolean;
  updateStatus: boolean;
  notifyFriends: boolean;
  createdAt: string;
  updatedAt: string;
  buyIns: BuyInResponse[];
}

export interface BuyInResponse {
  id: string;
  sessionId: string;
  amount: number;
  timestamp: string;
}

export interface LocationSuggestion {
  venue: string;
  address?: string;
  sessionCount: number;
  sessionType: string;
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