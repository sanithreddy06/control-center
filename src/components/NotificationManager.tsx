"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "cc_notifications_enabled";
const NOTIFIED_KEY = "cc_notified_today";

function isEnabled() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function alreadyNotifiedToday() {
  return localStorage.getItem(NOTIFIED_KEY) === new Date().toDateString();
}

function markNotifiedToday() {
  localStorage.setItem(NOTIFIED_KEY, new Date().toDateString());
}

async function checkReminders() {
  if (!isEnabled() || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (alreadyNotifiedToday()) return;

  try {
    const res = await fetch("/api/reminders");
    if (!res.ok) return;
    const data = await res.json();

    const messages: string[] = [];

    if (data.todosDueToday?.length) {
      messages.push(`${data.todosDueToday.length} task(s) due today`);
    }

    data.exams?.forEach((exam: { name: string; daysLeft: number }) => {
      if (exam.daysLeft === 0) messages.push(`Exam today: ${exam.name}`);
      else if (exam.daysLeft === 1) messages.push(`Exam tomorrow: ${exam.name}`);
      else if (exam.daysLeft <= 7) messages.push(`${exam.name} in ${exam.daysLeft} days`);
    });

    if (messages.length === 0) return;

    new Notification("Control Center Reminder", {
      body: messages.slice(0, 3).join("\n"),
      icon: "/icons/icon-192.png",
      tag: "cc-daily-reminder",
    });
    markNotifiedToday();
  } catch {
    // ignore
  }
}

export function NotificationManager() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 30 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") {
    localStorage.setItem(STORAGE_KEY, "true");
    return true;
  }
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  const granted = result === "granted";
  localStorage.setItem(STORAGE_KEY, granted ? "true" : "false");
  return granted;
}

export function notificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}
