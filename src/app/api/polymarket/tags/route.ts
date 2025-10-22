import { NextResponse } from 'next/server';
import { polymarketTagsQuerySchema } from '@/lib/api-schemas';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export interface PolymarketTag {
  id: string;
  label: string;
  slug: string;
  forceShow?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  eventCount?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = polymarketTagsQuerySchema.safeParse(queryParams);

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
    const includeCount = validated.include_count === 'true';

    // Fetch all tags with a high limit (API supports up to 1000+)
    const response = await fetch(`${GAMMA_API_BASE}/tags?limit=10000`, {
      headers: {
        Accept: 'application/json',
      },
      // Cache for 1 hour since tags don't change often
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Gamma API responded with status: ${response.status}`);
    }

    const tags: PolymarketTag[] = await response.json();

    let tagsWithCounts = tags;

    // If includeCount is true, fetch active events to count tags
    if (includeCount) {
      try {
        const eventsResponse = await fetch(
          `${GAMMA_API_BASE}/events?active=true&closed=false&limit=1000`,
          {
            headers: { Accept: 'application/json' },
            next: { revalidate: 300 }, // 5 minute cache for events
          }
        );

        if (eventsResponse.ok) {
          const events = await eventsResponse.json();

          // Count events per tag
          const tagCounts = new Map<string, number>();
          for (const event of events) {
            if (event.tags && Array.isArray(event.tags)) {
              for (const tag of event.tags) {
                tagCounts.set(tag.id, (tagCounts.get(tag.id) || 0) + 1);
              }
            }
          }

          // Add counts to tags
          tagsWithCounts = tags.map((tag) => ({
            ...tag,
            eventCount: tagCounts.get(tag.id) || 0,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch event counts:', error);
        // Continue without counts if this fails
      }
    }

    // Sort tags alphabetically by label
    const sortedTags = tagsWithCounts.sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    // Filter out tags with 0 events if counts are included
    const filteredTags = includeCount
      ? sortedTags.filter((tag) => (tag.eventCount ?? 0) > 0)
      : sortedTags;

    return NextResponse.json(filteredTags, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Polymarket Tags API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Polymarket tags',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
