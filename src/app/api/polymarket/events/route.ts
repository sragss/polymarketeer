import type { PolymarketEvent } from '@/types/polymarket';
import { NextResponse } from 'next/server';
import { polymarketEventsQuerySchema } from '@/lib/api-schemas';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = polymarketEventsQuerySchema.safeParse(queryParams);

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
      closed: validated.closed,
      active: validated.active,
      limit: validated.limit.toString(),
      order: validated.order,
      ascending: validated.ascending,
    });

    // Add optional filtering parameters if provided
    if (validated.offset !== undefined) {
      params.set('offset', validated.offset.toString());
    }
    if (validated.tag_id) {
      params.set('tag_id', validated.tag_id);
    }

    const response = await fetch(`${GAMMA_API_BASE}/events?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 30 seconds to reduce load on Gamma API
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`Gamma API responded with status: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();

    // Filter out events with no markets and trim data to reduce payload size
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

    return NextResponse.json(filteredEvents, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Polymarket Events API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Polymarket events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
