"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SearchResult } from "@/types";
import { SearchInput } from "@/components/ui/SearchInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const typeLabels: Record<string, string> = {
  note: "Notes",
  todo: "Todos",
  document: "Documents",
  exam: "Exams",
  bookmark: "Bookmarks",
};

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (res.ok) setResults(await res.json());
    setLoading(false);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-neutral-500">Search across all your data</p>
      </div>

      <SearchInput
        value={query}
        onChange={handleSearch}
        placeholder="Search notes, todos, exams, bookmarks..."
        className="mb-8"
      />

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-neutral-500">No results found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-6">
          <h2 className="mb-3 text-sm font-medium text-neutral-500">{typeLabels[type] || type}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <Link key={item.id} href={item.url}>
                <Card hover className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-sm text-neutral-500">{item.subtitle}</p>
                    )}
                  </div>
                  <Badge>{type}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
