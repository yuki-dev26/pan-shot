export { App } from "./App";
export { InstallButton } from "./components/InstallButton";
export { LanguageSwitcher } from "./components/LanguageSwitcher";
export { PwaInstallDialog } from "./components/PwaInstallDialog";
export { VideoStudio } from "./components/VideoStudio";
export { ZoomPointPicker } from "./components/ZoomPointPicker";
export { usePwaInstall } from "./hooks/usePwaInstall";
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
