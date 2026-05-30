"use client";

import { useEffect, useState } from "react";
import { Cloud, Droplets, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { WeatherData } from "@/types";

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            setWeather(data);
          } else {
            setError(true);
          }
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(true);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-8 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="flex items-center gap-4">
        <Cloud className="h-8 w-8 text-neutral-400" />
        <p className="text-sm text-neutral-500">Weather unavailable</p>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
          <Cloud className="h-6 w-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <p className="text-3xl font-light">{weather.temperature}°C</p>
          <p className="text-sm text-neutral-500">{weather.condition}</p>
        </div>
      </div>
      <div className="text-right text-sm text-neutral-500">
        <div className="flex items-center justify-end gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {weather.location}
        </div>
        <div className="mt-1 flex items-center justify-end gap-1">
          <Droplets className="h-3.5 w-3.5" />
          {weather.humidity}% humidity
        </div>
      </div>
    </Card>
  );
}
