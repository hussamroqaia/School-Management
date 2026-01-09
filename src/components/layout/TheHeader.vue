<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="$emit('drawer', !drawer)"></v-app-bar-nav-icon>

    <v-app-bar-title>{{ $t("Application") }}</v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn
      icon
      @click="toggleTheme"
      :title="isDark ? $t('Switch to Light Mode') : $t('Switch to Dark Mode')"
    >
      <v-icon>{{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
    </v-btn>

    <v-btn
      icon
      @click="toggleLanguage"
      :title="
        currentLocale === 'ar'
          ? $t('Switch to English')
          : $t('Switch to Arabic')
      "
    >
      <v-icon>mdi-translate</v-icon>
    </v-btn>
    <v-chip class="ma-2" variant="text">{{
      currentLocale.toUpperCase()
    }}</v-chip>

    <v-btn icon @click="logout" :title="$t('Logout')">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<script>
import { mapActions } from "pinia";
import { useAuthStore } from "@/stores/auth";

export default {
  props: ["drawer"],
  data() {
    return {
      currentTheme: localStorage.getItem("theme") || "light",
    };
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale || "en";
    },
    isDark() {
      return this.currentTheme === "dark";
    },
  },
  mounted() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    console.log({ savedTheme });
    this.currentTheme = savedTheme;

    // Set HTML class for theme
    const html = document.documentElement;
    if (savedTheme === "dark") {
      html.classList.add("v-theme--dark");
      html.classList.remove("v-theme--light");
    } else {
      html.classList.add("v-theme--light");
      html.classList.remove("v-theme--dark");
    }

    if (this.$vuetify && this.$vuetify.theme) {
      this.$vuetify.theme.global.name = savedTheme;
    }

    // Initialize RTL based on saved language
    const savedLang = localStorage.getItem("lang") || "en";
    document.documentElement.setAttribute(
      "dir",
      savedLang === "ar" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", savedLang);

    if (this.$vuetify) {
      if (this.$vuetify.locale) {
        this.$vuetify.locale.current = savedLang;
      }
      this.$vuetify.rtl = savedLang === "ar";
    }
  },
  methods: {
    toggleTheme() {
      const newTheme = this.currentTheme === "dark" ? "light" : "dark";
      this.currentTheme = newTheme;

      if (this.$vuetify && this.$vuetify.theme) {
        this.$vuetify.theme.global.name = newTheme;
      }

      // Also update HTML class for CSS-based theming
      const html = document.documentElement;
      if (newTheme === "dark") {
        html.classList.add("v-theme--dark");
        html.classList.remove("v-theme--light");
      } else {
        html.classList.add("v-theme--light");
        html.classList.remove("v-theme--dark");
      }

      localStorage.setItem("theme", newTheme);
    },
    toggleLanguage() {
      const newLocale = this.$i18n.locale === "ar" ? "en" : "ar";
      this.$i18n.locale = newLocale;
      localStorage.setItem("lang", newLocale);

      // Update HTML dir attribute for RTL
      document.documentElement.setAttribute(
        "dir",
        newLocale === "ar" ? "rtl" : "ltr"
      );
      document.documentElement.setAttribute("lang", newLocale);

      // Update Vuetify locale and RTL
      if (this.$vuetify) {
        if (this.$vuetify.locale) {
          this.$vuetify.locale.current = newLocale;
        }
        this.$vuetify.rtl = newLocale === "ar";
      }
    },
    ...mapActions(useAuthStore, ["logout"]),
  },
};
</script>
