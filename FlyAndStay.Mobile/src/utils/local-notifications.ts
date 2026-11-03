import * as Notifications from "expo-notifications";

import { Booking } from "@/api/types";
import { ANDROID_CHANNEL_ID } from "@/utils/push";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const PROMO_PREFIX = "promo-";
const FLIGHT_PREFIX = "flight-";

// Promos go out every 2-3 hours while the app is not in use, but never at night.
const PROMO_COUNT = 8;
const PROMO_MIN_GAP_MS = 2 * 60 * 60 * 1000;
const PROMO_MAX_GAP_MS = 3 * 60 * 60 * 1000;
const QUIET_FROM_HOUR = 22;
const QUIET_UNTIL_HOUR = 9;

const HOUR_MS = 60 * 60 * 1000;
const FLIGHT_REMINDERS_HOURS = [24, 3];

const PROMOS: { title: string; body: string }[] = [
  { title: "✈️ Your next adventure is waiting", body: "Fresh deals on flights and hotels just landed. Make a new booking today!" },
  { title: "🌴 Time for a getaway?", body: "Discover top destinations and lock in today's best prices." },
  { title: "🏨 Flight + hotel in one tap", body: "Bundle your whole trip with Fly&Stay and travel stress-free." },
  { title: "🔥 Prices are taking off", body: "Check the latest fares before they're gone." },
  { title: "🌍 Where to next?", body: "Plan your next trip now and start counting down the days." },
];

async function cancelByPrefix(prefix: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

function outsideQuietHours(time: number): number {
  const date = new Date(time);
  const hour = date.getHours();
  if (hour >= QUIET_FROM_HOUR) {
    date.setDate(date.getDate() + 1);
  } else if (hour >= QUIET_UNTIL_HOUR) {
    return time;
  }
  date.setHours(QUIET_UNTIL_HOUR, Math.floor(Math.random() * 60), 0, 0);
  return date.getTime();
}

/** Replaces the pending promo notifications; call whenever the app is opened so they only fire while it is idle. */
export async function schedulePromoNotifications(t: Translate) {
  await cancelByPrefix(PROMO_PREFIX);

  let at = Date.now();
  const offset = Math.floor(Math.random() * PROMOS.length);

  for (let i = 0; i < PROMO_COUNT; i++) {
    at = outsideQuietHours(at + PROMO_MIN_GAP_MS + Math.random() * (PROMO_MAX_GAP_MS - PROMO_MIN_GAP_MS));
    const promo = PROMOS[(offset + i) % PROMOS.length];

    await Notifications.scheduleNotificationAsync({
      identifier: `${PROMO_PREFIX}${i}`,
      content: { title: t(promo.title), body: t(promo.body), data: { url: "/home", type: "Promo" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: ANDROID_CHANNEL_ID },
    });
  }
}

export function cancelPromoNotifications() {
  return cancelByPrefix(PROMO_PREFIX);
}

/**
 * Schedules on-device reminders before each upcoming flight, so they arrive even with the app closed.
 * When server push is active the server already sends the 24h reminder, so only the 3h one is added.
 */
export async function scheduleFlightReminders(bookings: Booking[], t: Translate, serverPushActive: boolean) {
  await cancelByPrefix(FLIGHT_PREFIX);

  const now = Date.now();
  const hours = serverPushActive ? FLIGHT_REMINDERS_HOURS.filter((h) => h < 24) : FLIGHT_REMINDERS_HOURS;

  for (const booking of bookings) {
    const flight = booking.flight;
    if (booking.status !== "Confirmed" || !flight) continue;

    // departAt is the airport's local time without an offset; it is read as device time.
    const departure = new Date(flight.departAt).getTime();
    const time = flight.departAt.slice(11, 16);

    for (const h of hours) {
      const at = departure - h * HOUR_MS;
      if (at <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${FLIGHT_PREFIX}${booking.id}-${h}`,
        content: {
          title: t("Flight {number} departs soon", { number: flight.flightNumber }),
          body: t("{from} to {to}, departure at {time}", { from: flight.from.city, to: flight.to.city, time }),
          data: { url: "/trips", type: "FlightReminder", bookingId: booking.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: ANDROID_CHANNEL_ID },
      });
    }
  }
}

export function cancelFlightReminders() {
  return cancelByPrefix(FLIGHT_PREFIX);
}
