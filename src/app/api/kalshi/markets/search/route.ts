import { NextResponse } from 'next/server';
import { kalshiCache } from '@/lib/kalshi-cache';
import {
  calculateRelevanceScore,
  formatSearchResult,
} from '@/lib/kalshi-formatters';
import type { KalshiSearchResult } from '@/types/kalshi';
import { kalshiMarketsSearchQuerySchema } from '@/lib/api-schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = kalshiMarketsSearchQuerySchema.safeParse(queryParams);

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

    // Client-side search and scoring
    const results: KalshiSearchResult[] = markets
      .map((market) => {
        const result = formatSearchResult(market);
        result.relevanceScore = calculateRelevanceScore(market, validated.q);
        return result;
      })
      .filter((result) => result.relevanceScore > 0) // Only include matches
      .filter((result) => {
        // Filter by category if provided
        if (validated.category) {
          return (
            result.category.toLowerCase() === validated.category.toLowerCase()
          );
        }
        return true;
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
      .slice(0, validated.limit);

    return NextResponse.json(
      {
        query: validated.q,
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
