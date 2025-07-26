import { PokerSession, User, Group, SessionType } from './index';

export interface DashboardData {
  recentSessions: PokerSession[];
  activeSessions: PokerSession[];
  pendingGroupSessions: PendingGroupSession[];
  friendActivity: FriendActivity[];
  performanceSummary: PerformanceSummary;
  quickStats: QuickStats;
}

export interface FriendActivity {
  id: string;
  user: User;
  type: ActivityType;
  message: string;
  timestamp: Date;
  location?: string;
  canJoin?: boolean;
  sessionId?: string;
}

export enum ActivityType {
  SESSION_STARTED = 'SESSION_STARTED',
  SESSION_ENDED = 'SESSION_ENDED',
  BIG_WIN = 'BIG_WIN',
  BIG_LOSS = 'BIG_LOSS',
  JOIN_REQUEST = 'JOIN_REQUEST',
  LOCATION_CHECKIN = 'LOCATION_CHECKIN'
}

export interface PendingGroupSession {
  id: string;
  group: Group;
  venue: string;
  startTime: Date;
  playerCount: number;
  hasJoined: boolean;
  canJoin: boolean;
}

export interface PerformanceSummary {
  last7Days: {
    sessions: number;
    profit: number;
    hours: number;
  };
  last30Days: {
    sessions: number;
    profit: number;
    hours: number;
  };
  currentMonth: {
    sessions: number;
    profit: number;
    hours: number;
  };
  chartData: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  profit: number;
  sessions: number;
}

export interface QuickStats {
  totalSessions: number;
  totalProfit: number;
  bestMonth: {
    month: string;
    profit: number;
  };
  currentStreak: {
    type: 'winning' | 'losing';
    count: number;
  };
  favoriteVenue: string;
  totalHours: number;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  action: () => void;
  disabled?: boolean;
}

export interface NotificationData {
  id: string;
  type: 'friend_activity' | 'group_session' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionable?: boolean;
}