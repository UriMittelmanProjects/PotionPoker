import { SessionType } from './session';

export interface Location {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  sessionType: SessionType;
  sessionCount: number;
  totalProfit: number;
  totalHours: number;
  hourlyRate: number;
  lastVisited: Date;
  isUserLocation: boolean;
}

export interface LocationSession {
  id: string;
  sessionId: string;
  locationId: string;
  venue: string;
  profit: number;
  duration: number;
  date: Date;
  stakes?: string;
  gameType?: string;
}

export interface LocationStats {
  totalSessions: number;
  totalProfit: number;
  totalHours: number;
  hourlyRate: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
  avgSessionLength: number;
  favoriteStakes?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LocationFilter {
  sessionType?: SessionType;
  minProfit?: number;
  maxProfit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  showUserLocationsOnly?: boolean;
}

export enum LocationPinType {
  USER_LIVE_CASINO = 'USER_LIVE_CASINO',
  USER_HOME_GAME = 'USER_HOME_GAME', 
  USER_OTHER = 'USER_OTHER',
  NEARBY_CASINO = 'NEARBY_CASINO',
  NEARBY_POKER_ROOM = 'NEARBY_POKER_ROOM'
}

export interface LocationPin {
  id: string;
  latitude: number;
  longitude: number;
  type: LocationPinType;
  location?: Location;
  title: string;
  subtitle?: string;
  color: string;
}

export interface NearbyVenue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  venueType: 'casino' | 'poker_room' | 'card_room';
  distance: number;
  rating?: number;
  hasPoker: boolean;
}