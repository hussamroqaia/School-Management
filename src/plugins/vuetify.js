import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import * as labs from "vuetify/labs/components";
import { createVuetify } from "vuetify";
import { ar, en } from "vuetify/locale";

const savedLang = localStorage.getItem("lang") || "en";

export default createVuetify({
  theme: {
    defaultTheme: localStorage.getItem("theme") || "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2", // Blue
          secondary: "#424242", // Grey
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
          background: "#F5F5F5",
          surface: "#FFFFFF",
          "on-primary": "#FFFFFF",
          "on-secondary": "#FFFFFF",
          "on-surface": "#212121",
          "on-background": "#212121",
          "on-error": "#FFFFFF",
          "on-info": "#FFFFFF",
          "on-success": "#FFFFFF",
          "on-warning": "#FFFFFF",
        },
      },
      dark: {
        colors: {
          primary: "#2196F3", // Lighter blue for dark mode
          secondary: "#616161", // Lighter grey for dark mode
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#64B5F6",
          success: "#66BB6A",
          warning: "#FFB74D",
          background: "#121212",
          surface: "#1E1E1E",
          "on-primary": "#FFFFFF",
          "on-secondary": "#FFFFFF",
          "on-surface": "#FFFFFF",
          "on-background": "#FFFFFF",
          "on-error": "#FFFFFF",
          "on-info": "#FFFFFF",
          "on-success": "#FFFFFF",
          "on-warning": "#FFFFFF",
        },
      },
    },
  },
  locale: {
    locale: savedLang,
    fallback: "en",
    messages: { ar, en },
  },
  rtl: savedLang === "ar",
  components: {
    ...labs,
  },
});
