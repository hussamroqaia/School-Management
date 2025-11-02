import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useBusStore = defineStore("bus", {
  state: () => {
    return {
      buses: [],
      bus: {},
      isLoading: false,
    };
  },

  actions: {
    async listBuses() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://school-barakah.vercel.app/buses", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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

        this.buses = data;
      } catch (error) {
        console.error("Failed to fetch buses:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addBus(payload) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://school-barakah.vercel.app/buses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
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
        return { success: true, data };
      } catch (error) {
        console.error("Failed to add bus:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBus(id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/buses/${id}`,
          {
            method: "DELETE",
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
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to delete bus. Status: ${res.status}`
          );
        }
        return { success: true };
      } catch (error) {
        console.error("Failed to delete bus:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateBus(payload, id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/buses/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
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
        return { success: true, data };
      } catch (error) {
        console.error("Failed to update bus:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getBus(id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/buses/${id}`,
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
        this.bus = data;
        console.log(this.bus);
      } catch (error) {
        console.error("Failed to fetch bus:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});

