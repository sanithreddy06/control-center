"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Star, ExternalLink, Bookmark } from "lucide-react";
import { Bookmark as BookmarkType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import { BOOKMARK_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBookmark, setEditBookmark] = useState<BookmarkType | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarkCategory, setBookmarkCategory] = useState("Websites");
  const [description, setDescription] = useState("");

  const fetchBookmarks = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (favoritesOnly) params.set("favorites", "true");
    const res = await fetch(`/api/bookmarks?${params}`);
    if (res.ok) setBookmarks(await res.json());
    setLoading(false);
  }, [search, category, favoritesOnly]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const openCreate = () => {
    setEditBookmark(null);
    setTitle("");
    setUrl("");
    setBookmarkCategory("Websites");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (bookmark: BookmarkType) => {
    setEditBookmark(bookmark);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setBookmarkCategory(bookmark.category);
    setDescription(bookmark.description);
    setModalOpen(true);
  };

  const saveBookmark = async () => {
    const body = { title, url, category: bookmarkCategory, description };
    if (editBookmark) {
      await fetch(`/api/bookmarks/${editBookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setModalOpen(false);
    fetchBookmarks();
  };

  const toggleFavorite = async (bookmark: BookmarkType) => {
    await fetch(`/api/bookmarks/${bookmark.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !bookmark.is_favorite }),
    });
    fetchBookmarks();
  };

  const deleteBookmark = async (id: string) => {
    await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    setModalOpen(false);
    fetchBookmarks();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookmarks</h1>
          <p className="text-sm text-neutral-500">Saved links and resources</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Bookmark</Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search bookmarks..." className="flex-1" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="all">All Categories</option>
          {BOOKMARK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button
          variant={favoritesOnly ? "primary" : "secondary"}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Star className="h-4 w-4" /> Favorites
        </Button>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState icon={Bookmark} title="No bookmarks" action={<Button onClick={openCreate}>Add Bookmark</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(bookmark)}>
                  <h3 className="font-medium truncate">{bookmark.title}</h3>
                  <p className="text-xs text-neutral-500 truncate">{bookmark.url}</p>
                  {bookmark.description && (
                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{bookmark.description}</p>
                  )}
                  <span className="mt-2 inline-block text-xs text-neutral-400">{bookmark.category}</span>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => toggleFavorite(bookmark)} className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Star className={cn("h-4 w-4", bookmark.is_favorite ? "fill-amber-400 text-amber-400" : "text-neutral-400")} />
                  </button>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <ExternalLink className="h-4 w-4 text-neutral-400" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editBookmark ? "Edit Bookmark" : "New Bookmark"}>
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          <select
            value={bookmarkCategory}
            onChange={(e) => setBookmarkCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {BOOKMARK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2">
            {editBookmark && (
              <Button variant="danger" onClick={() => deleteBookmark(editBookmark.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveBookmark} disabled={!title || !url} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
