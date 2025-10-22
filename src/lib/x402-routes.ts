import type { RoutesConfig } from "x402-next";
import { inputSchemaToX402, zodToJsonSchema } from "./x402-schema";
import {
  polymarketEventsQuerySchema,
  polymarketTagsQuerySchema,
  polymarketSearchQuerySchema,
  polymarketEventSpecificQuerySchema,
  kalshiMarketsSearchQuerySchema,
  kalshiMarketsTrendingQuerySchema,
  kalshiCategoriesQuerySchema,
  kalshiEventSpecificQuerySchema,
} from "./api-schemas";
import { z } from "zod";

// Route descriptions for x402 payment metadata
const routeDescriptions = {
  "/api/x402/polymarket/events": "List Polymarket events with filtering by status, category, and volume",
  "/api/x402/polymarket/events/specific": "Get detailed information for a specific Polymarket event by ID or slug",
  "/api/x402/polymarket/tags": "List all available Polymarket tags/categories with optional event counts",
  "/api/x402/polymarket/search": "Search Polymarket events by keyword with advanced filtering options",
  "/api/x402/kalshi/markets/search": "Search Kalshi prediction markets by keyword with category filtering",
  "/api/x402/kalshi/markets/trending": "Get trending Kalshi markets sorted by 24-hour trading volume",
  "/api/x402/kalshi/events/specific": "Get detailed information for a specific Kalshi event by ticker symbol",
  "/api/x402/kalshi/categories": "List all Kalshi market categories with active event counts",
} as const;

// Output schemas - basic responses for now
// TODO: Create proper response schemas when needed
const genericResponseSchema = z.object({
  data: z.any(),
  error: z.string().optional(),
});

// Build x402 routes config
export const x402RoutesConfig: RoutesConfig = {
  "/api/x402/polymarket/events": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/polymarket/events"],
      inputSchema: inputSchemaToX402(polymarketEventsQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/polymarket/tags": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/polymarket/tags"],
      inputSchema: inputSchemaToX402(polymarketTagsQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/polymarket/search": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/polymarket/search"],
      inputSchema: inputSchemaToX402(polymarketSearchQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/kalshi/markets/search": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/kalshi/markets/search"],
      inputSchema: inputSchemaToX402(kalshiMarketsSearchQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/kalshi/markets/trending": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/kalshi/markets/trending"],
      inputSchema: inputSchemaToX402(kalshiMarketsTrendingQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/kalshi/categories": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/kalshi/categories"],
      inputSchema: inputSchemaToX402(kalshiCategoriesQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/polymarket/events/specific": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/polymarket/events/specific"],
      inputSchema: inputSchemaToX402(polymarketEventSpecificQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
  "/api/x402/kalshi/events/specific": {
    price: 0.01,
    network: "base",
    config: {
      description: routeDescriptions["/api/x402/kalshi/events/specific"],
      inputSchema: inputSchemaToX402(kalshiEventSpecificQuerySchema),
      outputSchema: zodToJsonSchema(genericResponseSchema),
      discoverable: true,
    },
  },
};
