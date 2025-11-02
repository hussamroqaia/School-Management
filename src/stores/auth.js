import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
  }),
  getters: {
    userRole: (state) => state.user?.role || null,
    isOrganization: (state) => state.user?.role === "organization",
    isTeacher: (state) => state.user?.role === "teacher",
  },
  actions: {
    async login(email, password) {
      let res = await fetch(
        "https://school-barakah.vercel.app/auth/organization/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      this.user = data.user;
      router.push({ name: "home" });
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = null;
      router.push({ name: "login-page" });
    },
    initUser() {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user data:", e);
          this.user = null;
        }
      }
    },
  },
});
