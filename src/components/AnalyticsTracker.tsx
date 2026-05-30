"use client";

import { useEffect } from "react";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cc_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cc_visitor_id", id);
  }
  return id;
}

export function AnalyticsTracker() {
  useEffect(() => {
    const visitorId = getVisitorId();
    const domain = window.location.hostname;
    const path = window.location.pathname;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, path, visitorId }),
    }).catch(() => {});
  }, []);

  return null;
}
