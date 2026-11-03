import { useEffect, useState } from "react";

import { Airport } from "@/api/types";
import { travelApi } from "@/api/travel";

let cache: Airport[] | null = null;

export function useAirports() {
  const [airports, setAirports] = useState<Airport[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let active = true;
    travelApi
      .airports()
      .then((list) => {
        cache = list;
        if (active) setAirports(list);
      })
      .catch(() => {

      });
    return () => {
      active = false;
    };
  }, []);

  return airports;
}
