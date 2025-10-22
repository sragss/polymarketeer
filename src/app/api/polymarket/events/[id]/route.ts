import type { PolymarketEvent } from '@/types/polymarket';
import { NextResponse } from 'next/server';
import { polymarketEventByIdParamsSchema } from '@/lib/api-schemas';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate path parameter with Zod
    const validation = polymarketEventByIdParamsSchema.safeParse({ id });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid event ID',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const validated = validation.data;

    // Try fetching by slug first
    const response = await fetch(`${GAMMA_API_BASE}/events/${id}`, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 30 seconds
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      // If slug fetch fails, try fetching all events and filtering by ID
      const eventsResponse = await fetch(
        `${GAMMA_API_BASE}/events?limit=1000`,
        {
          headers: { Accept: 'application/json' },
          next: { revalidate: 30 },
        }
      );

      if (!eventsResponse.ok) {
        throw new Error(
          `Gamma API responded with status: ${eventsResponse.status}`
        );
      }

      const events: PolymarketEvent[] = await eventsResponse.json();
      const event = events.find((e) => e.id === id);

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found', eventId: id },
          { status: 404 }
        );
      }

      return NextResponse.json(event, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }

    const event: PolymarketEvent = await response.json();

    return NextResponse.json(event, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Polymarket Event API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Polymarket event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
