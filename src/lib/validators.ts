import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const noteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  category: z.string().max(50).optional(),
  is_pinned: z.boolean().optional(),
});

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  is_completed: z.boolean().optional(),
});

export const examSchema = z.object({
  name: z.string().min(1, "Exam name is required").max(200),
  subject: z.string().min(1, "Subject is required").max(200),
  exam_date: z.string().min(1, "Date is required"),
  notes: z.string().max(2000).optional(),
});

export const bookmarkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  url: z.string().url("Invalid URL"),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  is_favorite: z.boolean().optional(),
});

export const calendarEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  event_type: z.enum(["birthday", "reminder", "event"]).optional(),
  event_date: z.string().min(1, "Date is required"),
  description: z.string().max(500).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const vaultPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Vault password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const vaultVerifySchema = z.object({
  vaultPassword: z.string().min(1, "Vault password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200),
});
