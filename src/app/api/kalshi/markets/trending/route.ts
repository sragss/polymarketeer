import { NextResponse } from 'next/server';
import { kalshiCache } from '@/lib/kalshi-cache';
import { formatSearchResult } from '@/lib/kalshi-formatters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');

    // Fetch all cached markets
    const markets = await kalshiCache.getMarkets();

    // Filter and sort by 24h volume
    const trending = markets
      .filter((market) => {
        // Filter by category if provided
        if (category) {
          return market.category.toLowerCase() === category.toLowerCase();
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by volume_24h descending
        const volumeA = parseFloat(a.volume_24h);
        const volumeB = parseFloat(b.volume_24h);
        return volumeB - volumeA;
      })
      .slice(0, limit)
      .map(formatSearchResult);

    return NextResponse.json(
      {
        category: category || 'All Categories',
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
