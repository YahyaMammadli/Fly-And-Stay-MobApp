export type Currency = { code: string; name: string; symbol: string; decimals: number };

export const DEFAULT_CURRENCY = "USD";

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 },
  { code: "CNY", name: "Chinese Yuan", symbol: "CN¥", decimals: 2 },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 0 },
  { code: "AED", name: "UAE Dirham", symbol: "AED ", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR ", decimals: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 0 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF ", decimals: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimals: 0 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "SEK ", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "NOK ", decimals: 2 },
  { code: "PLN", name: "Polish Złoty", symbol: "zł ", decimals: 2 },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", decimals: 2 },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", decimals: 0 },
  { code: "GEL", name: "Georgian Lari", symbol: "₾", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", decimals: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R ", decimals: 2 },
];

// Approximate USD rates, used until live rates are downloaded (or when offline).
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CNY: 7.2, AZN: 1.7, TRY: 34, RUB: 92, AED: 3.67, SAR: 3.75,
  INR: 84, CAD: 1.37, AUD: 1.52, CHF: 0.88, KRW: 1380, BRL: 5.5, MXN: 19, SGD: 1.34, HKD: 7.8,
  SEK: 10.6, NOK: 10.9, PLN: 4, UAH: 41, KZT: 490, GEL: 2.7, EGP: 49, ZAR: 18,
};

const EURO_COUNTRIES = [
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
];

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", JP: "JPY", CN: "CNY", AZ: "AZN", TR: "TRY", RU: "RUB", AE: "AED", SA: "SAR", IN: "INR",
  CA: "CAD", AU: "AUD", CH: "CHF", LI: "CHF", KR: "KRW", BR: "BRL", MX: "MXN", SG: "SGD", HK: "HKD", SE: "SEK",
  NO: "NOK", PL: "PLN", UA: "UAH", KZ: "KZT", GE: "GEL", EG: "EGP", ZA: "ZAR",
  ...Object.fromEntries(EURO_COUNTRIES.map((c) => [c, "EUR"])),
};

export function currencyForCountry(isoCountryCode: string | null | undefined): string {
  return (isoCountryCode && COUNTRY_CURRENCY[isoCountryCode.toUpperCase()]) || DEFAULT_CURRENCY;
}

export function findCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
