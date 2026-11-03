import { Href, router } from "expo-router";

// A notification tapped on a cold start arrives before the splash screen has sent the user to the tabs,
// and that redirect would replace the screen it opened. Keep the link until the tabs are on screen.
let tabsReady = false;
let pendingUrl: Href | null = null;

export function openNotificationUrl(url: Href) {
  if (tabsReady) router.push(url);
  else pendingUrl = url;
}

/** Called once the tab navigator is mounted; opens a link that was tapped while the app was starting. */
export function markTabsReady() {
  tabsReady = true;
  const url = pendingUrl;
  pendingUrl = null;
  if (url) setTimeout(() => router.push(url), 0);
}
