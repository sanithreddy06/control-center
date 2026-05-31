"use client";

import { useCallback, useEffect, useState } from "react";
import { Cloud, Droplets, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { WeatherData } from "@/types";

const REFRESH_MS = 15 * 60 * 1000;

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = useCallback((coords: GeolocationCoordinates) => {
    fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setWeather)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const load = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setError(false);
          fetchWeather(position.coords);
          clearInterval(intervalId);
          intervalId = setInterval(() => fetchWeather(position.coords), REFRESH_MS);
        },
        () => {
          setError(true);
          setLoading(false);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    };

    load();
    return () => clearInterval(intervalId);
  }, [fetchWeather]);

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
    <Card className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
          <Cloud className="h-6 w-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <p className="text-3xl font-light">{weather.temperature}°C</p>
          <p className="text-sm text-neutral-500">{weather.condition}</p>
        </div>
      </div>
      <div className="shrink-0 text-right text-sm text-neutral-500">
        <div className="flex items-center justify-end gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="max-w-[120px] truncate">{weather.location}</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-1">
          <Droplets className="h-3.5 w-3.5" />
          {weather.humidity}% humidity
        </div>
      </div>
    </Card>
  );
}
