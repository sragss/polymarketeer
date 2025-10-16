// Kalshi API types based on https://api.elections.kalshi.com/trade-api/v2

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: 'binary' | string;
  title: string;
  subtitle: string;
  open_time: string;
  close_time: string;
  expected_expiration_time: string;
  latest_expiration_time: string;
  status: 'open' | 'closed' | 'settled' | string;
  yes_bid: string; // Dollar price (e.g., "0.51" = 51 cents)
  yes_ask: string;
  no_bid: string;
  no_ask: string;
  last_price: string;
  previous_yes_bid: string;
  previous_yes_ask: string;
  previous_no_bid: string;
  previous_no_ask: string;
  volume: string; // Total volume in cents
  volume_24h: string; // 24h volume in cents
  liquidity: string;
  open_interest: string;
  result: string | null;
  can_close_early: boolean;
  expiration_value: string | null;
  category: string; // Often empty, need to join with event
  risk_limit_cents: string;
  strike_type: string | null;
  floor_strike: string | null;
  cap_strike: string | null;
  expiration_time: string | null;
  settlement_timer_seconds: number | null;
  rules_primary: string;
  rules_secondary: string;
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  mutually_exclusive: boolean;
  category: string; // Events have categories
  strike_date: string;
  strike_period: string | null;
}

export interface KalshiEventDetailResponse {
  event: KalshiEvent;
  markets: KalshiMarket[];
}

export interface KalshiMarketsResponse {
  cursor: string | null;
  markets: KalshiMarket[];
}

export interface KalshiEventsResponse {
  cursor: string | null;
  events: KalshiEvent[];
}

export interface KalshiCategory {
  name: string;
  eventCount: number;
}

// Helper type for search results
export interface KalshiSearchResult {
  ticker: string;
  eventTicker: string;
  title: string;
  subtitle: string;
  category: string;
  yesPrice: string;
  volume24h: string;
  status: string;
  url: string;
  relevanceScore: number;
}

// Helper type for event summary (similar to Polymarket)
export interface KalshiEventSummary {
  eventTicker: string;
  title: string;
  category: string;
  marketCount: number;
  topMarketTitle: string;
  topMarketYesPrice: string;
  volume24h: string;
  url: string;
}

// Helper type for detailed event (similar to Polymarket)
export interface KalshiEventDetails {
  eventTicker: string;
  seriesTicker: string;
  title: string;
  subtitle: string;
  category: string;
  strikeDate: string;
  mutuallyExclusive: boolean;
  marketCount: number;
  totalVolume24h: string;
  url: string;
  markets: KalshiMarketDetails[];
}

export interface KalshiMarketDetails {
  ticker: string;
  title: string;
  subtitle: string;
  status: string;
  yesPrice: string;
  yesBid: string;
  yesAsk: string;
  volume: string;
  volume24h: string;
  liquidity: string;
  openInterest: string;
  openTime: string;
  closeTime: string;
  expectedExpirationTime: string;
  url: string;
}
