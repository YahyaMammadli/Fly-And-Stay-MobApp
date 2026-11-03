# FlyAndStay Mobile

Expo (React Native) app for flights and hotels. Works with the **FlyAndStay.BackEnd** API (ASP.NET Core, Clean Architecture).

## Run

```bash
npm install
npx expo install --fix
npx expo start
```

Start the API first (see `FlyAndStay.BackEnd/README.md`, it listens on port 5080).
In development the app finds the API by itself: same host as Metro, port 5080 (Android emulator: `10.0.2.2`).
The phone and the computer must be on the same Wi-Fi and the firewall must allow port 5080.
For production builds set `EXPO_PUBLIC_API_URL` (see `.env.example`).

## Highlights

* **axios** client with a request interceptor (adds the access token) and a response interceptor:
  on `401` it calls `/api/auth/refresh` once (parallel requests wait for the same refresh), stores the rotated token pair
  and repeats the failed request. If the refresh token is rejected the user is signed out and sent to Sign in.
* **Sign up / Log in / Forgot password** (e-mail code) and **Edit profile** (name, photo, password reset by code).
* **Light / dark theme** through the `useTheme` hook on every screen, switch on the Home screen and in Profile.
* **Shared FlatList catalog** (`components/shared/ui/catalog.tsx`) with search, skeleton loading, error and empty states.
* **Dynamic routes**: `flight/[id]`, `hotel/[slug]`.
* **Airlines & fleet** screen: `<Brands/>` + `<Models/>` with `selectedSlug / setSelectedSlug`.
* Filters and sorting for flights (airlines, stops, price, departure time, baggage, aircraft) and hotels (price, rating, stars, amenities, distance).
* Booking flow: flight details, hotel details, summary, confirmation, My Trips with cancellation.

## Push notifications

* `expo-notifications` registers the device and sends its Expo push token to the API (`POST /api/devices`).
  The token is removed again on log out or when "Push notifications" is switched off in Profile.
* The server sends pushes for: booking confirmed, booking cancelled, password changed and a flight reminder
  24 hours before departure. Every notification is also stored in the inbox (Home bell with unread badge -> Notifications screen).
* Tapping a notification opens the Trips tab (or the Notifications screen); this works from the background and from a cold start.
* Profile has a switch and a "Send a test notification" button, handy to check that everything works.

Requirements (Expo rules):

* Remote push does **not** work in Expo Go on Android and not in simulators/emulators without Google Play services.
  Use a development build on a real device: `npx expo run:android` / `npx expo run:ios`, or `eas build --profile development`.
* The project needs an EAS project id once: `npx eas-cli init` (it writes `extra.eas.projectId` into `app.json`).
* Android: add Firebase (FCM) credentials in EAS (`eas credentials`); iOS: a paid Apple Developer account for APNs.
* Setup guide: https://docs.expo.dev/push-notifications/push-notifications-setup/

## Screens

Welcome, Sign up, Log in, Forgot password, Home, Flights, Flight details, Hotels, Hotel details,
Booking summary, Booking confirmed, My Trips, Profile, Edit profile, Airlines & fleet, Notifications.

## Notes

* Tokens are kept in AsyncStorage. For production use `expo-secure-store`.
* Payment is not integrated: "Confirm Booking" creates the booking directly.
* Flights are one-way; "Return" only sets the default hotel check-out.
