import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useMonitoringComplaintsStore = defineStore("monitoringComplaints", {
  state: () => {
    return {
      monitoringData: [],
      isLoading: false,
      error: null,
      complaintDetails: null,
      isLoadingDetails: false,
      detailsError: null,
      // Search state
      isSearching: false,
      searchError: null,
      searchQuery: "",
      // Pagination state
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      lastPage: 1,
    };
  },

  getters: {
    getMonitoringData: (state) => state.monitoringData,
    isLoadingMonitoring: (state) => state.isLoading,
    getComplaintDetails: (state) => state.complaintDetails,
    isLoadingComplaintDetails: (state) => state.isLoadingDetails,
  },

  actions: {
    async fetchMonitoringComplaints(page = 1, perPage = 10, status = null, search = null) {
      this.isLoading = true;
      this.error = null;
      this.currentPage = page;
      this.perPage = perPage;
      
      try {
        const token = localStorage.getItem("token");
        
        // Build URL with query parameters
        const url = new URL("http://localhost:8000/api/MonitoringComplains");
        url.searchParams.append("page", page.toString());
        url.searchParams.append("per_page", perPage.toString());
        
        // Add search parameter if provided
        if (search && search.trim() !== "") {
          url.searchParams.append("search", search.trim());
          this.searchQuery = search.trim();
        } else {
          this.searchQuery = "";
        }
        
        // Add status filter if provided
        if (status && status !== "ALL") {
          url.searchParams.append("status", status);
        }
        
        const res = await fetch(url.toString(), {
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
        console.log("Monitoring Complaints API Response:", response);
        
        // Handle paginated response structure: { data: [...], current_page, per_page, total, last_page }
        if (response.data && Array.isArray(response.data)) {
          this.monitoringData = response.data;
          
          // Extract pagination metadata - ensure values are set correctly
          if (typeof response.current_page === 'number') {
            this.currentPage = response.current_page;
          }
          if (typeof response.per_page === 'number') {
            this.perPage = response.per_page;
          }
          if (typeof response.total === 'number') {
            this.totalItems = response.total;
          } else if (response.total !== undefined && response.total !== null) {
            // Convert to number if it's a string
            this.totalItems = parseInt(response.total, 10) || 0;
          }
          if (typeof response.last_page === 'number') {
            this.lastPage = response.last_page;
          }
          
          console.log("Monitoring data set:", this.monitoringData.length, "items");
          console.log("Pagination state after extraction:", {
            currentPage: this.currentPage,
            perPage: this.perPage,
            totalItems: this.totalItems,
            lastPage: this.lastPage,
            totalItemsType: typeof this.totalItems,
          });
        } else if (Array.isArray(response)) {
          // Fallback: if response is direct array, use client-side pagination
          this.monitoringData = response;
          this.totalItems = response.length;
          this.lastPage = Math.ceil(response.length / perPage);
          console.log("Monitoring data set (direct array):", this.monitoringData.length, "items");
        } else {
          console.warn("Unexpected response structure:", response);
          this.monitoringData = [];
          this.totalItems = 0;
          this.lastPage = 1;
        }
      } catch (error) {
        console.error("Failed to fetch monitoring complaints:", error);
        this.error = error.message || "Failed to fetch monitoring complaints";
        this.monitoringData = [];
        this.totalItems = 0;
        this.lastPage = 1;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchComplaintDetails(referenceNumber) {
      if (!referenceNumber) {
        this.detailsError = "Invalid reference number";
        return null;
      }

      this.isLoadingDetails = true;
      this.detailsError = null;
      this.complaintDetails = null;

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        // URL encode the reference number to handle special characters
        const encodedReferenceNumber = encodeURIComponent(referenceNumber);
        const url = `http://localhost:8000/api/showComplaint/${encodedReferenceNumber}`;
        
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        // Handle 401 Unauthorized
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push({ name: "login-page" });
          return null;
        }

        // Handle 403 Forbidden
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || "Access forbidden. You don't have permission to view this complaint.";
          this.detailsError = errorMessage;
          throw new Error(errorMessage);
        }

        // Handle other errors
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `HTTP error! Status: ${res.status}`;
          this.detailsError = errorMessage;
          throw new Error(errorMessage);
        }

        const response = await res.json();
        
        // Handle different response structures
        let complaintData = null;
        if (response.complaint) {
          complaintData = response.complaint;
        } else if (response.data) {
          complaintData = response.data;
        } else if (response.status && response.data) {
          complaintData = response.data;
        } else if (response.reference_number) {
          // If response itself is the complaint object
          complaintData = response;
        } else {
          complaintData = response;
        }

        this.complaintDetails = complaintData;
        return complaintData;
      } catch (error) {
        console.error("Failed to fetch complaint details:", error);
        this.detailsError = error.message || "Failed to fetch complaint details";
        this.complaintDetails = null;
        return null;
      } finally {
        this.isLoadingDetails = false;
      }
    },

    clearComplaintDetails() {
      this.complaintDetails = null;
      this.detailsError = null;
    },

    async searchComplaints(query, page = 1, perPage = 10, status = null) {
      if (!query || query.trim() === "") {
        // If search is empty, fetch all monitoring complaints
        this.searchQuery = "";
        await this.fetchMonitoringComplaints(page, perPage, status);
        return;
      }

      this.isSearching = true;
      this.searchError = null;
      this.searchQuery = query.trim();
      this.currentPage = page;
      this.perPage = perPage;

      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const url = `http://localhost:8000/api/search`;
        
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            Key_Search: this.searchQuery,
            page: page,
            per_page: perPage,
          }),
        });

        // Handle 401 Unauthorized
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push({ name: "login-page" });
          return;
        }

        // Handle 403 Forbidden
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || "Access forbidden.";
          this.searchError = errorMessage;
          throw new Error(errorMessage);
        }

        // Handle other errors
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `HTTP error! Status: ${res.status}`;
          this.searchError = errorMessage;
          throw new Error(errorMessage);
        }

        const response = await res.json();
        
        // Handle paginated search response structure
        let combinedResults = [];
        let searchData = [];
        
        if (response.data) {
          // Handle paginated response: { data: { user_complaints: {...}, reference_complaints: {...} } }
          if (response.data.user_complaints && response.data.user_complaints.data && Array.isArray(response.data.user_complaints.data)) {
            combinedResults = [...combinedResults, ...response.data.user_complaints.data];
          }
          
          if (response.data.reference_complaints && response.data.reference_complaints.data && Array.isArray(response.data.reference_complaints.data)) {
            combinedResults = [...combinedResults, ...response.data.reference_complaints.data];
          }
          
          // Remove duplicates based on complaint_id or reference_number
          const uniqueResults = combinedResults.filter((item, index, self) => {
            const identifier = item.complaint_id || item.reference_number;
            return index === self.findIndex((t) => (t.complaint_id || t.reference_number) === identifier);
          });
          
          searchData = uniqueResults;
          
          // Extract pagination metadata if available (from either user_complaints or reference_complaints)
          if (response.data.user_complaints) {
            if (response.data.user_complaints.current_page !== undefined) {
              this.currentPage = response.data.user_complaints.current_page;
            }
            if (response.data.user_complaints.per_page !== undefined) {
              this.perPage = response.data.user_complaints.per_page;
            }
            if (response.data.user_complaints.total !== undefined) {
              this.totalItems = response.data.user_complaints.total;
            }
            if (response.data.user_complaints.last_page !== undefined) {
              this.lastPage = response.data.user_complaints.last_page;
            }
          }
        } else if (response.data && Array.isArray(response.data)) {
          searchData = response.data;
          // If no pagination metadata, calculate from array length
          this.totalItems = response.data.length;
          this.lastPage = Math.ceil(response.data.length / perPage);
        } else if (response.complaints && Array.isArray(response.complaints)) {
          searchData = response.complaints;
          this.totalItems = response.complaints.length;
          this.lastPage = Math.ceil(response.complaints.length / perPage);
        } else if (response.results && Array.isArray(response.results)) {
          searchData = response.results;
          this.totalItems = response.results.length;
          this.lastPage = Math.ceil(response.results.length / perPage);
        } else if (Array.isArray(response)) {
          searchData = response;
          this.totalItems = response.length;
          this.lastPage = Math.ceil(response.length / perPage);
        } else {
          searchData = [];
          this.totalItems = 0;
          this.lastPage = 1;
        }
        
        // Transform search results to match monitoring complaints format
        // Search results have: complaint_id, reference_number, user_id, government_entity_id, type, location, description, status, created_at, updated_at, user: { name, email, ... }
        // Monitoring format needs: reference_number, citizen_name, status, note, handled_by_employee, changed_at
        this.monitoringData = searchData.map((complaint) => ({
          reference_number: complaint.reference_number,
          citizen_name: complaint.user?.name || "-",
          status: complaint.status,
          note: null, // Search results don't include notes
          handled_by_employee: null, // Search results don't include handled_by info
          changed_at: complaint.updated_at || complaint.created_at || null,
          // Keep original data for details view
          _original: complaint,
        }));
      } catch (error) {
        console.error("Failed to search complaints:", error);
        this.searchError = error.message || "Failed to search complaints";
        this.monitoringData = [];
      } finally {
        this.isSearching = false;
      }
    },
  },
});

