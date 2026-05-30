"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, Eye, TrendingUp, Globe } from "lucide-react";

interface AnalyticsData {
  totalVisitors: number;
  visitorsToday: number;
  pageViews: number;
  mostVisitedPages: { path: string; count: number }[];
  mostVisitedSubdomains: { domain: string; count: number }[];
  trafficTrends: { date: string; count: number }[];
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics?days=30")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-neutral-500">Failed to load analytics</p>;

  const stats = [
    { label: "Total Visitors", value: data.totalVisitors, icon: Users },
    { label: "Visitors Today", value: data.visitorsToday, icon: TrendingUp },
    { label: "Page Views", value: data.pageViews, icon: Eye },
    { label: "Tracked Domains", value: data.mostVisitedSubdomains.length, icon: Globe },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-neutral-500">Traffic insights for your domains</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-neutral-100 p-2 dark:bg-neutral-800">
                <stat.icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <p className="text-2xl font-light">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-medium">Traffic Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.trafficTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#171717" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-medium">Most Visited Pages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.mostVisitedPages.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="path" type="category" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#171717" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-medium">Most Visited Subdomains</h3>
        <div className="space-y-2">
          {data.mostVisitedSubdomains.map((item) => (
            <div key={item.domain} className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2 dark:bg-neutral-800/50">
              <span className="text-sm font-medium">{item.domain}</span>
              <span className="text-sm text-neutral-500">{item.count.toLocaleString()} views</span>
            </div>
          ))}
          {data.mostVisitedSubdomains.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-500">
              No traffic data yet. Add the tracking script to your sites.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
