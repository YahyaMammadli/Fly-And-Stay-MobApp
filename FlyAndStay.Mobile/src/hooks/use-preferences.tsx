import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Currency,
  currencyForCountry,
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  findCurrency,
} from "@/constants/currencies";
import { CURRENCY_KEY, LANGUAGE_KEY, RATES_KEY } from "@/constants/storage";
import { useLocation } from "@/hooks/use-location";
import i18n from "@/i18n";
import { isLanguageCode, LanguageCode } from "@/i18n/languages";

const RATES_URL = "https://open.er-api.com/v6/latest/USD";
const RATES_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type Rates = { updatedAt: number; rates: Record<string, number> };
type RatesResponse = { result?: string; rates?: Record<string, number> };

export type TranslateVars = Record<string, string | number>;

type PreferencesContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, vars?: TranslateVars) => string;

  currency: Currency;
  /** True when the currency follows the shared location (USD when it was not shared). */
  currencyIsAuto: boolean;
  setCurrency: (code: string | null) => void;
  /** Converts a USD amount from the API and formats it in the selected currency. */
  formatMoney: (usd: number) => string;
  /** Formats an amount that is already in the selected currency. */
  formatAmount: (value: number) => string;
  /** Converts an amount typed in the selected currency back to USD for API filters. */
  toUsd: (value: number) => number;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function format(value: number, currency: Currency): string {
  const decimals = currency.decimals === 0 || Number.isInteger(value) ? 0 : 2;
  const [whole, fraction] = value.toFixed(decimals).split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency.symbol}${withCommas}${fraction ? `.${fraction}` : ""}`;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { location } = useLocation();
  const { t: translate, i18n: instance } = useTranslation();
  const language = (isLanguageCode(instance.language) ? instance.language : "en") as LanguageCode;
  const [manualCurrency, setManualCurrency] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  useEffect(() => {
    (async () => {
      const [[, savedLanguage], [, savedCurrency], [, savedRates]] = await AsyncStorage.multiGet([
        LANGUAGE_KEY,
        CURRENCY_KEY,
        RATES_KEY,
      ]);
      if (isLanguageCode(savedLanguage)) await i18n.changeLanguage(savedLanguage);
      if (savedCurrency) setManualCurrency(savedCurrency);

      const cached = savedRates ? (JSON.parse(savedRates) as Rates) : null;
      if (cached) setRates({ ...FALLBACK_RATES, ...cached.rates });
      if (cached && Date.now() - cached.updatedAt < RATES_MAX_AGE_MS) return;

      try {
        const { data } = await axios.get<RatesResponse>(RATES_URL, { timeout: 10000 });
        if (data.result !== "success" || !data.rates) return;
        setRates({ ...FALLBACK_RATES, ...data.rates });
        await AsyncStorage.setItem(RATES_KEY, JSON.stringify({ updatedAt: Date.now(), rates: data.rates }));
      } catch {
        // Offline: keep the cached or fallback rates.
      }
    })();
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    void i18n.changeLanguage(code);
    AsyncStorage.setItem(LANGUAGE_KEY, code);
  }, []);

  const setCurrency = useCallback((code: string | null) => {
    setManualCurrency(code);
    if (code) AsyncStorage.setItem(CURRENCY_KEY, code);
    else AsyncStorage.removeItem(CURRENCY_KEY);
  }, []);

  // Re-created on every language switch so memoized screens re-render with the new texts.
  const t = useCallback(
    (key: string, vars?: TranslateVars) => translate(key, { ...vars, lng: language }),
    [translate, language],
  );

  const currencyCode =
    manualCurrency ?? (location?.countryCode ? currencyForCountry(location.countryCode) : DEFAULT_CURRENCY);
  const currency = findCurrency(currencyCode);
  const rate = rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1;

  const formatAmount = useCallback((value: number) => format(value, currency), [currency]);
  const formatMoney = useCallback((usd: number) => format(usd * rate, currency), [currency, rate]);
  const toUsd = useCallback((value: number) => value / rate, [rate]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      currency,
      currencyIsAuto: manualCurrency === null,
      setCurrency,
      formatMoney,
      formatAmount,
      toUsd,
    }),
    [language, setLanguage, t, currency, manualCurrency, setCurrency, formatMoney, formatAmount, toUsd],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
