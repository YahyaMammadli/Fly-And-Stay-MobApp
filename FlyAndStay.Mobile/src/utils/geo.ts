import { Airport } from "@/api/types";
import { UserLocation } from "@/hooks/use-location";

// Airport countries come from the API as display names; map them to ISO codes.
const COUNTRY_CODES: Record<string, string> = {
  azerbaijan: "AZ",
  "türkiye": "TR",
  turkiye: "TR",
  turkey: "TR",
  uae: "AE",
  "united arab emirates": "AE",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  uk: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  russia: "RU",
  georgia: "GE",
  germany: "DE",
  france: "FR",
  italy: "IT",
  spain: "ES",
};

const normalize = (value: string | null | undefined) =>
  (value ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

function countryCodeOf(airport: Airport): string | null {
  return COUNTRY_CODES[airport.country.trim().toLowerCase()] ?? null;
}

/** Picks the airport closest to what the user shared: same city first, then same country. */
export function airportForLocation(airports: Airport[], location: UserLocation | null): Airport | null {
  if (!location || airports.length === 0) return null;

  const city = normalize(location.city);
  if (city) {
    const byCity = airports.find((a) => normalize(a.city) === city);
    if (byCity) return byCity;
  }

  const countryCode = location.countryCode?.toUpperCase();
  const country = normalize(location.country);
  return (
    airports.find((a) => (countryCode && countryCodeOf(a) === countryCode) || (country && normalize(a.country) === country)) ??
    null
  );
}
