"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, StickyNote, CheckSquare, GraduationCap, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const quickActions = [
  { label: "Create Note", icon: StickyNote, href: "/notes", action: "note" },
  { label: "Create Todo", icon: CheckSquare, href: "/todos", action: "todo" },
  { label: "Create Exam", icon: GraduationCap, href: "/exams", action: "exam" },
  { label: "Create Bookmark", icon: Bookmark, href: "/bookmarks", action: "bookmark" },
];

export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAction = (action: string) => {
    setActiveAction(action);
    setModalOpen(true);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeAction) return;
    setLoading(true);

    try {
      let endpoint = "";
      let body: Record<string, string> = {};

      switch (activeAction) {
        case "note":
          endpoint = "/api/notes";
          body = { title, content: "" };
          break;
        case "todo":
          endpoint = "/api/todos";
          body = { title };
          break;
        case "exam":
          endpoint = "/api/exams";
          body = { name: title, subject: "General", exam_date: new Date().toISOString().split("T")[0] };
          break;
        case "bookmark":
          endpoint = "/api/bookmarks";
          body = { title, url: "https://" };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle("");
        const action = quickActions.find((a) => a.action === activeAction);
        if (action) router.push(action.href);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200 lg:bg-transparent lg:backdrop-blur-none"
          aria-hidden="true"
        />
      )}

      <div
        ref={containerRef}
        className={cn(
          "fixed z-30",
          "bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2",
          "lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0"
        )}
      >
        {isOpen && (
          <div className="mb-3 flex flex-col items-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 lg:items-end">
            {quickActions.map((action, i) => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                style={{ animationDelay: `${i * 40}ms` }}
                className="flex w-max min-w-[11rem] items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-lg transition-all duration-200 hover:scale-[1.02] dark:bg-neutral-800 animate-in fade-in slide-in-from-bottom-1"
              >
                <action.icon className="h-4 w-4 shrink-0" />
                {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-center lg:justify-end">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-all duration-300 hover:scale-105 dark:bg-white dark:text-neutral-900 lg:h-14 lg:w-14",
              isOpen && "rotate-45 scale-105"
            )}
            aria-label="Quick create menu"
          >
            {isOpen ? <X className="h-5 w-5 lg:h-6 lg:w-6" /> : <Plus className="h-5 w-5 lg:h-6 lg:w-6" />}
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeAction ? `Create ${activeAction.charAt(0).toUpperCase() + activeAction.slice(1)}` : "Quick Create"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
