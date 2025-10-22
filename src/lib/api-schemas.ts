import { z } from 'zod';

// ============================================================================
// Polymarket API Input Schemas
// ============================================================================

export const polymarketEventsQuerySchema = z.object({
  closed: z.enum(['true', 'false']).optional().default('false'),
  active: z.enum(['true', 'false']).optional().default('true'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  order: z.enum(['volume24hr', 'liquidity', 'creationDate', 'endDate']).optional().default('volume24hr'),
  ascending: z.enum(['true', 'false']).optional().default('false'),
  offset: z.coerce.number().int().min(0).optional(),
  tag_id: z.string().optional(),
});

export const polymarketEventByIdParamsSchema = z.object({
  id: z.string().min(1, 'Event ID or slug is required'),
});

export const polymarketTagsQuerySchema = z.object({
  include_count: z.enum(['true', 'false']).optional().default('false'),
});

export const polymarketSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit_per_type: z.coerce.number().int().min(1).max(1000).optional().default(100),
  events_status: z.string().optional(),
  events_tag: z.string().optional(),
  open_only: z.enum(['true', 'false']).optional(),
  sort: z.string().optional(),
  ascending: z.enum(['true', 'false']).optional(),
});

// ============================================================================
// Kalshi API Input Schemas
// ============================================================================

export const kalshiMarketsSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  category: z.string().optional(),
});

export const kalshiEventByTickerParamsSchema = z.object({
  ticker: z.string().min(1, 'Event ticker is required'),
});

export const kalshiMarketsTrendingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  category: z.string().optional(),
});

export const kalshiCategoriesQuerySchema = z.object({
  // No query params for categories endpoint
});

// ============================================================================
// x402 "Specific" Route Schemas (for dynamic route handling)
// ============================================================================

// Union schema for /api/x402/polymarket/events/specific
// Takes id as query param, proxies to /api/polymarket/events/[id]
export const polymarketEventSpecificQuerySchema = z.object({
  id: z.string().min(1, 'Event ID or slug is required'),
});

// Union schema for /api/x402/kalshi/events/specific
// Takes ticker as query param, proxies to /api/kalshi/events/[ticker]
export const kalshiEventSpecificQuerySchema = z.object({
  ticker: z.string().min(1, 'Event ticker is required'),
});

// ============================================================================
// Chat API Input Schema
// ============================================================================

export const chatQuerySchema = z.object({
  model: z.string().min(1, 'Model parameter is required'),
  messages: z.array(z.any()).min(1, 'Messages parameter is required and must be an array'),
  reasoningEffort: z.string().optional(),
});

// ============================================================================
// Type Exports for convenience
// ============================================================================

export type PolymarketEventsQuery = z.infer<typeof polymarketEventsQuerySchema>;
export type PolymarketEventByIdParams = z.infer<typeof polymarketEventByIdParamsSchema>;
export type PolymarketTagsQuery = z.infer<typeof polymarketTagsQuerySchema>;
export type PolymarketSearchQuery = z.infer<typeof polymarketSearchQuerySchema>;
export type PolymarketEventSpecificQuery = z.infer<typeof polymarketEventSpecificQuerySchema>;
export type KalshiMarketsSearchQuery = z.infer<typeof kalshiMarketsSearchQuerySchema>;
export type KalshiEventByTickerParams = z.infer<typeof kalshiEventByTickerParamsSchema>;
export type KalshiMarketsTrendingQuery = z.infer<typeof kalshiMarketsTrendingQuerySchema>;
export type KalshiCategoriesQuery = z.infer<typeof kalshiCategoriesQuerySchema>;
export type KalshiEventSpecificQuery = z.infer<typeof kalshiEventSpecificQuerySchema>;
export type ChatQuery = z.infer<typeof chatQuerySchema>;
