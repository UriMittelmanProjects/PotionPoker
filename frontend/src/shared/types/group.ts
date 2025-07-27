import { SessionType } from './session';
import { User } from './user';

export enum GroupRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}


export interface Group {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  adminId: string;
  admin: User;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  sessionCount: number;
  totalVolume: number; // Total money volume played in group
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  user: User;
  role: GroupRole;
  joinedAt: Date;
}

export interface GroupSession {
  id: string;
  groupId: string;
  group: Group;
  sessionType: SessionType;
  venue: string;
  address?: string;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  playerCount: number;
  totalBuyIn: number;
  totalCashOut: number;
}

export interface GroupSessionPlayer {
  id: string;
  groupSessionId: string;
  userId: string;
  user: User;
  buyIn: number;
  cashOut?: number;
  profit?: number;
  notes?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  isPrivate: boolean;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface CreateGroupSessionRequest {
  sessionType: SessionType;
  venue: string;
  address?: string;
  notes?: string;
}

export interface JoinGroupSessionRequest {
  buyIn: number;
  notes?: string;
}

export interface EndGroupSessionRequest {
  cashOut: number;
  notes?: string;
}

export interface GroupInviteLink {
  id: string;
  groupId: string;
  token: string;
  createdBy: string;
  expiresAt: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface GroupStats {
  totalSessions: number;
  totalVolume: number;
  avgSessionLength: number;
  mostActivePlayer: {
    user: User;
    sessionCount: number;
  };
  biggestWinner: {
    user: User;
    totalProfit: number;
  };
  recentActivity: GroupSessionSummary[];
}

export interface GroupSessionSummary {
  sessionId: string;
  venue: string;
  date: Date;
  playerCount: number;
  totalVolume: number;
  duration?: number;
  topWinner?: {
    user: User;
    profit: number;
  };
}

export interface PlayerStats {
  userId: string;
  user: User;
  totalSessions: number;
  totalBuyIn: number;
  totalCashOut: number;
  totalProfit: number;
  avgSessionLength: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
}