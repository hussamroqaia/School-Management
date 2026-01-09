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
        const res = await fetch("http://localhost:8000/api/statistics", {
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
        
        const data = await res.json();
        
        // Map API response structure to dashboard format
        if (data.complaints) {
          this.dashboard = {
            metrics: {
              totalComplaints: data.complaints.total || 0,
              newComplaints: data.complaints.new || 0,
              processingComplaints: data.complaints.processing || 0,
              resolvedComplaints: data.complaints.resolved || 0,
              rejectedComplaints: data.complaints.rejected || 0,
              employeeCount: data.complaints.Employee_Count || 0,
            },
          };
        } else {
          this.dashboard = {
            metrics: {
              totalComplaints: 0,
              newComplaints: 0,
              processingComplaints: 0,
              resolvedComplaints: 0,
              rejectedComplaints: 0,
              employeeCount: 0,
            },
          };
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        this.dashboard = null;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

