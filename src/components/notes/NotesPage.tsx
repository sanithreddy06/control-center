"use client";

import { useEffect, useState, useCallback } from "react";
import { Pin, Trash2, Plus } from "lucide-react";
import { Note } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "./RichTextEditor";
import { LoadingSpinner, EmptyState } from "@/components/ui/LoadingSpinner";
import { NOTE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { StickyNote } from "lucide-react";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("General");

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/notes?${params}`);
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "", category: "General" }),
    });
    if (res.ok) {
      const note = await res.json();
      setSelectedNote(note);
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditCategory(note.category);
      setIsEditing(true);
      fetchNotes();
    }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setIsEditing(true);
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    await fetch(`/api/notes/${selectedNote.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent, category: editCategory }),
    });
    setIsEditing(false);
    fetchNotes();
  };

  const togglePin = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_pinned: !note.is_pinned }),
    });
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setIsEditing(false);
    setSelectedNote(null);
    fetchNotes();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-neutral-500">Capture ideas and thoughts</p>
        </div>
        <Button onClick={createNote}>
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search notes..." className="flex-1" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="all">All Categories</option>
          {NOTE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Create your first note to get started" action={<Button onClick={createNote}>Create Note</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <Card key={note.id} hover onClick={() => openNote(note)} className="relative">
              {note.is_pinned && (
                <Pin className="absolute right-3 top-3 h-4 w-4 text-amber-500" />
              )}
              <h3 className="font-medium line-clamp-1">{note.title}</h3>
              <p
                className="mt-2 text-sm text-neutral-500 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]*>/g, " ").trim() || "No content" }}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-400">{note.category}</span>
                <button
                  onClick={(e) => togglePin(note, e)}
                  className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Pin className={cn("h-3.5 w-3.5", note.is_pinned ? "text-amber-500" : "text-neutral-400")} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Note" className="max-w-2xl">
        <div className="space-y-4">
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {NOTE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <RichTextEditor content={editContent} onChange={setEditContent} />
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => selectedNote && deleteNote(selectedNote.id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveNote} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
