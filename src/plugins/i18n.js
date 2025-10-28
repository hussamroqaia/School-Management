import { createI18n } from "vue-i18n";

import en from "@/messages/en";
import ar from "@/messages/ar";

const defaultLocale = localStorage.getItem("lang");

const i18n = createI18n({
  locale: defaultLocale,
  legacy: false,
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
});

export default i18n;
