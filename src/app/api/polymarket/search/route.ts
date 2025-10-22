import type { PolymarketEvent } from '@/types/polymarket';
import { NextResponse } from 'next/server';
import { polymarketSearchQuerySchema } from '@/lib/api-schemas';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = polymarketSearchQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const validated = validation.data;

    // Build query parameters for Gamma API
    const params = new URLSearchParams({
      q: validated.q,
      limit_per_type: validated.limit_per_type.toString(),
    });

    // Add optional filtering parameters if provided
    if (validated.events_status) {
      params.set('events_status', validated.events_status);
    }
    if (validated.events_tag) {
      params.set('events_tag', validated.events_tag);
    }

    // Filter closed markets - default to showing only open markets
    if (validated.open_only === 'true') {
      // Use events_status=active to filter for open events
      params.set('events_status', 'active');
    }

    // Add sorting parameters if provided
    if (validated.sort) {
      params.set('sort', validated.sort);
    }
    if (validated.ascending) {
      params.set('ascending', validated.ascending);
    }

    const response = await fetch(
      `${GAMMA_API_BASE}/public-search?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Cache for 30 seconds
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error(`Gamma API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract and trim events data similar to events endpoint
    const events: PolymarketEvent[] = data.events || [];
    const filteredEvents = events
      .filter((event) => event.markets && event.markets.length > 0)
      .map((event) => ({
        ...event,
        // Only keep first 5 markets per event to reduce payload size
        markets: event.markets.slice(0, 5).map((market) => ({
          id: market.id,
          question: market.question,
          outcomes: market.outcomes,
          outcomePrices: market.outcomePrices,
          volume: market.volume,
          volumeNum: market.volumeNum,
          active: market.active,
          closed: market.closed,
        })),
      }));

    return NextResponse.json(
      {
        events: filteredEvents,
        tags: data.tags || [],
        totalEvents: events.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Polymarket Search API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search Polymarket events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
