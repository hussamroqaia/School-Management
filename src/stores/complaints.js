import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useComplaintsStore = defineStore("complaints", {
  state: () => {
    return {
      complaints: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 0,
        to: 0,
      },
      isLoading: false,
      error: null,
    };
  },

  getters: {
    getComplaints: (state) => state.complaints,
    isLoadingComplaints: (state) => state.isLoading,
    getPagination: (state) => state.pagination,
  },

  actions: {
    async fetchComplaints(page = 1) {
      this.isLoading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/complaints${page > 1 ? `?page=${page}` : ''}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push({ name: "login-page" });
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        
        // Handle paginated response structure: { status: true, complaints: { data: [...], current_page, ... } }
        if (response.complaints && response.complaints.data && Array.isArray(response.complaints.data)) {
          this.complaints = response.complaints.data;
          this.pagination = {
            current_page: response.complaints.current_page || 1,
            last_page: response.complaints.last_page || 1,
            per_page: response.complaints.per_page || 20,
            total: response.complaints.total || 0,
            from: response.complaints.from || 0,
            to: response.complaints.to || 0,
          };
        } else if (Array.isArray(response)) {
          // Fallback for non-paginated response
          this.complaints = response;
        } else if (response.complaints && Array.isArray(response.complaints)) {
          this.complaints = response.complaints;
        } else if (response.data && Array.isArray(response.data)) {
          this.complaints = response.data;
        } else {
          this.complaints = [];
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
        this.error = error.message || "Failed to fetch complaints";
        this.complaints = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchComplaintsByEntity(userId) {
      this.isLoading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/indexByEntity?user=${userId}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push({ name: "login-page" });
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        
        // Handle response structure: { status: "success", sector: 4, data: [...] }
        if (response.status === "success" && response.data && Array.isArray(response.data)) {
          this.complaints = response.data;
          // Reset pagination for non-paginated response
          this.pagination = {
            current_page: 1,
            last_page: 1,
            per_page: response.data.length,
            total: response.data.length,
            from: 1,
            to: response.data.length,
          };
        } else if (response.data && Array.isArray(response.data)) {
          this.complaints = response.data;
        } else if (Array.isArray(response)) {
          this.complaints = response;
        } else {
          this.complaints = [];
        }
      } catch (error) {
        console.error("Failed to fetch complaints by entity:", error);
        this.error = error.message || "Failed to fetch complaints";
        this.complaints = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});

