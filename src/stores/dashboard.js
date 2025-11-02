import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useDashboardStore = defineStore("dashboard", {
  state: () => {
    return {
      dashboard: null,
      isLoading: false,
    };
  },

  actions: {
    async fetchDashboard() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://school-barakah.vercel.app/reports/dashboard",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);

        this.dashboard = data;
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

