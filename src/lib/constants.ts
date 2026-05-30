export const APP_NAME = "Control Center";
export const APP_VERSION = "1.0.0";

export const NOTE_CATEGORIES = [
  "General",
  "College",
  "Personal",
  "Ideas",
  "Work",
  "Important",
] as const;

export const DOCUMENT_CATEGORIES = [
  "Aadhaar",
  "Driving License",
  "PAN Card",
  "Marks Cards",
  "Certificates",
  "Personal PDFs",
  "Other",
] as const;

export const BOOKMARK_CATEGORIES = [
  "College",
  "Projects",
  "Development",
  "Websites",
  "Videos",
  "Favorites",
] as const;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/notes", label: "Notes", icon: "StickyNote" },
  { href: "/todos", label: "Todos", icon: "CheckSquare" },
  { href: "/documents", label: "Documents", icon: "FileLock2" },
  { href: "/exams", label: "Exams", icon: "GraduationCap" },
  { href: "/calendar", label: "Calendar", icon: "Calendar" },
  { href: "/bookmarks", label: "Bookmarks", icon: "Bookmark" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3", adminOnly: true },
  { href: "/settings", label: "Settings", icon: "Settings" },
  { href: "/logout", label: "Logout", icon: "LogOut" },
] as const;

export const MODULE_CARDS = [
  { href: "/notes", label: "Notes", description: "Capture ideas & thoughts", icon: "StickyNote", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { href: "/todos", label: "Todos", description: "Manage your tasks", icon: "CheckSquare", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { href: "/documents", label: "Documents", description: "Secure document vault", icon: "FileLock2", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { href: "/exams", label: "Exams", description: "Track exam schedule", icon: "GraduationCap", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { href: "/calendar", label: "Calendar", description: "Events & reminders", icon: "Calendar", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { href: "/bookmarks", label: "Bookmarks", description: "Saved links & resources", icon: "Bookmark", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { href: "/analytics", label: "Analytics", description: "Traffic insights", icon: "BarChart3", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", adminOnly: true },
  { href: "/settings", label: "Settings", description: "Preferences & security", icon: "Settings", color: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400" },
] as const;

export const TRACKED_DOMAINS = [
  "saisanithreddy.online",
  "control.saisanithreddy.online",
] as const;
