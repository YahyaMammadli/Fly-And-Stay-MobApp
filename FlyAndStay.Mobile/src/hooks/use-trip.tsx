import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { Airport, Flight, HotelDetails, Room } from "@/api/types";
import { addDays, todayISO } from "@/utils/dates";

const DEFAULT_STAY_NIGHTS = 5;

export type Search = {
  // Empty until the user picks an airport (From can be pre-filled from the shared location).
  from: Airport | null;
  to: Airport | null;
  departDate: string;
  returnDate: string;
  passengers: number;

  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type Draft = { flight: Flight | null; hotel: HotelDetails | null; room: Room | null };

type TripContextValue = {
  search: Search;
  updateSearch: (patch: Partial<Search>) => void;
  draft: Draft;
  setFlight: (flight: Flight | null) => void;
  setStay: (hotel: HotelDetails | null, room: Room | null) => void;
  resetDraft: () => void;
};

const TripContext = createContext<TripContextValue | null>(null);

function initialSearch(): Search {
  const depart = addDays(todayISO(), 7);
  const back = addDays(depart, DEFAULT_STAY_NIGHTS);
  return {
    from: null,
    to: null,
    departDate: depart,
    returnDate: back,
    passengers: 1,
    destination: "",
    checkIn: depart,
    checkOut: back,
    guests: 2,
  };
}

export function TripProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState<Search>(initialSearch);
  const [draft, setDraft] = useState<Draft>({ flight: null, hotel: null, room: null });

  const updateSearch = useCallback((patch: Partial<Search>) => {
    setSearch((prev) => {
      const next: Search = { ...prev, ...patch };

      if (patch.to && patch.destination === undefined) next.destination = patch.to.city;

      if (patch.departDate !== undefined) {
        if (patch.checkIn === undefined) next.checkIn = next.departDate;
        if (next.returnDate <= next.departDate) next.returnDate = addDays(next.departDate, DEFAULT_STAY_NIGHTS);
        if (patch.checkOut === undefined) next.checkOut = next.returnDate;
      }
      if (patch.returnDate !== undefined && patch.checkOut === undefined) next.checkOut = next.returnDate;
      if (next.checkOut <= next.checkIn) next.checkOut = addDays(next.checkIn, 1);

      return next;
    });
  }, []);

  const setFlight = useCallback((flight: Flight | null) => setDraft((d) => ({ ...d, flight })), []);
  const setStay = useCallback(
    (hotel: HotelDetails | null, room: Room | null) => setDraft((d) => ({ ...d, hotel, room })),
    [],
  );
  const resetDraft = useCallback(() => setDraft({ flight: null, hotel: null, room: null }), []);

  const value = useMemo(
    () => ({ search, updateSearch, draft, setFlight, setStay, resetDraft }),
    [search, updateSearch, draft, setFlight, setStay, resetDraft],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside <TripProvider>");
  return ctx;
}
