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
    isAdmin: (state) => state.user?.role === "admin",
  },
  actions: {
    async login(email, password) {
      try {
        const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

        // Check if the response is successful
        if (!res.ok) {
          // Handle error responses (401, 422, etc.)
          const errorMessage = data.message || data.error || "Login failed. Please check your credentials.";
          throw new Error(errorMessage);
        }

        // Only proceed if login is successful
        if (!data.token) {
          throw new Error("Invalid response from server");
        }

      localStorage.setItem("token", data.token);
        // Handle API response structure: user_id, role
        let userData = {
          id: data.user_id,
          role: data.role,
          email: email, // Store email from login
        };

        localStorage.setItem("user", JSON.stringify(userData));
        this.user = userData;
        
        // Redirect based on user role
        if (data.role === "employee") {
          router.push({ name: "complaints" });
        } else {
      router.push({ name: "home" });
        }
      } catch (error) {
        // Re-throw the error so the component can handle it
        throw error;
      }
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.user = null;
      router.push({ name: "login-page" });
    },
    async initUser() {
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
