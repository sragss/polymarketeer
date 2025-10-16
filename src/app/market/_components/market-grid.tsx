'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PolymarketEvent } from '@/types/polymarket';
import { parseOutcomePrices, parseOutcomes } from '@/types/polymarket';
import { useState, useEffect } from 'react';
import type { PolymarketTag } from '@/app/api/polymarket/tags/route';
import { MarketFilters } from './market-filters';

function formatVolume(volume: number | null | undefined): string {
  if (!volume || volume === 0) return '$0';
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

function formatOdds(prices: number[]): string {
  if (prices.length === 0) return 'N/A';
  return prices.map((p) => `${(p * 100).toFixed(1)}%`).join(' / ');
}

interface MarketGridProps {
  initialEvents: PolymarketEvent[];
  tags: PolymarketTag[];
}

export function MarketGrid({ initialEvents, tags }: MarketGridProps) {
  const [events, setEvents] = useState<PolymarketEvent[]>(initialEvents);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openOnly, setOpenOnly] = useState<boolean>(true); // Default to open markets only
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      // If no filters, show initial events
      if (!selectedTagId && !searchQuery) {
        setEvents(initialEvents);
        setResultCount(null);
        return;
      }

      setLoading(true);
      try {
        // Use search API if query exists, otherwise use events API with tag filter
        if (searchQuery) {
          const params = new URLSearchParams({
            q: searchQuery,
            limit_per_type: '100',
            open_only: openOnly.toString(),
          });
          if (selectedTagId) {
            params.set('events_tag', selectedTagId);
          }
          const response = await fetch(`/api/polymarket/search?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            setEvents(data.events);
            setResultCount(data.totalEvents);
          }
        } else if (selectedTagId) {
          const params = new URLSearchParams({
            limit: '100',
            tag_id: selectedTagId,
          });
          const response = await fetch(`/api/polymarket/events?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            setEvents(data);
            setResultCount(data.length);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTagId, searchQuery, openOnly, initialEvents]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <MarketFilters
        tags={tags}
        selectedTagId={selectedTagId}
        onTagChange={setSelectedTagId}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        openOnly={openOnly}
        onOpenOnlyChange={setOpenOnly}
      />

      {/* Result Count */}
      {!loading && resultCount !== null && (
        <div className="text-muted-foreground mb-4 text-sm">
          {resultCount === 0 ? (
            <span>No results found</span>
          ) : (
            <span>
              Showing {events.filter((e) => e.markets.some((m) => m.outcomePrices !== null)).length} of{' '}
              {resultCount} events
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="text-muted-foreground py-12 text-center">
          {searchQuery ? 'Searching...' : 'Loading events...'}
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-muted-foreground py-12 text-center">
          {searchQuery ? (
            <>No results found for "{searchQuery}"</>
          ) : (
            <>No events found for this category.</>
          )}
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const hasValidMarkets = event.markets.some(
              (m) => m.outcomePrices !== null
            );

            if (!hasValidMarkets) return null;

            const eventUrl = `https://polymarket.com/event/${event.slug}`;

            return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-3 flex items-start gap-3">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        <a
                          href={eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {event.title}
                        </a>
                      </CardTitle>
                      {event.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {event.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Volume</div>
                      <div className="font-semibold">
                        {formatVolume(event.volume)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">24h Vol</div>
                      <div className="font-semibold">
                        {formatVolume(event.volume24hr)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      Markets
                    </div>
                    {event.markets.slice(0, 3).map((market) => {
                      const prices = parseOutcomePrices(market.outcomePrices);
                      const outcomes = parseOutcomes(market.outcomes);

                      if (!prices || prices.length === 0) return null;

                      return (
                        <div
                          key={market.id}
                          className="rounded-lg border bg-muted/50 p-3 text-xs"
                        >
                          <div className="mb-2 line-clamp-2 font-medium leading-tight">
                            {market.question}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-muted-foreground">
                              {outcomes.join(' / ')}
                            </div>
                            <div className="font-mono font-semibold">
                              {formatOdds(prices)}
                            </div>
                          </div>
                          <div className="mt-1 text-muted-foreground">
                            Vol: {formatVolume(market.volumeNum)}
                          </div>
                        </div>
                      );
                    })}
                    {event.markets.length > 3 && (
                      <div className="text-muted-foreground text-xs">
                        +{event.markets.length - 3} more markets
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
