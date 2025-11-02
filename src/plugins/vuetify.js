import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import * as labs from "vuetify/labs/components";
import { createVuetify } from "vuetify";
import { ar, en } from "vuetify/locale";

const savedLang = localStorage.getItem("lang") || "en";

export default createVuetify({
  theme: {
    defaultTheme: localStorage.getItem('theme') || 'light',
  },
  locale: {
    locale: savedLang,
    fallback: 'en',
    messages: { ar, en },
  },
  rtl: savedLang === 'ar',
  components: {
    ...labs,
  },
});
