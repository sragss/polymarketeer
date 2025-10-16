import type {
  KalshiMarket,
  KalshiEvent,
  KalshiEventSummary,
  KalshiEventDetails,
  KalshiMarketDetails,
  KalshiSearchResult,
} from '@/types/kalshi';

export function formatVolumeDollars(cents: string | number): string {
  const dollars = typeof cents === 'string' ? parseFloat(cents) / 100 : cents / 100;

  if (dollars === 0) return '$0';
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2)}M`;
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(1)}K`;
  }
  return `$${dollars.toFixed(0)}`;
}

export function formatKalshiPrice(price: string): string {
  // Price is in dollars (e.g., "0.51" = 51 cents = 51% probability)
  const cents = parseFloat(price) * 100;
  return `${cents.toFixed(1)}¢`;
}

export function formatKalshiOdds(yesBid: string, yesAsk: string): string {
  const bidCents = parseFloat(yesBid) * 100;
  const askCents = parseFloat(yesAsk) * 100;
  return `Yes: ${bidCents.toFixed(1)}¢-${askCents.toFixed(1)}¢`;
}

export function calculateRelevanceScore(market: KalshiMarket, query: string): number {
  const lowerQuery = query.toLowerCase();
  const titleLower = market.title.toLowerCase();
  const subtitleLower = market.subtitle.toLowerCase();
  const tickerLower = market.ticker.toLowerCase();

  let score = 0;

  // Exact ticker match
  if (tickerLower === lowerQuery) {
    score += 100;
  }

  // Title exact match
  if (titleLower === lowerQuery) {
    score += 50;
  }

  // Title contains query
  if (titleLower.includes(lowerQuery)) {
    score += 25;
  }

  // Subtitle contains query
  if (subtitleLower.includes(lowerQuery)) {
    score += 15;
  }

  // Ticker contains query
  if (tickerLower.includes(lowerQuery)) {
    score += 10;
  }

  // Word-level matching for multi-word queries
  const queryWords = lowerQuery.split(/\s+/);
  for (const word of queryWords) {
    if (word.length < 3) continue; // Skip short words

    if (titleLower.includes(word)) score += 5;
    if (subtitleLower.includes(word)) score += 3;
  }

  // Boost by volume (higher volume = more relevant)
  const volume24h = parseFloat(market.volume_24h);
  if (volume24h > 100000) score += 10; // $1000+
  if (volume24h > 10000) score += 5;   // $100+

  return score;
}

export function formatSearchResult(market: KalshiMarket): KalshiSearchResult {
  return {
    ticker: market.ticker,
    eventTicker: market.event_ticker,
    title: market.title,
    subtitle: market.subtitle,
    category: market.category || 'Uncategorized',
    yesPrice: formatKalshiPrice(market.yes_ask),
    volume24h: formatVolumeDollars(market.volume_24h),
    status: market.status,
    url: `https://kalshi.com/markets/${market.ticker}`,
    relevanceScore: 0, // Set by search function
  };
}

export function formatEventSummary(
  event: KalshiEvent,
  markets: KalshiMarket[]
): KalshiEventSummary {
  const topMarket = markets[0];
  const totalVolume24h = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume_24h),
    0
  );

  return {
    eventTicker: event.event_ticker,
    title: event.title,
    category: event.category || 'Uncategorized',
    marketCount: markets.length,
    topMarketTitle: topMarket?.title || 'No markets',
    topMarketYesPrice: topMarket ? formatKalshiPrice(topMarket.yes_ask) : 'N/A',
    volume24h: formatVolumeDollars(totalVolume24h),
    url: `https://kalshi.com/events/${event.event_ticker}`,
  };
}

export function formatMarketDetails(market: KalshiMarket): KalshiMarketDetails {
  return {
    ticker: market.ticker,
    title: market.title,
    subtitle: market.subtitle,
    status: market.status,
    yesPrice: formatKalshiPrice(market.last_price || market.yes_ask),
    yesBid: formatKalshiPrice(market.yes_bid),
    yesAsk: formatKalshiPrice(market.yes_ask),
    volume: formatVolumeDollars(market.volume),
    volume24h: formatVolumeDollars(market.volume_24h),
    liquidity: formatVolumeDollars(market.liquidity),
    openInterest: formatVolumeDollars(market.open_interest),
    openTime: market.open_time,
    closeTime: market.close_time,
    expectedExpirationTime: market.expected_expiration_time,
    url: `https://kalshi.com/markets/${market.ticker}`,
  };
}

export function formatEventDetails(
  event: KalshiEvent,
  markets: KalshiMarket[]
): KalshiEventDetails {
  const totalVolume24h = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume_24h),
    0
  );

  return {
    eventTicker: event.event_ticker,
    seriesTicker: event.series_ticker,
    title: event.title,
    subtitle: event.sub_title,
    category: event.category || 'Uncategorized',
    strikeDate: event.strike_date,
    mutuallyExclusive: event.mutually_exclusive,
    marketCount: markets.length,
    totalVolume24h: formatVolumeDollars(totalVolume24h),
    url: `https://kalshi.com/events/${event.event_ticker}`,
    markets: markets.map(formatMarketDetails),
  };
}
