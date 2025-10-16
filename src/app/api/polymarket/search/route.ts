import type { PolymarketEvent } from '@/types/polymarket';
import { NextResponse } from 'next/server';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build query parameters for Gamma API
    const params = new URLSearchParams({
      q: query,
      limit_per_type: searchParams.get('limit_per_type') || '100',
    });

    // Add optional filtering parameters if provided
    if (searchParams.has('events_status')) {
      params.set('events_status', searchParams.get('events_status') as string);
    }
    if (searchParams.has('events_tag')) {
      params.set('events_tag', searchParams.get('events_tag') as string);
    }

    // Filter closed markets - default to showing only open markets
    const openOnly = searchParams.get('open_only');
    if (openOnly === 'true') {
      // Use events_status=active to filter for open events
      params.set('events_status', 'active');
    }
    // If openOnly is false or null, don't set events_status (show all)

    // Add sorting parameters if provided
    if (searchParams.has('sort')) {
      params.set('sort', searchParams.get('sort') as string);
    }
    if (searchParams.has('ascending')) {
      params.set('ascending', searchParams.get('ascending') as string);
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
