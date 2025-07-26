export interface PlayerRange {
  id: string;
  userId: string;
  playerName?: string;
  round: RangeRound;
  label?: string;
  hands: string[];
  color: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  name: string;
  ranges: PlayerRange[];
  lastUsed: Date;
}

export enum RangeRound {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river'
}

export interface HandCombination {
  hand: string;
  suited: boolean;
  rank1: string;
  rank2: string;
  position: {
    row: number;
    col: number;
  };
}

export interface RangeSelection {
  selectedHands: Set<string>;
  color: string;
}

export interface CreatePlayerRangeRequest {
  playerName?: string;
  round: RangeRound;
  label?: string;
  hands: string[];
  color: string;
  notes?: string;
}

export interface UpdatePlayerRangeRequest {
  hands?: string[];
  color?: string;
  label?: string;
  notes?: string;
}

export interface EqualizeRangeRequest {
  baseHand: string;
  includeWeaker: boolean;
}