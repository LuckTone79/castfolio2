export const SUPPORTED_LOCALES = ["ko", "en", "zh"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = "ko";
