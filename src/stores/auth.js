import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({}),
  actions: {
    async login(email, password) {
      let data = await fetch(
        "https://school-barakah.vercel.app/auth/organization/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      data = await data.json();
      localStorage.setItem("token", data.access_token);
      router.push({ name: "home" });
    },
  },
});
