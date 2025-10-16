import { tool } from 'ai';
import { z } from 'zod';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const search_kalshi_markets = tool({
  description:
    'Search Kalshi prediction markets by keyword or topic. Returns matching markets with prices and volume. Kalshi has NO server-side search - this performs client-side matching against all open markets. Use this for initial discovery when user wants to find Kalshi markets. Returns up to 10 results by default. Each result includes ticker for detailed lookup.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search keywords (e.g., "election", "fed rate", "unemployment"). Matches against market title, subtitle, and ticker.'
      ),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe('Number of markets to return (max 20)'),
    category: z
      .string()
      .optional()
      .describe(
        'Filter by category name (optional). Use list_kalshi_categories to see available categories.'
      ),
  }),
  execute: async ({ query, limit, category }) => {
    const params = new URLSearchParams({
      q: query,
      limit: Math.min(limit, 20).toString(),
    });

    if (category) {
      params.set('category', category);
    }

    const response = await fetch(
      `${BASE_URL}/api/kalshi/markets/search?${params.toString()}`
    );

    if (!response.ok) {
      return {
        error: 'Failed to search Kalshi markets',
        status: response.status,
      };
    }

    const data = await response.json();

    return {
      query: data.query,
      totalResults: data.totalResults,
      markets: data.markets,
      note: 'Use get_kalshi_event_details with event_ticker to see all markets in an event.',
    };
  },
});

export const get_kalshi_event_details = tool({
  description:
    'Get detailed information about a specific Kalshi event including all markets, prices, liquidity, and volume data. Use this when user wants more details about a specific event. Provide the event_ticker from search results or trending results.',
  inputSchema: z.object({
    event_ticker: z
      .string()
      .describe(
        'Event ticker from search/trending results (e.g., "INXD-24DEC31", "FED-24DEC18")'
      ),
  }),
  execute: async ({ event_ticker }) => {
    const response = await fetch(
      `${BASE_URL}/api/kalshi/events/${event_ticker}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: 'Event not found',
          eventTicker: event_ticker,
        };
      }
      return {
        error: 'Failed to fetch event details',
        status: response.status,
      };
    }

    const data = await response.json();
    return data;
  },
});

export const browse_trending_kalshi_markets = tool({
  description:
    'Get currently trending Kalshi markets sorted by 24-hour trading volume. Use when user wants to see popular or active Kalshi markets. Returns top markets by trading activity. Can optionally filter by category.',
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .default(10)
      .describe('Number of trending markets to return (max 20)'),
    category: z
      .string()
      .optional()
      .describe(
        'Filter by category name (e.g., "Politics", "Economics"). Use list_kalshi_categories to see available categories.'
      ),
  }),
  execute: async ({ limit, category }) => {
    const params = new URLSearchParams({
      limit: Math.min(limit, 20).toString(),
    });

    if (category) {
      params.set('category', category);
    }

    const response = await fetch(
      `${BASE_URL}/api/kalshi/markets/trending?${params.toString()}`
    );

    if (!response.ok) {
      if (category) {
        return {
          error: 'Category not found or no markets in this category',
          providedCategory: category,
          message:
            'Use list_kalshi_categories tool to see available categories.',
        };
      }
      return {
        error: 'Failed to fetch trending markets',
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      category: data.category,
      totalResults: data.totalResults,
      markets: data.markets,
      note: 'Use get_kalshi_event_details with event_ticker to see full event details.',
    };
  },
});

export const list_kalshi_categories = tool({
  description:
    "List all available Kalshi categories with event counts. Use when user wants to explore Kalshi categories or doesn't know what to search for. Returns all active categories sorted by event count.",
  inputSchema: z.object({}),
  execute: async () => {
    const response = await fetch(`${BASE_URL}/api/kalshi/categories`);

    if (!response.ok) {
      return {
        error: 'Failed to fetch categories',
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      totalCategories: data.totalCategories,
      categories: data.categories,
      note: 'Use the category name with browse_trending_kalshi_markets or search_kalshi_markets to filter results.',
    };
  },
});

export const kalshiTools = {
  search_kalshi_markets,
  get_kalshi_event_details,
  browse_trending_kalshi_markets,
  list_kalshi_categories,
};
