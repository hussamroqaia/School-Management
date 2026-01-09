import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useEmployeesStore = defineStore("employees", {
  state: () => {
    return {
      employees: [],
      governments: [],
      isLoading: false,
      isLoadingGovernments: false,
      error: null,
    };
  },

  getters: {
    getEmployees: (state) => state.employees,
    getGovernments: (state) => state.governments,
    isLoadingEmployees: (state) => state.isLoading,
  },

  actions: {
    async fetchGovernments() {
      this.isLoadingGovernments = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/governments", {
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
        
        // Handle response structure: { status: true, governments: [...] }
        if (response.governments && Array.isArray(response.governments)) {
          this.governments = response.governments;
        } else if (Array.isArray(response)) {
          this.governments = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.governments = response.data;
        } else {
          this.governments = [];
        }
      } catch (error) {
        console.error("Failed to fetch governments:", error);
        this.error = error.message || "Failed to fetch governments";
        this.governments = [];
      } finally {
        this.isLoadingGovernments = false;
      }
    },

    async fetchEmployees(governmentEntityId) {
      if (!governmentEntityId) {
        this.employees = [];
        return;
      }

      this.isLoading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/indexEmployees?government_entity_id=${governmentEntityId}`;
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
        
        // Handle response structure: { status: true, employees: [...] }
        if (response.employees && Array.isArray(response.employees)) {
          this.employees = response.employees;
        } else if (Array.isArray(response)) {
          this.employees = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.employees = response.data;
        } else {
          this.employees = [];
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        this.error = error.message || "Failed to fetch employees";
        this.employees = [];
      } finally {
        this.isLoading = false;
      }
    },

    async deleteEmployee(employeeId) {
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/deleteEmployee/${employeeId}`;
        const res = await fetch(url, {
          method: "DELETE",
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
          return { success: false, error: "Unauthorized" };
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        return { success: true, data: response };
      } catch (error) {
        console.error("Failed to delete employee:", error);
        return { success: false, error: error.message || "Failed to delete employee" };
      }
    },

    async updateEmployee(employeeId, employeeData) {
      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/updateEmployee/${employeeId}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(employeeData),
        });

        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push({ name: "login-page" });
          return { success: false, error: "Unauthorized" };
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        return { success: true, data: response };
      } catch (error) {
        console.error("Failed to update employee:", error);
        return { success: false, error: error.message || "Failed to update employee" };
      }
    },
  },
});

