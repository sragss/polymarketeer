import type { PolymarketEvent, PolymarketMarket } from '@/types/polymarket';

/**
 * Format volume number to readable string
 * @example formatVolume(1500000) => "$1.50M"
 */
export function formatVolume(volume: number | null | undefined): string {
  if (!volume || volume === 0) return '$0';
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

/**
 * Format outcome prices to human-readable odds
 * @example formatOdds('["0.52", "0.48"]', '["Yes", "No"]') => "Yes: 52.0%, No: 48.0%"
 */
export function formatOdds(
  outcomePrices: string | null,
  outcomes: string
): string {
  if (!outcomePrices) return 'N/A';

  try {
    const prices: number[] = JSON.parse(outcomePrices);
    const outcomeLabels: string[] = JSON.parse(outcomes);

    return prices
      .map((price, i) => {
        const label = outcomeLabels[i] || `Option ${i + 1}`;
        const percentage = (price * 100).toFixed(1);
        return `${label}: ${percentage}%`;
      })
      .join(', ');
  } catch {
    return 'N/A';
  }
}

/**
 * Format event for summary display (used in search/browse results)
 */
export function formatEventSummary(event: PolymarketEvent) {
  const topMarket = event.markets[0];

  return {
    eventId: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category || 'Uncategorized',
    topMarket: topMarket?.question || 'No markets',
    odds: topMarket
      ? formatOdds(topMarket.outcomePrices, topMarket.outcomes)
      : 'N/A',
    volume24hr: formatVolume(event.volume24hr),
    url: `https://polymarket.com/event/${event.slug}`,
  };
}

/**
 * Format market for detailed display
 */
export function formatMarketDetails(market: PolymarketMarket) {
  return {
    marketId: market.id,
    question: market.question,
    outcomes: JSON.parse(market.outcomes) as string[],
    odds: market.outcomePrices
      ? (JSON.parse(market.outcomePrices) as number[])
      : null,
    oddsFormatted: formatOdds(market.outcomePrices, market.outcomes),
    volume: formatVolume(market.volumeNum),
    closed: market.closed,
    active: market.active,
    endDate: market.endDate,
  };
}

/**
 * Format full event for detailed display
 */
export function formatEventDetails(event: PolymarketEvent) {
  return {
    eventId: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    category: event.category || 'Uncategorized',
    volume: formatVolume(event.volume),
    volume24hr: formatVolume(event.volume24hr),
    liquidity: formatVolume(event.liquidity),
    endDate: event.endDate,
    closed: event.closed,
    active: event.active,
    url: `https://polymarket.com/event/${event.slug}`,
    marketCount: event.markets.length,
    markets: event.markets.map(formatMarketDetails),
  };
}
