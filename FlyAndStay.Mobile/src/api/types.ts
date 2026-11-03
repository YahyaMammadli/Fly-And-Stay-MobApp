export type User = {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin";
  hasPhoto: boolean;
  photoVersion: number;
};
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: User;
};

export type Airport = { code: string; city: string; country: string; name: string };
export type Destination = {
  city: string;
  airportCode: string;
  airportName: string;
  country: string;
  fromPrice: number | null;
  color: string;
  icon: string;
};

export type Airline = { slug: string; code: string; name: string; color: string };
export type AirlineBrand = Airline & { fleetSize: number; modelsCount: number };
export type AircraftModel = {
  slug: string;
  name: string;
  manufacturer: string;
  seats: number;
  rangeKm: number;
  cruiseSpeedKmh: number;
  fleetCount: number;
  upcomingFlights: number;
};

export type Flight = {
  id: number;
  flightNumber: string;
  airline: Airline;
  from: Airport;
  to: Airport;
  departAt: string;
  arriveAt: string;
  durationMinutes: number;
  stops: number;
  via: string | null;
  aircraft: string;
  aircraftSlug: string;
  baggage: string;
  checkedBagIncluded: boolean;
  mealIncluded: boolean;
  cancellation: string;
  fare: number;
  taxes: number;
  price: number;
};
export type CalendarDay = { date: string; minPrice: number | null };

export type Amenity = { code: string; name: string; icon: string };
export type HotelSummary = {
  id: number;
  slug: string;
  name: string;
  city: string;
  district: string;
  distanceToCenterKm: number;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  imageUrl: string | null;
  coverColor: string;
  amenities: string[];
};
export type Room = { id: number; type: string; name: string; maxGuests: number; beds: string; pricePerNight: number };
export type HotelDetails = Omit<HotelSummary, "pricePerNight" | "amenities"> & {
  address: string;
  description: string;
  amenities: Amenity[];
  rooms: Room[];
};

export type BookedStay = {
  hotelSlug: string;
  hotelName: string;
  city: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  coverColor: string;
};
export type Booking = {
  id: string;
  reference: string;
  status: "Confirmed" | "Cancelled";
  createdAt: string;
  passengers: number;
  guests: number;
  flight: Flight | null;
  stay: BookedStay | null;
  flightTotal: number;
  hotelTotal: number;
  total: number;
  startDate: string;
  endDate: string;
};

export type NotificationType =
  | "BookingConfirmed"
  | "BookingCancelled"
  | "FlightReminder"
  | "PasswordChanged"
  | "Info";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId: string | null;
  createdAt: string;
  isRead: boolean;
};
