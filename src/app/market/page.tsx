import type { PolymarketEvent } from '@/types/polymarket';
import type { PolymarketTag } from '@/app/api/polymarket/tags/route';
import { MarketGrid } from './_components/market-grid';

async function getEvents(): Promise<PolymarketEvent[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/polymarket/events?limit=100`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return res.json();
}

async function getTags(): Promise<PolymarketTag[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/polymarket/tags?include_count=true`, {
    next: { revalidate: 300 }, // 5 minute cache since counts change more often
  });

  if (!res.ok) {
    console.error('Failed to fetch tags, using empty array');
    return [];
  }

  return res.json();
}

export default async function MarketPage() {
  const [events, tags] = await Promise.all([getEvents(), getTags()]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-bold text-4xl">Polymarket Events</h1>
        <p className="text-muted-foreground mt-2">
          Browse prediction markets sorted by 24-hour trading volume
        </p>
      </div>

      <MarketGrid initialEvents={events} tags={tags} />
    </div>
  );
}
