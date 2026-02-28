/**
 * Admin Sidebar Search — Item #20
 * Filter ~90 admin routes quickly
 */

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

interface AdminSidebarSearchProps {
  onFilterChange: (filter: string) => void;
}

export function AdminSidebarSearch({ onFilterChange }: AdminSidebarSearchProps) {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onFilterChange(value.toLowerCase().trim());
  };

  return (
    <div className="relative px-3 py-2">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder="Filter routes..."
        className="w-full pl-7 pr-7 py-1.5 text-xs bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
      />
      {query && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
