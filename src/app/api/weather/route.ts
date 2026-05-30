import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const lat = request.nextUrl.searchParams.get("lat");
    const lon = request.nextUrl.searchParams.get("lon");

    if (!lat || !lon) {
      return badRequestResponse("Location coordinates required");
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;

    const [weatherRes, geoRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 900 } }),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: { "User-Agent": "ControlCenter/1.0" },
          next: { revalidate: 86400 },
        }
      ).catch(() => null),
    ]);

    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    let location = "Your Location";
    if (geoRes?.ok) {
      const geoData = await geoRes.json();
      location =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.state ||
        location;
    }

    const weatherCodes: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
    };

    return NextResponse.json({
      temperature: Math.round(current.temperature_2m),
      condition: weatherCodes[current.weather_code] || "Unknown",
      humidity: current.relative_humidity_2m,
      location,
    });
  } catch {
    return serverErrorResponse("Failed to fetch weather");
  }
}
