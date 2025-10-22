import { NextResponse } from 'next/server';
import { kalshiCache } from '@/lib/kalshi-cache';
import { formatSearchResult } from '@/lib/kalshi-formatters';
import { kalshiMarketsTrendingQuerySchema } from '@/lib/api-schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = kalshiMarketsTrendingQuerySchema.safeParse(queryParams);

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

    // Fetch all cached markets
    const markets = await kalshiCache.getMarkets();

    // Filter and sort by 24h volume
    const trending = markets
      .filter((market) => {
        // Filter by category if provided
        if (validated.category) {
          return market.category.toLowerCase() === validated.category.toLowerCase();
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by volume_24h descending
        const volumeA = parseFloat(a.volume_24h);
        const volumeB = parseFloat(b.volume_24h);
        return volumeB - volumeA;
      })
      .slice(0, validated.limit)
      .map(formatSearchResult);

    return NextResponse.json(
      {
        category: validated.category || 'All Categories',
        totalResults: trending.length,
        markets: trending,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Kalshi Trending API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch trending Kalshi markets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
