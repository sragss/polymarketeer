'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PolymarketTag } from '@/app/api/polymarket/tags/route';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface MarketFiltersProps {
  tags: PolymarketTag[];
  selectedTagId: string | null;
  onTagChange: (tagId: string | null) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  openOnly: boolean;
  onOpenOnlyChange: (openOnly: boolean) => void;
}

export function MarketFilters({
  tags,
  selectedTagId,
  onTagChange,
  onSearch,
  searchQuery,
  openOnly,
  onOpenOnlyChange,
}: MarketFiltersProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const selectedTag = tags.find((t) => t.id === selectedTagId);

  // Get popular tags (you could enhance this with actual popularity metrics)
  const popularTags = tags.slice(0, 20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleClearSearch = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search markets..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9 pr-9"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={!inputValue.trim()}>
          Search
        </Button>
      </form>

      {/* Category Filter & Active Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Open Markets Toggle */}
        <Button
          variant={openOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => onOpenOnlyChange(!openOnly)}
          className="h-9"
        >
          {openOnly ? '✓ Open Markets Only' : 'All Markets'}
        </Button>

        <Select
          value={selectedTagId || 'all'}
          onValueChange={(value) => onTagChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">All Categories</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <span className="flex items-center justify-between gap-2">
                  <span>{tag.label}</span>
                  {tag.eventCount !== undefined && (
                    <span className="text-muted-foreground text-xs">
                      ({tag.eventCount})
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {searchQuery && (
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            Search: "{searchQuery}"
            <button
              onClick={handleClearSearch}
              className="hover:bg-muted rounded-sm"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {selectedTag && (
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            {selectedTag.label}
            <button
              onClick={() => onTagChange(null)}
              className="hover:bg-muted rounded-sm"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {!selectedTagId && !searchQuery && popularTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Popular:</span>
          {popularTags.map((tag) => (
            <Button
              key={tag.id}
              variant="outline"
              size="sm"
              onClick={() => onTagChange(tag.id)}
              className="h-7 text-xs"
            >
              {tag.label}
              {tag.eventCount !== undefined && tag.eventCount > 0 && (
                <span className="text-muted-foreground ml-1.5">
                  ({tag.eventCount})
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
