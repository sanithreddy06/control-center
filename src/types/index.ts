export type Theme = "light" | "dark" | "system";
export type UserRole = "user" | "admin";
export type TodoPriority = "low" | "medium" | "high";
export type EventType = "birthday" | "reminder" | "event";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TodoPriority;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  name: string;
  category: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  exam_date: string;
  notes: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  category: string;
  description: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  domain: string;
  path: string;
  visitor_id: string;
  event_type: string;
  created_at: string;
}

export interface SearchResult {
  type: "note" | "todo" | "document" | "exam" | "bookmark";
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  location: string;
}
