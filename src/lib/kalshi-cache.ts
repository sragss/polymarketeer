import type { KalshiMarket, KalshiMarketsResponse } from '@/types/kalshi';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

interface CacheEntry {
  markets: KalshiMarket[];
  timestamp: number;
  fetchPromise?: Promise<KalshiMarket[]> | null;
}

class KalshiMarketCache {
  private cache: CacheEntry | null = null;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private async fetchAllMarkets(): Promise<KalshiMarket[]> {
    const allMarkets: KalshiMarket[] = [];
    let cursor: string | null = null;

    // Fetch all open markets using cursor pagination
    do {
      const params = new URLSearchParams({
        limit: '1000',
        status: 'open',
      });

      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await fetch(
        `${KALSHI_API_BASE}/markets?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Kalshi API responded with status: ${response.status}`);
      }

      const data: KalshiMarketsResponse = await response.json();
      allMarkets.push(...data.markets);
      cursor = data.cursor;
    } while (cursor);

    return allMarkets;
  }

  async getMarkets(): Promise<KalshiMarket[]> {
    const now = Date.now();

    // Return cached data if valid
    if (this.cache && now - this.cache.timestamp < this.TTL) {
      return this.cache.markets;
    }

    // If a fetch is already in progress, wait for it
    if (this.cache?.fetchPromise) {
      return this.cache.fetchPromise;
    }

    // Start new fetch
    const fetchPromise = this.fetchAllMarkets();

    // Store promise to prevent duplicate fetches
    if (!this.cache) {
      this.cache = {
        markets: [],
        timestamp: now,
        fetchPromise,
      };
    } else {
      this.cache.fetchPromise = fetchPromise;
    }

    try {
      const markets = await fetchPromise;
      this.cache = {
        markets,
        timestamp: Date.now(),
        fetchPromise: null,
      };
      return markets;
    } catch (error) {
      // Clear promise on error
      if (this.cache) {
        this.cache.fetchPromise = null;
      }
      throw error;
    }
  }

  invalidate(): void {
    this.cache = null;
  }
}

// Singleton instance
export const kalshiCache = new KalshiMarketCache();
