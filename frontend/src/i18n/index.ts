import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'vi',
    // Disable built-in debug logging to avoid noisy console output for missing keys
    // Set to true only when you explicitly want to see i18next internal logs
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    // When a key is missing, create a human-friendly label from the key (e.g. "admin.accounts.title" -> "Accounts Title")
    parseMissingKeyHandler: (key) => {
      try {
        const parts = String(key).split('.');
        // drop leading namespace like "admin" if present
        const meaningfulParts = parts.length > 1 ? parts.slice(1) : parts;
        const humanized = meaningfulParts
          .map(p => p.replace(/([A-Z])/g, ' $1')) // handle camelCase if any
          .join(' ')
          .replace(/[_-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        // Capitalize first letter of each word
        return humanized.replace(/\b\w/g, (c) => c.toUpperCase());
      } catch (e) {
        return String(key);
      }
    },
  });

export default i18n;









