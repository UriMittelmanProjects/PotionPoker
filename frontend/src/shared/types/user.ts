import { PlayingStatus } from './session';

export enum StatusVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
  PRIVATE = 'PRIVATE'
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  playingStatus: PlayingStatus;
  currentLocation?: string;
  statusVisibility: StatusVisibility;
  showPlayingStatus: boolean;
  totalHands: number;
  totalSessions: number;
  totalWinnings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileStats {
  totalSessions: number;
  totalWinnings: number;
  totalHours: number;
  hourlyRate: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number;
  avgSessionLength: number;
  favoriteVenue?: string;
  mostProfitableVenue?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  statusVisibility?: StatusVisibility;
  showPlayingStatus?: boolean;
}

export interface UpdateStatusRequest {
  playingStatus: PlayingStatus;
  currentLocation?: string;
}