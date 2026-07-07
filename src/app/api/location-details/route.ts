import { NextRequest, NextResponse } from "next/server";

type NominatimAddress = {
  city?: string;
  county?: string;
  municipality?: string;
  state?: string;
  state_district?: string;
  town?: string;
  village?: string;
};

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "Valid coordinates are required." }, { status: 400 });
  }

  try {
    const reverseUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    reverseUrl.searchParams.set("lat", String(latitude));
    reverseUrl.searchParams.set("lon", String(longitude));
    reverseUrl.searchParams.set("format", "jsonv2");
    reverseUrl.searchParams.set("addressdetails", "1");

    const elevationUrl = new URL("https://api.open-meteo.com/v1/elevation");
    elevationUrl.searchParams.set("latitude", String(latitude));
    elevationUrl.searchParams.set("longitude", String(longitude));

    const [reverseResponse, elevationResponse] = await Promise.all([
      fetch(reverseUrl, {
        headers: { "User-Agent": "NammaTrace/1.0 (location form autofill)" },
        next: { revalidate: 86400 },
      }),
      fetch(elevationUrl, { next: { revalidate: 86400 } }),
    ]);
    if (!reverseResponse.ok) throw new Error("Reverse geocoding failed");

    const reverse = (await reverseResponse.json()) as { address?: NominatimAddress };
    const elevation = elevationResponse.ok
      ? ((await elevationResponse.json()) as { elevation?: number[] })
      : null;
    const address = reverse.address ?? {};

    return NextResponse.json({
      altitudeMeters: elevation?.elevation?.[0] ?? null,
      district: address.state_district ?? address.county ?? address.municipality ?? null,
      state: address.state ?? null,
      village: address.village ?? address.town ?? address.city ?? address.municipality ?? null,
    });
  } catch {
    return NextResponse.json(
      { message: "Location details could not be resolved. Coordinates were still captured." },
      { status: 502 },
    );
  }
}
