export { App } from "./App";
export { LanguageSwitcher } from "./components/LanguageSwitcher";
export { VideoStudio } from "./components/VideoStudio";
export { ZoomPointPicker } from "./components/ZoomPointPicker";
export {
  defaultLocale,
  detectLocale,
  getMessage,
  isLocale,
  localeLabels,
  locales,
  messages,
  persistLocale,
  type Locale,
  type MessageKey,
  type Messages,
} from "./i18n/config";
export { I18nProvider, useI18n, useT } from "./i18n/context";
export type { Point } from "./lib/types";
