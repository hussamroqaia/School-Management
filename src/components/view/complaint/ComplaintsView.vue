<script>
import { useComplaintsStore } from "@/stores/complaints";
import { useAuthStore } from "@/stores/auth";
import { mapState, mapActions } from "pinia";

export default {
  name: "ComplaintsView",

  data() {
    return {
      search: "",
      selectedStatus: "ALL",
      dialogHistory: false,
      dialogUpdate: false,
      dialogEditNote: false,
      dialogAddNote: false,
      dialogChangeStatus: false,
      dialogComplaintDetails: false,
      complaintDetails: null,
      isLoadingComplaintDetails: false,
      complaintDetailsError: null,
      addNoteTarget: null,
      changeStatusTarget: null,
      addNoteForm: {
        note: "",
      },
      changeStatusForm: {
        status: "",
        note: "",
      },
      updateTarget: null,
      updateForm: {
        status: "",
        note: "",
      },
      editingHistory: null,
      selectedComplaint: null,
      expandedRows: [],
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      itemsPerPage: 10,
      page: 1,
      complaintsStore: useComplaintsStore(),
      authStore: useAuthStore(),
    };
  },

  computed: {
    ...mapState(useComplaintsStore, ["complaints", "isLoading", "error"]),
    ...mapState(useAuthStore, ["user"]),

    isAdmin() {
      return this.authStore.isAdmin;
    },

    isEmployee() {
      return this.user?.role === "employee";
    },

    headers() {
      return [
        {
          title: this.$t("Reference Number"),
          key: "reference_number",
          sortable: true,
        },
        { title: this.$t("Status"), key: "status", sortable: true },
        { title: this.$t("Description"), key: "description", sortable: false },
        { title: this.$t("Location"), key: "location", sortable: false },
        {
          title: this.$t("Actions"),
          key: "actions",
          sortable: false,
          align: "end",
          width: 180,
        },
      ];
    },

    statusOptions() {
      if (!this.complaints || this.complaints.length === 0) {
        return ["ALL"];
      }
      const statuses = new Set(
        this.complaints.map((c) => {
          // Handle both structures: { complain: {...} } and direct complaint object
          const complain = c.complain || c;
          return complain.status;
        }).filter(Boolean)
      );
      return ["ALL", ...Array.from(statuses)];
    },

    filteredComplaints() {
      if (!this.complaints || this.complaints.length === 0) {
        return [];
      }
      const q = this.search.trim().toLowerCase();
      const selected = this.selectedStatus;

      return this.complaints
        .map((c) => {
          // Normalize structure: always return { complain: {...} } format
          if (c.complain) {
            return c;
          }
          return { complain: c };
        })
        .filter((c) => {
          const complain = c.complain;
          const inSearch =
            q === "" ||
            (complain.reference_number && complain.reference_number.toLowerCase().includes(q)) ||
            (complain.description && complain.description.toLowerCase().includes(q)) ||
            (complain.location && complain.location.toLowerCase().includes(q));
          const inStatus =
            selected === "ALL" ? true : complain.status === selected;

          return inSearch && inStatus;
        });
    },
  },

  mounted() {
    this.loadComplaints();
  },

  methods: {
    ...mapActions(useComplaintsStore, ["fetchComplaints", "fetchComplaintsByEntity"]),

    async loadComplaints() {
      if (this.isEmployee && this.user?.id) {
        // For employees, fetch complaints by entity
        await this.fetchComplaintsByEntity(this.user.id);
      } else {
        // For admins, fetch all complaints
        await this.fetchComplaints();
      }
    },

    getComplaintData(item) {
      // Handle both structures: { complain: {...} } and direct complaint object
      return item.complain || item;
    },

    getStatusColor(status) {
      const colors = {
        new: "info",
        processing: "warning",
        resolved: "success",
        rejected: "error",
      };
      return colors[status] || "default";
    },

    getStatusIcon(status) {
      const icons = {
        new: "mdi-new-box",
        processing: "mdi-clock-outline",
        resolved: "mdi-check-circle",
        rejected: "mdi-close-circle",
      };
      return icons[status] || "mdi-help-circle";
    },

    truncateText(text, maxLength = 100) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      try {
        let date;
        // Handle MySQL datetime format: "YYYY-MM-DD HH:mm:ss"
        if (dateString.includes(" ") && !dateString.includes("T")) {
          date = new Date(dateString.replace(" ", "T"));
        } else {
          date = new Date(dateString);
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

    showSnackbar(message, color = "success") {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    viewHistory(complaint) {
      this.selectedComplaint = complaint;
      this.dialogHistory = true;
    },

    closeHistoryDialog() {
      this.dialogHistory = false;
      this.selectedComplaint = null;
    },

    async viewDetails(referenceNumber) {
      if (!referenceNumber) {
        console.error("No reference number provided");
        return;
      }

      this.dialogComplaintDetails = true;
      this.complaintDetails = null;
      this.complaintDetailsError = null;
      this.isLoadingComplaintDetails = true;

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
          this.$router.push({ name: "login-page" });
          return;
        }

        // Handle 403 Forbidden
        if (res.status === 403) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || "Access forbidden. You don't have permission to view this complaint.";
          this.complaintDetailsError = errorMessage;
          throw new Error(errorMessage);
        }

        // Handle other errors
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `HTTP error! Status: ${res.status}`;
          this.complaintDetailsError = errorMessage;
          throw new Error(errorMessage);
        }

        const response = await res.json();
        
        // Handle different response structures
        let complaintData = null;
        if (response.complain) {
          // API returns { status: true, complain: {...} }
          complaintData = response.complain;
        } else if (response.complaint) {
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
      } catch (error) {
        console.error("Failed to fetch complaint details:", error);
        this.complaintDetailsError = error.message || "Failed to fetch complaint details";
        this.complaintDetails = null;
      } finally {
        this.isLoadingComplaintDetails = false;
      }
    },

    closeComplaintDetailsDialog() {
      this.dialogComplaintDetails = false;
      this.complaintDetails = null;
      this.complaintDetailsError = null;
    },

    openUpdateDialog(item) {
      const complain = this.getComplaintData(item);
      this.updateTarget = complain;
      this.updateForm.status = complain.status || "new";
      this.updateForm.note = "";
      this.dialogUpdate = true;
    },

    saveUpdate() {
      if (!this.updateTarget) return;
      const newHistory = {
        status: this.updateForm.status,
        note: this.updateForm.note || `${this.updateForm.status} status set`,
        changed_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        handled_by: {
          id: 0,
          employee: "System",
        },
      };

      if (!Array.isArray(this.updateTarget.histories))
        this.updateTarget.histories = [];
      this.updateTarget.histories.unshift(newHistory);
      this.updateTarget.status = this.updateForm.status;

      this.dialogUpdate = false;
      this.updateTarget = null;
      this.updateForm.status = "";
      this.updateForm.note = "";
      this.showSnackbar(this.$t("Status updated successfully"), "success");
    },

    openEditNote(history, complain) {
      this.editingHistory = { history, complain };
      this.editingHistory.noteCopy = history.note || "";
      this.dialogEditNote = true;
    },

    saveEditNote() {
      if (!this.editingHistory) return;
      this.editingHistory.history.note = this.editingHistory.noteCopy;
      this.dialogEditNote = false;
      this.editingHistory = null;
      this.showSnackbar(this.$t("Note updated successfully"), "success");
    },

    openAddNoteDialog(item) {
      const complain = this.getComplaintData(item);
      this.addNoteTarget = complain;
      this.addNoteForm.note = "";
      this.dialogAddNote = true;
    },

    closeAddNoteDialog() {
      this.dialogAddNote = false;
      this.addNoteTarget = null;
      this.addNoteForm.note = "";
    },

    async submitAddNote() {
      if (!this.addNoteTarget || !this.addNoteForm.note.trim()) {
        this.showSnackbar(this.$t("Please enter a note"), "error");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/EmployeeAddNote`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            reference_number: this.addNoteTarget.reference_number,
            note: this.addNoteForm.note.trim(),
          }),
        });

        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          this.$router.push({ name: "login-page" });
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        this.showSnackbar(response.message || this.$t("Note added successfully"), "success");
        this.closeAddNoteDialog();
        
        // Refresh complaints list
        await this.loadComplaints();
      } catch (error) {
        console.error("Failed to add note:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to add note"),
          "error"
        );
      }
    },

    openChangeStatusDialog(item) {
      const complain = this.getComplaintData(item);
      this.changeStatusTarget = complain;
      this.changeStatusForm.status = complain.status || "new";
      this.dialogChangeStatus = true;
    },

    closeChangeStatusDialog() {
      this.dialogChangeStatus = false;
      this.changeStatusTarget = null;
      this.changeStatusForm.status = "";
    },

    async submitChangeStatus() {
      if (!this.changeStatusTarget || !this.changeStatusForm.status) {
        this.showSnackbar(this.$t("Please select a status"), "error");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/changeStatus`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            reference_number: this.changeStatusTarget.reference_number,
            status: this.changeStatusForm.status,
          }),
        });

        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          this.$router.push({ name: "login-page" });
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        this.showSnackbar(
          response.message || this.$t("Status changed successfully"),
          "success"
        );
        this.closeChangeStatusDialog();
        
        // Refresh complaints list
        await this.loadComplaints();
      } catch (error) {
        console.error("Failed to change status:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to change status"),
          "error"
        );
      }
    },
  },
};
</script>

<template>
  <VSnackbar
    v-model="snackbar"
    timeout="3000"
    location="top end"
    :color="snackbarColor"
    variant="flat"
    elevation="2"
  >
    <VIcon icon="mdi-check-circle" start class="me-2" />
    {{ snackbarText }}
  </VSnackbar>

  <v-container class="py-4">
    <v-row class="align-end justify-space-between mb-4">
      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          :label="$t('Search complaints')"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          :label="$t('Filter by Status')"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
      </v-col>
    </v-row>

    <v-card elevation="2" class="overflow-hidden">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <VIcon icon="mdi-alert-circle-outline" class="me-2" color="white" />
        <span class="text-white">{{ $t("Complaints") }}</span>
        <VSpacer />
        <VChip color="white" variant="flat" size="small">
          {{ filteredComplaints.length }} {{ $t("Total") }}
        </VChip>
      </v-card-title>
      <VDivider />
      <div v-if="error" class="pa-4">
        <VAlert type="error" variant="tonal">
          {{ error }}
        </VAlert>
      </div>
      <v-data-table
        :items="filteredComplaints"
        :headers="headers"
        :loading="isLoading"
        item-value="complain.reference_number"
        :items-per-page="itemsPerPage"
        :page="page"
        class="elevation-0"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
      >
        <template #item.reference_number="{ item }">
          <div
            class="font-weight-bold text-primary d-flex align-center cursor-pointer"
            @click="viewDetails(getComplaintData(item).reference_number)"
            style="cursor: pointer"
          >
            <VIcon icon="mdi-tag-outline" size="18" class="me-1" />
            {{ getComplaintData(item).reference_number }}
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip
            size="small"
            :color="getStatusColor(getComplaintData(item).status)"
            variant="tonal"
            class="font-weight-medium"
          >
            <VIcon
              :icon="getStatusIcon(getComplaintData(item).status)"
              start
              size="16"
            />
            {{ $t(getComplaintData(item).status) }}
          </VChip>
        </template>

        <template #item.description="{ item }">
          <div class="text-body-2">
            {{ truncateText(getComplaintData(item).description, 80) }}
          </div>
        </template>

        <template #item.location="{ item }">
          <div class="text-body-2 d-flex align-center">
            <VIcon icon="mdi-map-marker-outline" size="16" class="me-1" />
            {{ (getComplaintData(item).location || "").replace(/\n/g, ", ") }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2 flex-wrap">
            <v-tooltip text="View Details" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="primary"
                  icon="mdi-eye"
                  @click.stop="viewDetails(getComplaintData(item).reference_number)"
                />
              </template>
            </v-tooltip>
            <v-tooltip v-if="!isAdmin && isEmployee" :text="$t('Add Note')" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="success"
                  icon="mdi-note-plus"
                  @click="openAddNoteDialog(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip v-if="!isAdmin && isEmployee" :text="$t('Change Status')" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="warning"
                  icon="mdi-square-edit-outline"
                  @click="openChangeStatusDialog(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #no-data>
          <div class="py-12 text-center">
            <VIcon
              icon="mdi-information-outline"
              size="64"
              class="mb-4 text-medium-emphasis"
            />
            <div class="text-h6 text-medium-emphasis mb-2">
              {{ $t("No complaints found") }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ $t("Try adjusting your search or filter criteria") }}
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- History Dialog -->
    <VDialog v-model="dialogHistory" max-width="800" scrollable>
      <VCard v-if="selectedComplaint">
        <VCardTitle
          class="d-flex align-center justify-space-between bg-primary"
        >
          <div class="text-white">
            <div class="text-h6">
              {{ $t("Complaint History") }} -
              {{ selectedComplaint.reference_number }}
            </div>
            <div class="text-caption text-white mt-1 opacity-90">
              {{ truncateText(selectedComplaint.description, 60) }}
            </div>
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeHistoryDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div class="mb-4">
            <div class="text-subtitle-2 mb-1 d-flex align-center">
              <VIcon icon="mdi-map-marker-outline" size="18" class="me-1" />
              {{ $t("Location") }}:
            </div>
            <div class="text-body-2">{{ selectedComplaint.location }}</div>
          </div>

          <VDivider class="my-4" />

          <div class="text-subtitle-2 mb-3 d-flex align-center">
            <VIcon icon="mdi-history" size="18" class="me-1" />
            {{ $t("Status History") }}:
          </div>
          <VTimeline side="end" density="compact">
            <VTimelineItem
              v-for="(history, index) in selectedComplaint.histories"
              :key="index"
              :dot-color="getStatusColor(history.status)"
              size="small"
            >
              <template #icon>
                <VIcon :icon="getStatusIcon(history.status)" size="20" />
              </template>
              <VCard elevation="1" class="mb-2">
                <VCardText>
                  <div class="d-flex justify-space-between align-start mb-2">
                    <VChip
                      size="small"
                      :color="getStatusColor(history.status)"
                      variant="tonal"
                    >
                      {{ $t(history.status) }}
                    </VChip>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(history.changed_at) }}
                    </div>
                  </div>
                  <div class="text-body-2 mb-2">{{ history.note }}</div>
                  <div
                    class="text-caption text-medium-emphasis d-flex align-center"
                  >
                    <VIcon icon="mdi-account" size="14" class="me-1" />
                    {{ $t("Handled by") }}: {{ history.handled_by.employee }}
                  </div>
                  <div class="mt-2 d-flex justify-end">
                    <VBtn
                      size="small"
                      variant="text"
                      icon="mdi-pencil"
                      @click="openEditNote(history, selectedComplaint)"
                      :title="$t('Edit Note')"
                    />
                  </div>
                </VCardText>
              </VCard>
            </VTimelineItem>
          </VTimeline>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="tonal" @click="closeHistoryDialog">
            {{ $t("Close") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Update Status / Add Note Dialog -->
    <VDialog v-model="dialogUpdate" max-width="520">
      <VCard>
        <VCardTitle class="bg-primary text-white">
          {{ $t("Change Status / Add Note") }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <v-select
            v-model="updateForm.status"
            :items="[
              { title: $t('new'), value: 'new' },
              { title: $t('processing'), value: 'processing' },
              { title: $t('resolved'), value: 'resolved' },
              { title: $t('rejected'), value: 'rejected' },
            ]"
            :label="$t('Status')"
            variant="outlined"
            density="comfortable"
          />

          <v-textarea
            v-model="updateForm.note"
            :label="$t('Note (optional)')"
            rows="4"
            auto-grow
            class="mt-4"
            variant="outlined"
          />
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="text" @click="dialogUpdate = false">{{
            $t("Cancel")
          }}</VBtn>
          <VBtn color="primary" variant="flat" @click="saveUpdate">{{
            $t("Save")
          }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add Note Dialog -->
    <VDialog v-model="dialogAddNote" max-width="520">
      <VCard>
        <VCardTitle class="bg-success text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="mdi-note-plus" class="me-2" />
            {{ $t("Add Note") }}
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeAddNoteDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div v-if="addNoteTarget" class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">
              {{ $t("Complaint Reference") }}
            </div>
            <div class="text-body-1 font-weight-medium">
              {{ addNoteTarget.reference_number }}
            </div>
          </div>
          <v-textarea
            v-model="addNoteForm.note"
            :label="$t('Note')"
            :placeholder="$t('Enter your note here...')"
            rows="6"
            auto-grow
            variant="outlined"
            :rules="[(v) => !!v || $t('This field is required')]"
            required
          />
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="text" @click="closeAddNoteDialog">
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn color="success" variant="flat" @click="submitAddNote">
            <VIcon icon="mdi-note-plus" start size="20" />
            {{ $t("Add Note") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Change Status Dialog -->
    <VDialog v-model="dialogChangeStatus" max-width="520">
      <VCard>
        <VCardTitle class="bg-warning text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="mdi-square-edit-outline" class="me-2" />
            {{ $t("Change Status") }}
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeChangeStatusDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div v-if="changeStatusTarget" class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">
              {{ $t("Complaint Reference") }}
            </div>
            <div class="text-body-1 font-weight-medium">
              {{ changeStatusTarget.reference_number }}
            </div>
          </div>
          <v-select
            v-model="changeStatusForm.status"
            :items="[
              { title: $t('new'), value: 'new' },
              { title: $t('processing'), value: 'processing' },
              { title: $t('resolved'), value: 'resolved' },
              { title: $t('rejected'), value: 'rejected' },
            ]"
            :label="$t('Status')"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || $t('This field is required')]"
            required
          />
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="text" @click="closeChangeStatusDialog">
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn color="warning" variant="flat" @click="submitChangeStatus">
            <VIcon icon="mdi-content-save" start size="20" />
            {{ $t("Change Status") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Complaint Details Dialog -->
    <VDialog v-model="dialogComplaintDetails" max-width="800" scrollable>
      <VCard>
        <VCardTitle class="bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="mdi-file-document-outline" class="me-2" />
            {{ $t("Complaint Details") }}
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeComplaintDetailsDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div v-if="isLoadingComplaintDetails" class="text-center py-8">
            <VProgressCircular indeterminate color="primary" class="mb-4" />
            <div class="text-body-2 text-medium-emphasis">
              {{ $t("Loading complaint details...") }}
            </div>
          </div>
          <div v-else-if="complaintDetailsError" class="text-center py-8">
            <VIcon icon="mdi-alert-circle-outline" size="64" class="mb-4 text-error" />
            <div class="text-body-1 text-error mb-2">
              {{ complaintDetailsError }}
            </div>
            <VBtn variant="tonal" @click="closeComplaintDetailsDialog">
              {{ $t("Close") }}
            </VBtn>
          </div>
          <div v-else-if="complaintDetails" class="complaint-details">
            <!-- Reference Number Header -->
            <VCard variant="tonal" color="primary" class="mb-6">
              <VCardText class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-medium-emphasis mb-1">
                      {{ $t("Reference Number") }}
                    </div>
                    <div class="text-h6 font-weight-bold">
                      {{ complaintDetails.reference_number }}
                    </div>
                  </div>
                  <VChip
                    :color="getStatusColor(complaintDetails.status)"
                    variant="flat"
                    size="large"
                  >
                    <VIcon :icon="getStatusIcon(complaintDetails.status)" start size="20" />
                    {{ $t(complaintDetails.status) }}
                  </VChip>
                </div>
              </VCardText>
            </VCard>

            <!-- Complaint Information -->
            <VRow>
              <VCol cols="12" md="6">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-tag-outline" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Reference Number") }}
                        </div>
                        <div class="text-body-1 font-weight-medium">
                          {{ complaintDetails.reference_number }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12" md="6">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-information-outline" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Status") }}
                        </div>
                        <VChip
                          :color="getStatusColor(complaintDetails.status)"
                          variant="flat"
                          size="small"
                        >
                          <VIcon :icon="getStatusIcon(complaintDetails.status)" start size="16" />
                          {{ $t(complaintDetails.status) }}
                        </VChip>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-start">
                      <VIcon icon="mdi-map-marker-outline" size="20" class="me-3 text-primary mt-1" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Location") }}
                        </div>
                        <div class="text-body-1">
                          {{ complaintDetails.location || $t("N/A") }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-start">
                      <VIcon icon="mdi-text" size="20" class="me-3 text-primary mt-1" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Description") }}
                        </div>
                        <div class="text-body-1">
                          {{ complaintDetails.description || $t("No description provided") }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12" md="6">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-calendar-plus" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Created At") }}
                        </div>
                        <div class="text-body-2">
                          {{ formatDate(complaintDetails.created_at) }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12" md="6">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-calendar-edit" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Last Updated") }}
                        </div>
                        <div class="text-body-2">
                          {{ formatDate(complaintDetails.updated_at) }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>

            <!-- Complaint History Section -->
            <div v-if="complaintDetails.histories && complaintDetails.histories.length > 0" class="mt-6">
              <div class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
                <VIcon icon="mdi-history" size="20" class="me-2" />
                {{ $t("Complaint History") }}
              </div>
              <VTimeline density="compact" side="end">
                <VTimelineItem
                  v-for="(history, index) in complaintDetails.histories"
                  :key="index"
                  :dot-color="getStatusColor(history.status)"
                  size="small"
                >
                  <VCard variant="outlined" class="mb-2">
                    <VCardText class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <VChip
                          :color="getStatusColor(history.status)"
                          variant="flat"
                          size="small"
                        >
                          <VIcon :icon="getStatusIcon(history.status)" start size="16" />
                          {{ $t(history.status) }}
                        </VChip>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDate(history.changed_at) }}
                        </div>
                      </div>
                      <div v-if="history.note" class="text-body-2 mb-2">
                        <strong>{{ $t("Note") }}:</strong> {{ history.note }}
                      </div>
                      <div v-if="history.handled_by" class="text-caption text-medium-emphasis d-flex align-center">
                        <VIcon icon="mdi-account-cog" size="16" class="me-1" />
                        {{ $t("Handled by") }}: {{ history.handled_by.employee || history.handled_by.name || $t("N/A") }}
                      </div>
                    </VCardText>
                  </VCard>
                </VTimelineItem>
              </VTimeline>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <VIcon icon="mdi-alert-circle-outline" size="64" class="mb-4 text-medium-emphasis" />
            <div class="text-body-1 text-medium-emphasis">
              {{ $t("No complaint details available") }}
            </div>
          </div>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="tonal" @click="closeComplaintDetailsDialog">
            {{ $t("Close") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Edit Note Dialog -->
    <VDialog v-model="dialogEditNote" max-width="520">
      <VCard v-if="editingHistory">
        <VCardTitle class="bg-primary text-white">
          {{ $t("Edit Note") }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <v-textarea
            v-model="editingHistory.noteCopy"
            :label="$t('Note')"
            rows="6"
            auto-grow
            variant="outlined"
          />
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="text" @click="dialogEditNote = false">{{
            $t("Cancel")
          }}</VBtn>
          <VBtn color="primary" variant="flat" @click="saveEditNote">{{
            $t("Save")
          }}</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </v-container>
</template>
