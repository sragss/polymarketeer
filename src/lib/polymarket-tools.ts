import { tool } from 'ai';
import { z } from 'zod';
import type { PolymarketEvent } from '@/types/polymarket';
import type { PolymarketTag } from '@/app/api/polymarket/tags/route';
import {
  formatEventSummary,
  formatEventDetails,
} from './polymarket-formatters';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Tool 1: Search markets by keyword
 * Primary discovery tool - returns summary-level results
 */
export const search_markets = tool({
  description:
    'Search Polymarket prediction markets by keyword or topic. Returns a summary of matching events with basic odds and volume. Use this for initial discovery when user wants to find markets. Returns up to 10 results by default. Each result includes event ID for detailed lookup.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        'Search keywords (e.g., "trump election", "bitcoin price", "AI regulations")'
      ),
    open_only: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'Only show open/active markets that can be traded (default: true)'
      ),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe('Number of events to return (max 20)'),
  }),
  execute: async ({ query, open_only, limit }) => {
    const params = new URLSearchParams({
      q: query,
      open_only: open_only.toString(),
      limit_per_type: Math.min(limit, 20).toString(),
    });

    const response = await fetch(
      `${BASE_URL}/api/polymarket/search?${params.toString()}`
    );

    if (!response.ok) {
      return {
        error: 'Failed to search markets',
        message: 'Search API returned an error',
      };
    }

    const data = await response.json();
    const events: PolymarketEvent[] = data.events || [];

    return {
      totalResults: data.totalEvents || events.length,
      resultsReturned: events.length,
      events: events.map(formatEventSummary),
    };
  },
});

/**
 * Tool 2: Get detailed information about a specific event
 * Deep dive tool - returns full event data with all markets
 */
export const get_event_details = tool({
  description:
    'Get detailed information about a specific Polymarket event including all markets, full odds, liquidity, and volume data. Use this when user wants more details about a specific event from search results. Provide the eventId or slug from search results.',
  inputSchema: z.object({
    event_id: z
      .string()
      .describe(
        'Event ID or slug from search results (e.g., "56527" or "bitcoin-above-on-october-15")'
      ),
  }),
  execute: async ({ event_id }) => {
    const response = await fetch(
      `${BASE_URL}/api/polymarket/events/${event_id}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          error: 'Event not found',
          eventId: event_id,
        };
      }
      return {
        error: 'Failed to fetch event details',
        message: 'Event API returned an error',
      };
    }

    const event: PolymarketEvent = await response.json();
    return formatEventDetails(event);
  },
});

/**
 * Tool 3: Browse trending markets
 * Discovery tool - shows popular markets sorted by volume
 */
export const browse_trending_markets = tool({
  description:
    'Get currently trending Polymarket events sorted by 24-hour trading volume. Use when user wants to see popular or trending markets. Returns top events by activity. Can optionally filter by category.',
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .default(10)
      .describe('Number of trending events to return (max 20)'),
    category: z
      .string()
      .optional()
      .describe(
        'Filter by category name (e.g., "Politics", "Crypto", "Sports"). Use list_categories tool to see available categories.'
      ),
  }),
  execute: async ({ limit, category }) => {
    // If category provided, need to get tag_id first
    let tagId: string | undefined;

    if (category) {
      const tagsResponse = await fetch(
        `${BASE_URL}/api/polymarket/tags?include_count=true`
      );
      if (tagsResponse.ok) {
        const tags: PolymarketTag[] = await tagsResponse.json();
        const matchingTag = tags.find(
          (t) => t.label.toLowerCase() === category.toLowerCase()
        );
        if (matchingTag) {
          tagId = matchingTag.id;
        } else {
          return {
            error: 'Category not found',
            providedCategory: category,
            message:
              'Use list_categories tool to see available categories and their exact names.',
          };
        }
      }
    }

    const params = new URLSearchParams({
      limit: Math.min(limit, 20).toString(),
      order: 'volume24hr',
      ascending: 'false',
      closed: 'false',
      active: 'true',
    });

    if (tagId) {
      params.set('tag_id', tagId);
    }

    const response = await fetch(
      `${BASE_URL}/api/polymarket/events?${params.toString()}`
    );

    if (!response.ok) {
      return {
        error: 'Failed to fetch trending markets',
        message: 'Events API returned an error',
      };
    }

    const events: PolymarketEvent[] = await response.json();

    return {
      category: category || 'All Categories',
      resultsReturned: events.length,
      events: events.map(formatEventSummary),
    };
  },
});

/**
 * Tool 4: List available categories
 * Navigation tool - helps user discover what categories exist
 */
export const list_categories = tool({
  description:
    "List all available Polymarket categories with event counts. Use when user wants to explore categories or doesn't know what to search for. Returns top 20 most active categories.",
  inputSchema: z.object({}),
  execute: async () => {
    const response = await fetch(
      `${BASE_URL}/api/polymarket/tags?include_count=true`
    );

    if (!response.ok) {
      return {
        error: 'Failed to fetch categories',
        message: 'Tags API returned an error',
      };
    }

    const tags: PolymarketTag[] = await response.json();

    // Return top 20 categories with at least 1 event
    const topCategories = tags
      .filter((t) => (t.eventCount ?? 0) > 0)
      .slice(0, 20)
      .map((t) => ({
        id: t.id,
        name: t.label,
        eventCount: t.eventCount || 0,
      }));

    return {
      totalCategories: tags.length,
      categoriesReturned: topCategories.length,
      categories: topCategories,
      note: 'Use the category name with browse_trending_markets to see trending events in that category.',
    };
  },
});

/**
 * Export all tools as a single object for easy integration
 */
export const polymarketTools = {
  search_markets,
  get_event_details,
  browse_trending_markets,
  list_categories,
};
