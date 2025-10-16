import { NextResponse } from 'next/server';
import { kalshiCache } from '@/lib/kalshi-cache';
import {
  calculateRelevanceScore,
  formatSearchResult,
} from '@/lib/kalshi-formatters';
import type { KalshiSearchResult } from '@/types/kalshi';

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

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');

    // Fetch all cached markets
    const markets = await kalshiCache.getMarkets();

    // Client-side search and scoring
    const results: KalshiSearchResult[] = markets
      .map((market) => {
        const result = formatSearchResult(market);
        result.relevanceScore = calculateRelevanceScore(market, query);
        return result;
      })
      .filter((result) => result.relevanceScore > 0) // Only include matches
      .filter((result) => {
        // Filter by category if provided
        if (category) {
          return (
            result.category.toLowerCase() === category.toLowerCase()
          );
        }
        return true;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
      .slice(0, limit);

    return NextResponse.json(
      {
        query,
        totalResults: results.length,
        markets: results,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Kalshi Search API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search Kalshi markets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
