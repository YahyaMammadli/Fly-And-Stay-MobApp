import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LANGUAGE, isLanguageCode, LanguageCode } from "./languages";
import ar from "./locales/ar.json";
import az from "./locales/az.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import ja from "./locales/ja.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import tr from "./locales/tr.json";
import zh from "./locales/zh.json";

const locales: Record<LanguageCode, Record<string, string>> = { en, zh, hi, es, fr, ar, pt, ru, de, ja, tr, az };

/** The device language when the app supports it, English otherwise. */
export function deviceLanguage(): LanguageCode {
  const code = getLocales()[0]?.languageCode;
  return isLanguageCode(code) ? code : DEFAULT_LANGUAGE;
}

void i18n.use(initReactI18next).init({
  resources: Object.fromEntries(Object.entries(locales).map(([code, translation]) => [code, { translation }])),
  lng: deviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  // Keys are the English texts, which contain dots and colons.
  keySeparator: false,
  nsSeparator: false,
  // Placeholders are written as {name} in the locale files.
  interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
  returnEmptyString: false,
  initAsync: false,
});

export default i18n;
