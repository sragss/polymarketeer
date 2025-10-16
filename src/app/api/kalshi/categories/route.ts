import { NextResponse } from 'next/server';
import type { KalshiCategory, KalshiEventsResponse } from '@/types/kalshi';

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export async function GET() {
  try {
    // Note: Kalshi markets don't have category field, only events do.
    // Fetch first 600 events (3 pages @ 200 each) to get comprehensive category list.
    // This gives us all active categories without being too slow (~2-3 seconds).

    const allEvents = [];
    let cursor: string | null = null;
    const pagesToFetch = 3;

    for (let i = 0; i < pagesToFetch; i++) {
      const params = new URLSearchParams({
        limit: '200',
      });

      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await fetch(
        `${KALSHI_API_BASE}/events?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Kalshi API responded with status: ${response.status}`);
      }

      const data: KalshiEventsResponse = await response.json();
      allEvents.push(...data.events);
      cursor = data.cursor;

      // Break if no more pages
      if (!cursor) break;
    }

    // Aggregate categories with counts
    const categoryCounts = new Map<string, number>();

    for (const event of allEvents) {
      if (event.category) {
        const count = categoryCounts.get(event.category) || 0;
        categoryCounts.set(event.category, count + 1);
      }
    }

    // Convert to array and sort by count
    const categories: KalshiCategory[] = Array.from(categoryCounts.entries())
      .map(([name, eventCount]) => ({ name, eventCount }))
      .filter((cat) => cat.eventCount > 0)
      .sort((a, b) => b.eventCount - a.eventCount);

    return NextResponse.json(
      {
        totalCategories: categories.length,
        categories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Kalshi Categories API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Kalshi categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
