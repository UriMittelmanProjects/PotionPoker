/**
 * Range Utilities
 * 
 * Utilities for poker range calculations including hand rankings,
 * equalize range functionality, and hand parsing.
 */

export interface HandRank {
  hand: string;
  rank: number;
  category: 'pair' | 'suited' | 'offsuit';
}

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const getRankValue = (rank: string): number => {
  const index = ranks.indexOf(rank);
  return index === -1 ? 0 : 13 - index;
};

/**
 * Get numerical rank for a poker hand for comparison purposes
 */
export const getHandRank = (hand: string): HandRank => {
  if (hand.length < 2) {
    return { hand, rank: 0, category: 'offsuit' };
  }
  
  const rank1 = hand[0];
  const rank2 = hand[1];
  const suited = hand.includes('s');
  const isPair = rank1 === rank2;
  
  const value1 = getRankValue(rank1);
  const value2 = getRankValue(rank2);
  
  let category: 'pair' | 'suited' | 'offsuit';
  let rank: number;
  
  if (isPair) {
    category = 'pair';
    rank = 1000 + value1;
  } else if (suited) {
    category = 'suited';
    const highCard = Math.max(value1, value2);
    const lowCard = Math.min(value1, value2);
    rank = 500 + (highCard * 13) + lowCard;
  } else {
    category = 'offsuit';
    const highCard = Math.max(value1, value2);
    const lowCard = Math.min(value1, value2);
    rank = (highCard * 13) + lowCard;
  }
  
  return { hand, rank, category };
};

/**
 * Generate all possible poker hands in order of strength
 */
export const getAllHands = (): string[] => {
  const hands: string[] = [];
  
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const rank1 = ranks[i];
      const rank2 = ranks[j];
      
      if (i === j) {
        hands.push(`${rank1}${rank2}`);
      } else if (i < j) {
        hands.push(`${rank1}${rank2}s`);
      } else {
        hands.push(`${rank1}${rank2}o`);
      }
    }
  }
  
  return hands.sort((a, b) => getHandRank(b).rank - getHandRank(a).rank);
};

/**
 * Get all hands equal or better than the specified hand
 */
export const getEqualOrBetterHands = (baseHand: string): string[] => {
  const baseRank = getHandRank(baseHand);
  const allHands = getAllHands();
  
  return allHands.filter(hand => {
    const handRank = getHandRank(hand);
    return handRank.rank >= baseRank.rank;
  });
};

/**
 * Get all hands equal or worse than the specified hand
 */
export const getEqualOrWorseHands = (baseHand: string): string[] => {
  const baseRank = getHandRank(baseHand);
  const allHands = getAllHands();
  
  return allHands.filter(hand => {
    const handRank = getHandRank(hand);
    return handRank.rank <= baseRank.rank;
  });
};

/**
 * Parse hand string to extract rank information
 */
export const parseHand = (hand: string): { rank1: string; rank2: string; suited: boolean; isPair: boolean } => {
  const rank1 = hand[0];
  const rank2 = hand[1];
  const suited = hand.includes('s');
  const isPair = rank1 === rank2;
  
  return { rank1, rank2, suited, isPair };
};

/**
 * Format hand for display
 */
export const formatHand = (rank1: string, rank2: string, suited: boolean): string => {
  if (rank1 === rank2) {
    return `${rank1}${rank2}`;
  }
  
  return suited ? `${rank1}${rank2}s` : `${rank1}${rank2}o`;
};

/**
 * Get hand strength category
 */
export const getHandCategory = (hand: string): string => {
  const { rank1, rank2, suited, isPair } = parseHand(hand);
  
  if (isPair) {
    return 'Pocket Pair';
  } else if (suited) {
    return 'Suited';
  } else {
    return 'Offsuit';
  }
};

/**
 * Calculate range percentage from selected hands
 */
export const calculateRangePercentage = (selectedHands: Set<string>): number => {
  const totalHands = 169; // Total unique starting hands in poker
  return (selectedHands.size / totalHands) * 100;
};