export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  category: string;
  liquidity: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string; // JSON string array, e.g., '["Yes", "No"]'
  outcomePrices: string | null; // JSON string array, e.g., '["0.52", "0.48"]'
  volume: string;
  active: boolean;
  closed: boolean;
  marketType: string;
  liquidityNum: number;
  volumeNum: number;
  volume24hr: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
}

export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  liquidityClob: number;
  volume: number;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  volume1yr: number;
  openInterest: number;
  category: string;
  markets: PolymarketMarket[];
  commentCount: number;
}

export interface PolymarketEventsResponse {
  events: PolymarketEvent[];
  total?: number;
}

export interface PolymarketSearchTag {
  id: string;
  label: string;
  slug: string;
}

export interface PolymarketSearchResponse {
  events: PolymarketEvent[];
  tags: PolymarketSearchTag[];
  totalEvents: number;
}

// Helper to parse outcome prices from JSON string
export function parseOutcomePrices(outcomePrices: string | null): number[] | null {
  if (!outcomePrices) return null;
  try {
    return JSON.parse(outcomePrices);
  } catch {
    return null;
  }
}

// Helper to parse outcomes from JSON string
export function parseOutcomes(outcomes: string): string[] {
  try {
    return JSON.parse(outcomes);
  } catch {
    return [];
  }
}
