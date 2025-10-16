import { NextResponse } from 'next/server';
import type { KalshiEventDetailResponse } from '@/types/kalshi';
import { formatEventDetails } from '@/lib/kalshi-formatters';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;

    if (!ticker) {
      return NextResponse.json(
        { error: 'Event ticker is required' },
        { status: 400 }
      );
    }

    // Fetch event details with all markets
    const response = await fetch(
      `${KALSHI_API_BASE}/events/${ticker}`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Cache for 60 seconds
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Event not found', ticker },
          { status: 404 }
        );
      }
      throw new Error(`Kalshi API responded with status: ${response.status}`);
    }

    const data: KalshiEventDetailResponse = await response.json();

    // Format for LLM consumption
    const formatted = formatEventDetails(data.event, data.markets);

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Kalshi Event API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Kalshi event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
