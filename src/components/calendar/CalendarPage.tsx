"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface CalendarItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  description: string;
  source: string;
}

const eventColors: Record<string, string> = {
  exam: "bg-violet-500",
  birthday: "bg-rose-500",
  reminder: "bg-amber-500",
  event: "bg-blue-500",
  todo: "bg-emerald-500",
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("event");
  const [description, setDescription] = useState("");

  const fetchEvents = useCallback(async () => {
    const month = String(currentDate.getMonth() + 1);
    const year = String(currentDate.getFullYear());
    const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.event_date), day));

  const addEvent = async () => {
    if (!selectedDate || !title) return;
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        event_type: eventType,
        event_date: format(selectedDate, "yyyy-MM-dd"),
        description,
      }),
    });
    setModalOpen(false);
    setTitle("");
    setDescription("");
    fetchEvents();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-neutral-500">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-neutral-500">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-neutral-100 dark:border-neutral-800" />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setModalOpen(true); }}
                className={cn(
                  "min-h-[80px] cursor-pointer border-b border-r border-neutral-100 p-1.5 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50",
                  !isSameMonth(day, currentDate) && "opacity-40"
                )}
              >
                <span className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday && "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                )}>
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <div
                      key={e.id + e.source}
                      className={cn("truncate rounded px-1 py-0.5 text-[10px] text-white", eventColors[e.source] || eventColors.event)}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-[10px] text-neutral-400">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Add Event"}
      >
        <div className="space-y-4">
          {selectedDate && getEventsForDay(selectedDate).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Events on this day</p>
              {getEventsForDay(selectedDate).map((e) => (
                <div key={e.id + e.source} className="rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
                  <span className="font-medium">{e.title}</span>
                  {e.description && <p className="text-xs text-neutral-500">{e.description}</p>}
                </div>
              ))}
            </div>
          )}
          <Input label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="event">Event</option>
            <option value="birthday">Birthday</option>
            <option value="reminder">Reminder</option>
          </select>
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={addEvent} disabled={!title} className="w-full">
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </Modal>
    </div>
  );
}
