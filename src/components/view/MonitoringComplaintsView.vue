<script>
import { useMonitoringComplaintsStore } from "@/stores/monitoringComplaints";
import { mapState, mapActions } from "pinia";

export default {
  name: "MonitoringComplaintsView",
  
  data() {
    return {
      search: "",
      selectedStatus: "ALL",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      detailsDialog: false,
      searchTimeout: null,
      isExporting: false,
    };
  },

  computed: {
    ...mapState(useMonitoringComplaintsStore, [
      "monitoringData",
      "isLoading",
      "error",
      "complaintDetails",
      "isLoadingDetails",
      "detailsError",
      "isSearching",
      "searchError",
      "currentPage",
      "perPage",
      "totalItems",
      "lastPage",
    ]),
    
    hasData() {
      return this.monitoringData && this.monitoringData.length > 0;
    },

    headers() {
      return [
        {
          title: this.$t("Reference Number"),
          key: "reference_number",
          sortable: true,
          width: "150px",
        },
        {
          title: this.$t("Citizen Name"),
          key: "citizen_name",
          sortable: true,
        },
        {
          title: this.$t("Status"),
          key: "status",
          sortable: true,
          width: "120px",
          align: "center",
        },
        {
          title: this.$t("Note"),
          key: "note",
          sortable: false,
        },
        {
          title: this.$t("Handled By"),
          key: "handled_by_employee",
          sortable: true,
        },
        {
          title: this.$t("Changed At"),
          key: "changed_at",
          sortable: true,
          width: "180px",
        },
        {
          title: this.$t("Actions"),
          key: "actions",
          sortable: false,
          width: "120px",
          align: "end",
        },
      ];
    },

    statusOptions() {
      // Always show all available status options regardless of current data
      return [
        { title: this.$t("All"), value: "ALL" },
        { title: this.$t("New"), value: "new" },
        { title: this.$t("Processing"), value: "processing" },
        { title: this.$t("Resolved"), value: "resolved" },
        { title: this.$t("Rejected"), value: "rejected" },
      ];
    },

    // Removed filteredData - status filtering is now done on the server
    // This ensures server-items-length works correctly with VDataTable

    // Ensure totalItems is always a valid number for server-side pagination
    // When status filter is applied, we still show the server total (not filtered count)
    serverItemsLength() {
      // Always use the server total, not the filtered count
      const total = Number(this.totalItems) || 0;
      return total;
    },
    
    // For server-side pagination, use monitoringData directly
    // Status filtering is now done on the server side
    tableItems() {
      return this.monitoringData || [];
    },

    // Page count for VPagination component
    pageCount() {
      const pages = Number(this.lastPage) || 1;
      console.log("pageCount computed:", pages, "from lastPage:", this.lastPage, "totalItems:", this.totalItems);
      return pages;
    },

    truncateText(text, maxLength = 100) {
      if (!text) return "-";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },
  },

  mounted() {
    this.fetchMonitoringComplaints(this.currentPage || 1, this.perPage || 10, this.selectedStatus, "");
  },

  watch: {
    selectedStatus(newStatus) {
      // Reset to first page when status filter changes
      // Status filtering is now done on the server, so we need to refetch
      this.fetchMonitoringComplaints(1, this.perPage || 10, newStatus, this.search);
    },
  },

  beforeUnmount() {
    // Clear timeout on component unmount
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },

  methods: {
    ...mapActions(useMonitoringComplaintsStore, [
      "fetchMonitoringComplaints",
      "fetchComplaintDetails",
      "clearComplaintDetails",
      "searchComplaints",
    ]),
    
    handleRefresh() {
      this.search = "";
      this.fetchMonitoringComplaints(1, this.perPage || 10, this.selectedStatus, "");
    },

    handlePageChange(newPage) {
      console.log("handlePageChange called with:", newPage, "currentPage:", this.currentPage);
      const page = Number(newPage) || 1;
      
      // Prevent unnecessary API calls if clicking the same page
      if (page === (this.currentPage || 1)) {
        console.log("Same page, skipping API call");
        return;
      }
      
      // Use the same endpoint with search parameter
      this.fetchMonitoringComplaints(page, this.perPage || 10, this.selectedStatus, this.search);
    },

    handleItemsPerPageChange(newPerPage) {
      // Use the same endpoint with search parameter
      this.fetchMonitoringComplaints(1, newPerPage, this.selectedStatus, this.search);
    },

    async handleSearch() {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Debounce search API calls (wait 500ms after user stops typing)
      this.searchTimeout = setTimeout(async () => {
        // Use the same endpoint for both search and regular fetch
        // The backend now supports the 'search' parameter
        await this.fetchMonitoringComplaints(
          1, // Reset to first page when searching
          this.perPage || 10,
          this.selectedStatus,
          this.search // Pass search query
        );
      }, 500);
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      try {
        let date;
        if (dateString.includes("T")) {
          date = new Date(dateString);
        } else {
          // MySQL datetime format: "YYYY-MM-DD HH:mm:ss"
          date = new Date(dateString.replace(" ", "T"));
        }
        
        if (isNaN(date.getTime())) {
          return dateString;
        }
        
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch (e) {
        return dateString;
      }
    },

    getStatusColor(status) {
      if (!status) return "default";
      
      // Handle different status formats (string, object, etc.)
      let statusValue = status;
      
      // If status is an object, extract the primitive value
      if (typeof status === "object" && status !== null) {
        // Try common object properties
        if (status.value !== undefined) {
          statusValue = status.value;
        } else if (status.status !== undefined) {
          statusValue = status.status;
        } else if (status.name !== undefined) {
          statusValue = status.name;
        } else if (status.title !== undefined) {
          statusValue = status.title;
        } else {
          // If we can't extract, return default
          return "default";
        }
      }
      
      // Ensure we have a primitive value before converting to string
      if (typeof statusValue !== "string" && typeof statusValue !== "number") {
        return "default";
      }
      
      // Convert to string safely
      const statusStr = String(statusValue).toLowerCase().trim();
      
      const statusColors = {
        new: "info",
        processing: "warning",
        resolved: "success",
        rejected: "error",
      };
      return statusColors[statusStr] || "default";
    },

    getStatusLabel(status) {
      if (!status) return "-";
      
      // Handle different status formats (string, object, etc.)
      let statusValue = status;
      
      // If status is an object, extract the primitive value
      if (typeof status === "object" && status !== null) {
        // Try common object properties
        if (status.value !== undefined) {
          statusValue = status.value;
        } else if (status.status !== undefined) {
          statusValue = status.status;
        } else if (status.name !== undefined) {
          statusValue = status.name;
        } else if (status.title !== undefined) {
          statusValue = status.title;
        } else {
          return "-";
        }
      }
      
      // Ensure we have a primitive value before converting to string
      if (typeof statusValue !== "string" && typeof statusValue !== "number") {
        return "-";
      }
      
      // Convert to string safely
      const statusStr = String(statusValue).toLowerCase().trim();
      
      const statusLabels = {
        new: this.$t("New"),
        processing: this.$t("Processing"),
        resolved: this.$t("Resolved"),
        rejected: this.$t("Rejected"),
      };
      return statusLabels[statusStr] || String(statusValue);
    },

    async viewComplaintDetails(referenceNumber) {
      if (!referenceNumber) {
        this.showSnackbar(
          this.$t("Invalid reference number"),
          "error",
          "mdi-alert-circle"
        );
        return;
      }

      this.detailsDialog = true;
      this.clearComplaintDetails();

      const result = await this.fetchComplaintDetails(referenceNumber);
      
      if (!result && this.detailsError) {
        this.showSnackbar(
          this.detailsError,
          "error",
          "mdi-alert-circle"
        );
      }
    },

    closeDetailsDialog() {
      this.detailsDialog = false;
      this.clearComplaintDetails();
    },

    showSnackbar(message, color = "success", icon = "mdi-check-circle") {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
      setTimeout(() => {
        this.snackbar = false;
      }, 3000);
    },

    async exportDailyReport() {
      this.isExporting = true;
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        // Get today's date in YYYY-MM-DD format (matches Laravel Carbon format)
        const today = new Date();
        const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
        
        // Add date as query parameter (Laravel expects 'date' parameter)
        const url = `http://localhost:8000/api/reports/complaints/daily/pdf?date=${dateStr}`;
        
        console.log("Exporting daily report for date:", dateStr);
        console.log("API URL:", url);
        
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        });
        
        console.log("Response status:", res.status);
        console.log("Response headers:", Object.fromEntries(res.headers.entries()));

        // Handle 401 Unauthorized
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          this.$router.push({ name: "login-page" });
          return;
        }

        // Handle 403 Forbidden
        if (res.status === 403) {
          // Try to parse as JSON, but handle if it's not JSON
          let errorMessage = "Access forbidden.";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, use default message
            console.warn("Error response is not JSON:", e);
          }
          throw new Error(errorMessage);
        }

        // Handle 500 and other server errors
        if (res.status === 500) {
          let errorMessage = "Server error (500). Please check the server logs.";
          try {
            // Try to get error details from response
            const errorText = await res.text();
            console.error("Server error response:", errorText);
            
            // Try to parse as JSON
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorData.exception || errorMessage;
            } catch (e) {
              // If not JSON, use the text response
              if (errorText && errorText.length < 200) {
                errorMessage = errorText;
              }
            }
          } catch (e) {
            console.error("Failed to read error response:", e);
          }
          throw new Error(errorMessage);
        }

        // Handle other errors
        if (!res.ok) {
          // Try to parse as JSON, but handle if it's not JSON
          let errorMessage = `HTTP error! Status: ${res.status}`;
          try {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              // If not JSON, use the text response if it's short enough
              if (errorText && errorText.length < 200) {
                errorMessage = errorText;
              }
            }
          } catch (e) {
            // If response is not JSON, use default message
            console.warn("Error response is not readable:", e);
          }
          throw new Error(errorMessage);
        }

        // Check if response is actually a PDF
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/pdf")) {
          throw new Error("Invalid response format. Expected PDF.");
        }

        // Get the PDF blob
        const blob = await res.blob();
        
        // Try to get filename from Content-Disposition header (Laravel sets this)
        const contentDisposition = res.headers.get("content-disposition");
        let filename = `monitoring_report_${dateStr}.pdf`; // Default filename matching Laravel
        
        if (contentDisposition) {
          // Extract filename from Content-Disposition header
          // Format: attachment; filename="monitoring_report_2025-01-15.pdf"
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "");
          }
        }
        
        // Create a download link
        const url_blob = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url_blob;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url_blob);
        
        this.showSnackbar(
          this.$t("Daily report exported successfully"),
          "success",
          "mdi-check-circle"
        );
      } catch (error) {
        console.error("Failed to export daily report:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to export daily report"),
          "error",
          "mdi-alert-circle"
        );
      } finally {
        this.isExporting = false;
      }
    },
  },
};
</script>

<template>
  <VContainer class="py-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">
        {{ $t("Monitoring Complaints") }}
      </h1>
      <p class="text-body-2 text-medium-emphasis">
        {{ $t("Track complaint status changes and handling history") }}
      </p>
    </div>

    <VCard elevation="2" class="overflow-hidden">
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap pa-4 bg-primary">
        <div class="d-flex align-center">
          <VIcon icon="mdi-monitor-dashboard" class="me-2" color="white" />
          <span class="text-white font-weight-bold">{{ $t("Complaint History") }}</span>
        </div>
        <div class="d-flex align-center ga-2">
          <VChip v-if="hasData" color="white" variant="flat" size="small">
            {{ totalItems }} {{ $t("Total") }}
          </VChip>
          <VBtn
            icon
            variant="text"
            :loading="isExporting"
            @click="exportDailyReport"
            color="white"
          >
            <VIcon>mdi-file-pdf-box</VIcon>
            <VTooltip activator="parent">{{ $t("Export Daily Report") }}</VTooltip>
          </VBtn>
          <VBtn
            icon
            variant="text"
            :loading="isLoading"
            @click="handleRefresh"
            color="white"
          >
            <VIcon>mdi-refresh</VIcon>
            <VTooltip activator="parent">{{ $t("Refresh") }}</VTooltip>
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VRow class="mb-4">
          <VCol cols="12" md="6">
            <VTextField
              v-model="search"
              :label="$t('Search by citizen name or reference number')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              :loading="isLoading"
              @update:model-value="handleSearch"
              @keyup.enter="handleSearch"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="selectedStatus"
              :items="statusOptions"
              :label="$t('Filter by Status')"
              prepend-inner-icon="mdi-filter"
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              @update:model-value="page = 1"
            />
          </VCol>
        </VRow>

        <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          prominent
        >
          <template #prepend>
            <VIcon icon="mdi-alert-circle" />
          </template>
          <div class="text-body-1 font-weight-bold mb-1">{{ $t("Error") }}</div>
          <div class="text-body-2">{{ error }}</div>
        </VAlert>

        <VAlert
          v-if="searchError"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          prominent
          @click:close="searchError = null"
        >
          <template #prepend>
            <VIcon icon="mdi-alert-circle" />
          </template>
          <div class="text-body-1 font-weight-bold mb-1">{{ $t("Search Error") }}</div>
          <div class="text-body-2">{{ searchError }}</div>
        </VAlert>

        <VAlert
          v-if="!isLoading && !error && !hasData"
          type="info"
          variant="tonal"
          class="mb-4"
          prominent
        >
          <template #prepend>
            <VIcon icon="mdi-information" />
          </template>
          <div class="text-body-1 font-weight-bold mb-1">
            {{ $t("No monitoring data available") }}
          </div>
          <div class="text-body-2">
            {{ $t("No complaint history records found") }}
          </div>
        </VAlert>

        <VAlert
          v-if="!isLoading && !error && hasData && tableItems.length === 0"
          type="warning"
          variant="tonal"
          class="mb-4"
          prominent
        >
          <template #prepend>
            <VIcon icon="mdi-filter-remove" />
          </template>
          <div class="text-body-1 font-weight-bold mb-1">
            {{ $t("No matching records") }}
          </div>
          <div class="text-body-2">
            {{ $t("Try adjusting your search or filter criteria") }}
          </div>
        </VAlert>

        <VDataTable
          v-if="hasData || isLoading || isSearching"
          :headers="headers"
          :items="tableItems"
          :loading="isLoading || isSearching"
          :items-per-page="perPage || 10"
          :page="currentPage || 1"
          :items-per-page-options="[10, 25, 50, 100]"
          :server-items-length="serverItemsLength"
          :items-per-page-text="$t('Items per page:')"
          class="elevation-0"
          no-data-text="No monitoring data available"
          hide-default-footer
          @update:items-per-page="handleItemsPerPageChange($event)"
        >
          <template #item.reference_number="{ item }">
            <VChip
              color="primary"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ item.reference_number }}
            </VChip>
          </template>

          <template #item.citizen_name="{ item }">
            <div class="d-flex align-center">
              <VIcon icon="mdi-account" size="18" class="me-2 text-medium-emphasis" />
              <span class="text-body-2">{{ item.citizen_name }}</span>
            </div>
          </template>

          <template #item.status="{ item }">
            <VChip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
              class="font-weight-medium"
            >
              {{ getStatusLabel(item.status) }}
            </VChip>
          </template>

          <template #item.note="{ item }">
            <VTooltip v-if="item.note && item.note.length > 100" location="top">
              <template #activator="{ props }">
                <span v-bind="props" class="text-body-2">
                  {{ truncateText(item.note, 100) }}
                </span>
              </template>
              <span>{{ item.note }}</span>
            </VTooltip>
            <span v-else-if="item.note" class="text-body-2">
              {{ item.note }}
            </span>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <template #item.handled_by_employee="{ item }">
            <div v-if="item.handled_by_employee" class="d-flex align-center">
              <VIcon icon="mdi-account-cog" size="18" class="me-2 text-medium-emphasis" />
              <span class="text-body-2">{{ item.handled_by_employee }}</span>
            </div>
            <span v-else class="text-medium-emphasis">-</span>
          </template>

          <template #item.changed_at="{ item }">
            <div class="d-flex align-center">
              <VIcon icon="mdi-clock-outline" size="18" class="me-2 text-medium-emphasis" />
              <span class="text-body-2">{{ formatDate(item.changed_at) }}</span>
            </div>
          </template>

          <template #item.actions="{ item }">
            <VBtn
              icon
              size="small"
              variant="text"
              color="primary"
              @click="viewComplaintDetails(item.reference_number)"
            >
              <VIcon icon="mdi-eye" size="20" />
              <VTooltip activator="parent">{{ $t("View Details") }}</VTooltip>
            </VBtn>
          </template>

          <template #loading>
            <VSkeletonLoader type="table-row@10" />
          </template>

          <template #bottom>
            <div class="d-flex flex-column align-center pa-4 ga-4">
              <div class="d-flex align-center ga-2">
                <span class="text-body-2 text-medium-emphasis">
                  {{ $t("Items per page:") }}
                </span>
                <VSelect
                  :model-value="perPage || 10"
                  :items="[10, 25, 50, 100]"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-width: 100px;"
                  @update:model-value="handleItemsPerPageChange($event)"
                />
              </div>
              <VPagination
                :model-value="currentPage || 1"
                :length="pageCount"
                :total-visible="7"
                rounded
                @update:model-value="handlePageChange"
              />
              <div class="text-body-2 text-medium-emphasis">
                {{ $t("Showing") }} {{ ((currentPage || 1) - 1) * (perPage || 10) + 1 }}-{{ Math.min((currentPage || 1) * (perPage || 10), totalItems || 0) }} {{ $t("of") }} {{ totalItems || 0 }}
              </div>
            </div>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>

    <VSnackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template #actions>
        <VBtn variant="text" @click="snackbar = false">
          {{ $t("Close") }}
        </VBtn>
      </template>
    </VSnackbar>

    <!-- Complaint Details Dialog -->
    <VDialog v-model="detailsDialog" max-width="900" scrollable>
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between bg-primary text-white">
          <div class="d-flex align-center">
            <VIcon icon="mdi-file-document-outline" class="me-2" />
            {{ $t("Complaint Details") }}
          </div>
          <VBtn icon variant="text" color="white" @click="closeDetailsDialog">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-4">
          <div v-if="isLoadingDetails" class="text-center py-8">
            <VProgressCircular indeterminate color="primary" size="64" />
            <div class="text-body-1 mt-4">{{ $t("Loading complaint details...") }}</div>
          </div>

          <div v-else-if="complaintDetails">
            <VRow>
              <VCol cols="12" md="6">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Reference Number") }}
                  </div>
                  <div class="text-h6 font-weight-bold">
                    {{ complaintDetails.reference_number }}
                  </div>
                </VCard>
              </VCol>

              <VCol cols="12" md="6">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Status") }}
                  </div>
                  <VChip
                    :color="getStatusColor(complaintDetails.status)"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    {{ getStatusLabel(complaintDetails.status) }}
                  </VChip>
                </VCard>
              </VCol>

              <VCol cols="12" v-if="complaintDetails.type">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Type") }}
                  </div>
                  <div class="text-body-1">{{ complaintDetails.type }}</div>
                </VCard>
              </VCol>

              <VCol cols="12" v-if="complaintDetails.location">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Location") }}
                  </div>
                  <div class="text-body-1">{{ complaintDetails.location }}</div>
                </VCard>
              </VCol>

              <VCol cols="12" v-if="complaintDetails.description">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Description") }}
                  </div>
                  <div class="text-body-1">{{ complaintDetails.description }}</div>
                </VCard>
              </VCol>

              <VCol cols="12" md="6" v-if="complaintDetails.created_at">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Created At") }}
                  </div>
                  <div class="text-body-1">{{ formatDate(complaintDetails.created_at) }}</div>
                </VCard>
              </VCol>

              <VCol cols="12" md="6" v-if="complaintDetails.updated_at">
                <VCard variant="outlined" class="pa-3 mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ $t("Updated At") }}
                  </div>
                  <div class="text-body-1">{{ formatDate(complaintDetails.updated_at) }}</div>
                </VCard>
              </VCol>
            </VRow>
          </div>

          <VAlert
            v-else
            type="warning"
            variant="tonal"
            prominent
          >
            <template #prepend>
              <VIcon icon="mdi-alert" />
            </template>
            <div class="text-body-1">
              {{ $t("No complaint details available") }}
            </div>
          </VAlert>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="text" @click="closeDetailsDialog">
            {{ $t("Close") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
:deep(.v-data-table) {
  background-color: transparent;
}

:deep(.v-data-table-header) {
  background-color: rgba(var(--v-theme-surface), 0.5);
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
