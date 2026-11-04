# Fly&Stay

Mobile app for booking **flights and hotels in one trip**: search one-way flights, pick a hotel in the destination city,
book both and keep everything in *My Trips*. The app shows hotels on a map, builds the route from the airport to the
hotel, sends booking and flight reminders, and works in 12 languages and 27 currencies.

The repository has two parts:

| Folder | What it is |
|---|---|
| [`FlyAndStay.BackEnd`](FlyAndStay.BackEnd) | ASP.NET Core 8 Web API, Clean Architecture, EF Core + SQL Server, JWT with rotating refresh tokens |
| [`FlyAndStay.Mobile`](FlyAndStay.Mobile) | Expo (React Native) app with expo-router, TypeScript, light/dark theme, i18n, maps |

More detail for each part: [backend README](FlyAndStay.BackEnd/README.md), [mobile README](FlyAndStay.Mobile/README.md).

---

## Features

**Account**
- Sign up, log in, log out on one or all devices.
- Password reset with a 6-digit e-mail code; strong password rules with a live strength meter.
- Profile editing: name, photo, password.

**Flights**
- Search by origin, destination and date with a price calendar.
- Filters: airlines, stops, price, departure time, baggage, aircraft; sorting by price, duration and time.
- Flight details with the great-circle flight path on a map and the distance.
- *Airlines & fleet* screen with every airline and its aircraft.

**Hotels**
- Catalog with search, filters (price, rating, stars, amenities, distance to centre) and sorting.
- **List / Map** switch: price pins on the map, tap a pin to see the hotel card.
- Hotel page with a location block: mini map, address, distance to the centre, to the airport (with car time) and to you.

**Booking and trips**
- Flight + hotel booking in one flow, prices always calculated on the server.
- Confirmation screen and *My Trips* with cancellation.
- **Getting to your hotel**: road route from the arrival airport (or from your location) with distance and car time,
  one tap to open turn-by-turn directions or public transport in Google Maps / Apple Maps.

**Explore**
- Map of the cheapest fares from your departure airport, tap a city to see the flight arc and jump to flights or hotels.
- The Home screen shows destinations and prices from the airport nearest to you.

**Notifications**
- Push (Expo Push Service): booking confirmed, booking cancelled, password changed, flight reminder 24 hours before departure.
- In-app inbox with an unread badge; local notifications as a fallback.

**Personalisation**
- 12 languages: English, Chinese, Hindi, Spanish, French, Arabic (RTL), Portuguese, Russian, German, Japanese, Turkish,
  Azerbaijani. Map labels follow the app language.
- 27 currencies with conversion on the client.
- Light, dark or automatic theme (follows the system), the maps follow it too.
- Geolocation: nearest airport as the default origin, distances "from you".

---

## Tech stack

| Area | Technologies |
|---|---|
| API | .NET 8, ASP.NET Core Web API, Clean Architecture (Domain / Application / Infrastructure / Api) |
| Database | SQL Server (LocalDB by default), Entity Framework Core 8, migrations and seeding on start |
| Security | JWT access tokens (15 min), rotating refresh tokens (30 days, SHA-256 hashed), PBKDF2-SHA256 (600 000 iterations), rate limiting, role-based authorization |
| E-mail | SMTP (e.g. Gmail with an app password), console output in Development |
| Push | Expo Push Service, background worker for flight reminders |
| Mobile | Expo SDK 58, React Native 0.88, React 19, TypeScript, expo-router (typed routes), React Compiler |
| Forms | react-hook-form + zod |
| Network | axios with token refresh interceptor |
| i18n | i18next + react-i18next, expo-localization |
| Maps | MapLibre GL JS + OpenFreeMap vector tiles in `react-native-webview` (free, no API keys); OSRM for road routes |
| Device | expo-location, expo-notifications, expo-image-picker |

---

## Project structure

```
FlyAndStay/
├── FlyAndStay.BackEnd/
│   └── FlyAndStay/
│       ├── FlyAndStay.sln
│       ├── FlyAndStay.Domain/          entities and enums
│       ├── FlyAndStay.Application/     services (use cases), DTOs, repository and security abstractions
│       ├── FlyAndStay.Infrastructure/  EF Core, repositories, migrations, seeding, JWT, PBKDF2, SMTP, Expo push
│       └── FlyAndStay.Api/             controllers, auth setup, error handling, appsettings
└── FlyAndStay.Mobile/
    ├── app.json, package.json
    └── src/
        ├── app/            screens (expo-router): (tabs), auth, booking, flight/[id], hotel/[slug], explore, route ...
        ├── api/            axios client and typed API calls
        ├── components/     UI by feature: flights, hotels, trips, shared (catalog, travel map, skeletons ...)
        ├── hooks/          theme, auth, preferences, location, push
        ├── i18n/           i18next setup and 12 locale files
        ├── constants/      colours, currencies, map providers, storage keys
        └── utils/          maps (distance, routes, directions), formatting, route links
```

Dependencies in the backend point inwards: `Api → Infrastructure → Application → Domain`.
The Application layer talks to the database only through repository interfaces and `IUnitOfWork`.

---

## Getting started

### Requirements

- **.NET 8 SDK** (Visual Studio 2022 17.8+ or the `dotnet` CLI)
- **SQL Server**: LocalDB (comes with Visual Studio on Windows) or SQL Server in Docker
- **Node.js 20+** and npm
- For Android: **Android Studio** (SDK + emulator) or a phone with **Expo Go** / a development build
- For iOS: Xcode on macOS, or Expo Go on an iPhone

### 1. Run the API

```bash
cd FlyAndStay.BackEnd/FlyAndStay
dotnet run --project FlyAndStay.Api --launch-profile http
```

- The API listens on `http://0.0.0.0:5080`.
- On the first start the database `FlyAndStay_DB` is created, all migrations are applied and demo data is seeded:
  5 airports (Baku, Istanbul, Dubai, New York, London), airlines and fleets, 17 hotels and about 90 days of flights.
- An admin account is created from the `Seed` section (`AdminEmail`, `AdminPassword`). Put these values in
  `appsettings.Development.json` or in user secrets, never in a committed file.

Configuration (`FlyAndStay.Api/appsettings.json`, override with user secrets or environment variables):

| Key | Meaning |
|---|---|
| `ConnectionStrings:Default` | SQL Server connection (LocalDB by default) |
| `Jwt:Key` | token signing key, at least 32 characters, **secret** |
| `Jwt:AccessTokenMinutes`, `Jwt:RefreshTokenDays` | token lifetimes |
| `Smtp:*` | mail server for reset codes; without `Smtp:Host` the code is printed to the console in Development |
| `Seed:AdminEmail`, `Seed:AdminPassword` | admin account created on start |
| `Cors:Origins` | allowed origins for web clients |
| `ExpoPush:Enabled`, `ExpoPush:AccessToken` | push delivery |
| `Notifications:FlightReminderHours` | when the flight reminder is sent (24 by default) |

Secrets example:

```bash
cd FlyAndStay.BackEnd/FlyAndStay/FlyAndStay.Api
dotnet user-secrets set "Jwt:Key" "<long random string>"
dotnet user-secrets set "Smtp:Host" "smtp.gmail.com"
dotnet user-secrets set "Smtp:User" "you@gmail.com"
dotnet user-secrets set "Smtp:Password" "<app password>"
```

### 2. Run the mobile app

```bash
cd FlyAndStay.Mobile
npm install
npx expo start
```

- Scan the QR code with **Expo Go**, or press `a` for the Android emulator.
- In development the app finds the API by itself: the same host as Metro, port `5080`
  (the Android emulator uses `10.0.2.2`). The phone and the computer must be on the same Wi-Fi and the firewall must allow port 5080.
- For another API address create `.env` from `.env.example` and set `EXPO_PUBLIC_API_URL`.

**Development build** (needed for remote push and native modules on Android):

```bash
npx expo run:android
```

With a build installed, start Metro with `npx expo start --dev-client` and forward the ports to the emulator or a USB phone:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5080 tcp:5080
```

VS Code users have both commands as tasks in `FlyAndStay.Mobile/.vscode/tasks.json`.

Optional map settings in `.env` (all have free defaults):

| Variable | Default |
|---|---|
| `EXPO_PUBLIC_MAP_STYLE_LIGHT` | `https://tiles.openfreemap.org/styles/liberty` |
| `EXPO_PUBLIC_MAP_STYLE_DARK` | `https://tiles.openfreemap.org/styles/dark` |
| `EXPO_PUBLIC_ROUTING_URL` | public OSRM demo server; use your own OSRM in production |

---

## API overview

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `login`, `refresh`, `logout`, `logout-all`, `forgot-password`, `reset-password` |
| Users | `GET/PUT /api/users/me`, `GET/PUT/DELETE /api/users/me/photo` |
| Reference data | `GET /api/airports`, `/api/destinations?from=GYD`, `/api/airlines`, `/api/airlines/{slug}/aircraft` |
| Flights | `GET /api/flights/search`, `/api/flights/calendar`, `/api/flights/{id}` |
| Hotels | `GET /api/hotels`, `/api/hotels/amenities`, `/api/hotels/{slug}` |
| Bookings | `GET/POST /api/bookings`, `GET /api/bookings/{id}`, `POST /api/bookings/{id}/cancel` |
| Devices and notifications | `POST /api/devices`, `/api/devices/unregister`, `/api/devices/test`, `GET /api/notifications`, unread count, mark read |
| Admin (role `Admin`) | `GET /api/admin/users`, `/api/admin/bookings` |

Ready-made requests are in `FlyAndStay.Api/FlyAndStay.Api.http`. The full description of each endpoint is in the
[backend README](FlyAndStay.BackEnd/README.md).

---

## Security notes

- Passwords are hashed with PBKDF2-HMAC-SHA256 and a unique salt; refresh tokens are stored only as hashes and rotate on every use.
  Reusing an old refresh token revokes all sessions of the user.
- Reset codes are valid for 10 minutes, allow 5 attempts and have a 60 s resend cooldown; `forgot-password` does not reveal whether an account exists.
- `/api/auth/*` is rate limited (20 requests per minute per IP).
- Keep `Jwt:Key`, SMTP passwords and seed passwords in user secrets or environment variables, not in git.

## Limitations

- Flights, fleets, schedules and prices are demo data; payment is not integrated (*Confirm booking* creates the booking directly).
- Flights are one-way; *Return* only sets the default hotel check-out date.
- Remote push does not work in Expo Go on Android: use a development build and configure EAS / FCM.
- The public OSRM server is for light use only.
- Tokens are kept in AsyncStorage; use `expo-secure-store` for production.

## License

The source code is released under the [MIT License](LICENSE) © 2026 Yahya Mammadli.

Third-party services and data used by the app keep their own licenses:

| Component | License / terms |
|---|---|
| [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) | BSD-3-Clause |
| Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors | ODbL 1.0 (attribution shown on every map) |
| [OpenFreeMap](https://openfreemap.org) tiles and styles, [OpenMapTiles](https://openmaptiles.org) schema | free use with attribution |
| [OSRM](https://project-osrm.org) routing | BSD-2-Clause; the public demo server has a usage policy for light use only |
| Expo, React Native and npm / NuGet packages | their own licenses (mostly MIT), see `package.json` and the `.csproj` files |

Schedules, fares and hotel prices in the seed data are demo content. Airline and aircraft names and logos belong to their owners; the project is not affiliated with them.
