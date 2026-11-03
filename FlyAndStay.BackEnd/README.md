# FlyAndStay BackEnd

ASP.NET Core Web API on .NET 8 with Clean Architecture, EF Core (SQL Server), JWT access tokens with rotating refresh tokens,
role-based authorization and password reset through an e-mail code.

## Structure

```
FlyAndStay.sln
src/
  FlyAndStay.Domain          entities and enums: data only, no behaviour
  FlyAndStay.Application     services (use cases), repository and security abstractions, DTOs, filters, exceptions
  FlyAndStay.Infrastructure  EF Core + SQL Server, repositories, unit of work, JWT, PBKDF2, OTP, SMTP, seeding
  FlyAndStay.Api             controllers, authentication / authorization setup, error handling
```

Dependencies point inwards: `Api -> Infrastructure -> Application -> Domain` and `Api -> Application`.
The Application layer knows nothing about EF Core: it talks to the database only through the repository interfaces
(`IUserRepository`, `IFlightRepository`, `IBookingRepository` ...) and `IUnitOfWork`.

Conventions: one type per file, the file name equals the type name, the namespace equals the folder path,
entities contain only properties (plus read-only computed ones), all logic lives in services and repositories.

## Run

.NET 8 is supported until 10 November 2026. To move to .NET 10 later (Visual Studio 2026), change `TargetFramework` to `net10.0` and the package versions `8.0.*` to `10.0.*` in the four `.csproj` files.

Requirements: .NET 8 SDK (Visual Studio 2022 17.8 or newer), SQL Server (LocalDB on Windows is the default connection string).

```bash
cd src/FlyAndStay.Api
dotnet run
```

The API listens on `http://0.0.0.0:5080`. On the first start the database `FlyAndStay` is created and filled with demo data
(airports, airlines, aircraft, 17 hotels, ~90 days of flights). In Development an admin user is created:
`admin@flyandstay.app` / `Admin12345!` (see `appsettings.Development.json`, section `Seed`).

If `dotnet` cannot find the solution projects, create the solution file yourself:

```bash
dotnet new sln -n FlyAndStay
dotnet sln add src/FlyAndStay.Domain src/FlyAndStay.Application src/FlyAndStay.Infrastructure src/FlyAndStay.Api
```

### SQL Server in Docker

```bash
docker run -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Your_strong_Passw0rd' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest

cd src/FlyAndStay.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Server=localhost,1433;Database=FlyAndStay;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True"
```

### Migrations

Without migrations the database is created with `EnsureCreated`. To use migrations:

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate -p src/FlyAndStay.Infrastructure -s src/FlyAndStay.Api
```

When at least one migration exists, the API applies migrations on start instead of `EnsureCreated`.

### E-mail (password reset codes)

```bash
cd src/FlyAndStay.Api
dotnet user-secrets set "Smtp:Host" "smtp.gmail.com"
dotnet user-secrets set "Smtp:Port" "587"
dotnet user-secrets set "Smtp:User" "you@gmail.com"
dotnet user-secrets set "Smtp:Password" "<app password>"
dotnet user-secrets set "Smtp:FromAddress" "you@gmail.com"
```

In Development without `Smtp:Host` the e-mail is printed to the console instead of being sent. In Production a missing SMTP config is an error.

### Secrets

`Jwt:Key` (at least 32 characters) signs the tokens. The Development file has a dev-only key. For real use:
`dotnet user-secrets set "Jwt:Key" "<long random string>"` or the environment variable `Jwt__Key`.

## Authentication

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | create an account, returns `accessToken` + `refreshToken` |
| `POST /api/auth/login` | log in, returns tokens |
| `POST /api/auth/refresh` | exchange a refresh token for a new pair (the old refresh token is revoked) |
| `POST /api/auth/logout` | revoke a refresh token |
| `POST /api/auth/logout-all` | revoke every refresh token of the current user (needs access token) |
| `POST /api/auth/forgot-password` | send a 6-digit code to the e-mail |
| `POST /api/auth/reset-password` | `email` + `code` + `newPassword`; all sessions of the user are revoked |

* Access token: JWT, 15 minutes, carries `sub`, `email`, `name`, `role`.
* Refresh token: 64 random bytes, 30 days. Only its SHA-256 hash is stored. Every refresh rotates the token;
  presenting an already used token revokes all sessions of that user (token theft protection).
* Passwords: PBKDF2-HMAC-SHA256, 600 000 iterations, unique 16-byte salt per user.
* Reset codes: 6 digits, stored as a salted HMAC, valid 10 minutes, 5 attempts, 60 s resend cooldown.
  `forgot-password` always gives the same answer (no account enumeration).
* Rate limit on `/api/auth/*`: 20 requests per minute per IP.

## Push notifications

Pushes are delivered through the Expo Push Service (no Firebase / APNs code on the server).

| Endpoint | Description |
|---|---|
| `POST /api/devices` | register the Expo push token of the current device (`token`, `platform`) |
| `POST /api/devices/unregister` | remove a token (called on log out or when the user turns notifications off) |
| `POST /api/devices/test` | send a test notification to all devices of the current user |
| `GET /api/notifications` | notification history (latest 50) |
| `GET /api/notifications/unread-count` | number for the bell badge |
| `POST /api/notifications/{id}/read`, `POST /api/notifications/read-all` | mark as read |

Notifications are created by the services (not by controllers):

* booking confirmed and booking cancelled (`BookingService`)
* password changed (`AuthService`)
* flight reminder, `Notifications:FlightReminderHours` (24) before departure: `FlightReminderWorker` runs every 5 minutes
  and calls `FlightReminderService`; `Booking.ReminderSentAt` prevents duplicates

Every notification is saved in the `Notifications` table (the in-app inbox) and then pushed to the user's devices.
Tokens that Expo reports as `DeviceNotRegistered` are deleted automatically. A failed push never fails the main request.

Settings (`appsettings.json`): `ExpoPush:Enabled` (when `false`, pushes are only logged), `ExpoPush:AccessToken`
(only if "Enhanced Security" is enabled for your Expo account), `Notifications:FlightReminderHours`.

## Authorization

* `[Authorize]` - any logged in user (profile, bookings). A booking can only be read or cancelled by its owner.
* Policy `AdminOnly` (`role = Admin`) - `GET /api/admin/users`, `GET /api/admin/bookings`.

## Other endpoints

`GET /api/airports`, `/api/destinations`, `/api/airlines`, `/api/airlines/{slug}/aircraft`,
`/api/flights/search`, `/api/flights/calendar`, `/api/flights/{id}`,
`/api/hotels`, `/api/hotels/amenities`, `/api/hotels/{slug}`,
`/api/users/me` (+ `/photo`), `/api/bookings`.
See `src/FlyAndStay.Api/FlyAndStay.Api.http` for ready-made requests.

Prices of a booking are always calculated on the server. Fleets, schedules and prices are demo data.
