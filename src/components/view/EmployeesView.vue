<template>
  <v-container class="py-4">
    <VSnackbar
      v-model="snackbar"
      timeout="3000"
      location="top end"
      :color="snackbarColor"
      variant="flat"
      elevation="2"
    >
      <VIcon :icon="snackbarIcon" start class="me-2" />
      {{ snackbarText }}
    </VSnackbar>

    <v-row class="align-end justify-space-between mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedGovernmentEntity"
          :items="governments"
          :label="$t('Select Government Entity')"
          prepend-inner-icon="mdi-office-building"
          variant="outlined"
          density="comfortable"
          :loading="isLoadingGovernments"
          item-title="name"
          item-value="entity_id"
          return-object
          clearable
          @update:model-value="onGovernmentChange"
        >
          <template #no-data>
            <div class="pa-4 text-center">
              <div v-if="isLoadingGovernments" class="text-body-2">
                {{ $t("Loading...") }}
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">
                {{ $t("No government entities found") }}
              </div>
            </div>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <v-card elevation="2" class="overflow-hidden">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <VIcon icon="mdi-account-group" class="me-2" color="white" />
        <span class="text-white">{{ $t("Employees") }}</span>
        <VSpacer />
        <VChip v-if="selectedGovernmentEntity" color="white" variant="flat" size="small">
          {{ employees.length }} {{ $t("Total") }}
        </VChip>
      </v-card-title>
      <VDivider />
      <div v-if="error" class="pa-4">
        <VAlert type="error" variant="tonal">
          {{ error }}
        </VAlert>
      </div>
      <v-data-table
        :items="employees"
        :headers="headers"
        :loading="isLoading"
        class="elevation-0"
        :items-per-page="itemsPerPage"
        :page="page"
        :items-per-page-options="[10, 25, 50, 100]"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
      >
        <template #item.id="{ item }">
          <div class="font-weight-medium">
            {{ item.id }}
          </div>
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <VIcon icon="mdi-account" size="18" class="me-2 text-medium-emphasis" />
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template #item.email="{ item }">
          <div class="d-flex align-center">
            <VIcon icon="mdi-email" size="18" class="me-2 text-medium-emphasis" />
            <span>{{ item.email }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-tooltip :text="$t('View Details')" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="primary"
                  icon="mdi-eye"
                  @click="openDetailsDialog(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('Edit Employee')" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="info"
                  icon="mdi-pencil"
                  @click="openEditDialog(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('Delete Employee')" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  color="error"
                  icon="mdi-delete"
                  @click="openDeleteDialog(item)"
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
              <span v-if="!selectedGovernmentEntity">
                {{ $t("Please select a government entity to view employees") }}
              </span>
              <span v-else>
                {{ $t("No employees found") }}
              </span>
            </div>
            <div v-if="selectedGovernmentEntity" class="text-body-2 text-medium-emphasis">
              {{ $t("No employees are assigned to this government entity") }}
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Employee Details Dialog -->
    <VDialog v-model="detailsDialog" max-width="600" scrollable>
      <VCard>
        <VCardTitle class="bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="mdi-account-details" class="me-2" />
            {{ $t("Employee Details") }}
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeDetailsDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div v-if="isLoadingDetails" class="text-center py-8">
            <VProgressCircular indeterminate color="primary" class="mb-4" />
            <div class="text-body-2 text-medium-emphasis">
              {{ $t("Loading employee details...") }}
            </div>
          </div>
          <div v-else-if="employeeDetails" class="employee-details">
            <!-- Employee Header Card -->
            <VCard variant="tonal" color="primary" class="mb-6">
              <VCardText class="pa-4">
                <div class="d-flex align-center">
                  <VAvatar size="64" color="primary" class="me-4">
                    <VIcon icon="mdi-account" size="32" />
                  </VAvatar>
                  <div>
                    <div class="text-h6 font-weight-bold mb-1">
                      {{ employeeDetails.name }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis d-flex align-center">
                      <VIcon icon="mdi-email" size="16" class="me-1" />
                      {{ employeeDetails.email }}
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>

            <!-- Details Section -->
            <div class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <VIcon icon="mdi-information-outline" size="20" class="me-2" />
              {{ $t("Employee Information") }}
            </div>

            <VRow>
              <VCol cols="12">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-account" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Full Name") }}
                        </div>
                        <div class="text-body-1 font-weight-medium">
                          {{ employeeDetails.name }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-email" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Email Address") }}
                        </div>
                        <div class="text-body-1 font-weight-medium">
                          {{ employeeDetails.email }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>

              <VCol cols="12">
                <VCard variant="outlined" class="mb-3">
                  <VCardText class="pa-3">
                    <div class="d-flex align-center">
                      <VIcon icon="mdi-office-building" size="20" class="me-3 text-primary" />
                      <div class="flex-grow-1">
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ $t("Government Entity") }}
                        </div>
                        <div class="text-body-1 font-weight-medium">
                          {{ getGovernmentName(employeeDetails.government_entity_id) || $t("Not assigned") }}
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
                          {{ formatDate(employeeDetails.created_at) }}
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
                          {{ formatDate(employeeDetails.updated_at) }}
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </div>
          <div v-else class="text-center py-8">
            <VIcon icon="mdi-alert-circle-outline" size="64" class="mb-4 text-medium-emphasis" />
            <div class="text-body-1 text-medium-emphasis">
              {{ $t("Failed to load employee details") }}
            </div>
          </div>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn variant="tonal" @click="closeDetailsDialog">
            {{ $t("Close") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Edit Employee Dialog -->
    <VDialog v-model="editDialog" max-width="600" scrollable>
      <VCard>
        <VCardTitle class="bg-info text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon icon="mdi-pencil" class="me-2" />
            {{ $t("Edit Employee") }}
          </div>
          <VBtn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closeEditDialog"
            :disabled="isUpdating"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <v-form ref="editFormRef" @submit.prevent="submitUpdate">
            <v-text-field
              v-model="editForm.name"
              :label="$t('Name')"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              disabled
              readonly
            />

            <v-text-field
              v-model="editForm.email"
              :label="$t('Email')"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              disabled
              readonly
            />

            <v-select
              v-model="editForm.government_entity_id"
              :items="governments"
              :label="$t('Government Entity')"
              prepend-inner-icon="mdi-office-building"
              variant="outlined"
              density="comfortable"
              :loading="isLoadingGovernments"
              :rules="[rules.required]"
              item-title="name"
              item-value="entity_id"
              return-object
              required
            >
              <template #no-data>
                <div class="pa-4 text-center">
                  <div v-if="isLoadingGovernments" class="text-body-2">
                    {{ $t("Loading...") }}
                  </div>
                  <div v-else class="text-body-2 text-medium-emphasis">
                    {{ $t("No government entities found") }}
                  </div>
                </div>
              </template>
            </v-select>
          </v-form>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeEditDialog"
            :disabled="isUpdating"
          >
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn
            color="info"
            variant="flat"
            @click="submitUpdate"
            :loading="isUpdating"
            :disabled="isUpdating"
          >
            <VIcon icon="mdi-content-save" start size="20" />
            {{ $t("Update Employee") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog v-model="deleteDialog" max-width="500">
      <VCard>
        <VCardTitle class="bg-error text-white d-flex align-center">
          <VIcon icon="mdi-alert-circle" class="me-2" />
          {{ $t("Delete Employee") }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <div class="text-body-1 mb-2">
            {{ $t("Are you sure you want to delete this employee?") }}
          </div>
          <div v-if="employeeToDelete" class="text-body-2 text-medium-emphasis">
            <div><strong>{{ $t("Name") }}:</strong> {{ employeeToDelete.name }}</div>
            <div><strong>{{ $t("Email") }}:</strong> {{ employeeToDelete.email }}</div>
          </div>
          <VAlert type="warning" variant="tonal" class="mt-4">
            {{ $t("This action cannot be undone.") }}
          </VAlert>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-3">
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeDeleteDialog"
            :disabled="isDeleting"
          >
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn
            color="error"
            variant="flat"
            @click="confirmDelete"
            :loading="isDeleting"
            :disabled="isDeleting"
          >
            <VIcon icon="mdi-delete" start size="20" />
            {{ $t("Delete") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </v-container>
</template>

<script>
import { useEmployeesStore } from "@/stores/employees";
import { mapState, mapActions } from "pinia";

export default {
  name: "EmployeesView",
  data() {
    return {
      selectedGovernmentEntity: null,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      snackbarIcon: "mdi-check-circle",
      itemsPerPage: 10,
      page: 1,
      employeesStore: useEmployeesStore(),
      deleteDialog: false,
      employeeToDelete: null,
      isDeleting: false,
      detailsDialog: false,
      employeeDetails: null,
      isLoadingDetails: false,
      editDialog: false,
      employeeToEdit: null,
      editForm: {
        name: "",
        email: "",
        government_entity_id: null,
      },
      isUpdating: false,
      editFormRef: null,
    };
  },

  computed: {
    ...mapState(useEmployeesStore, [
      "employees",
      "governments",
      "isLoading",
      "isLoadingGovernments",
      "error",
    ]),

    headers() {
      return [
        {
          title: this.$t("ID"),
          key: "id",
          sortable: true,
          width: 80,
        },
        {
          title: this.$t("Name"),
          key: "name",
          sortable: true,
        },
        {
          title: this.$t("Email"),
          key: "email",
          sortable: true,
        },
        {
          title: this.$t("Actions"),
          key: "actions",
          sortable: false,
          align: "end",
          width: 180,
        },
      ];
    },

    rules() {
      return {
        required: (value) => !!value || this.$t("This field is required"),
        email: (value) => {
          const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return pattern.test(value) || this.$t("Invalid email address");
        },
      };
    },
  },

  mounted() {
    this.fetchGovernments();
  },

  methods: {
    ...mapActions(useEmployeesStore, [
      "fetchEmployees",
      "fetchGovernments",
      "deleteEmployee",
      "updateEmployee",
    ]),

    onGovernmentChange() {
      if (this.selectedGovernmentEntity) {
        const entityId =
          typeof this.selectedGovernmentEntity === "object"
            ? this.selectedGovernmentEntity.entity_id
            : this.selectedGovernmentEntity;
        this.fetchEmployees(entityId);
      } else {
        this.employeesStore.employees = [];
      }
    },

    async openDetailsDialog(employee) {
      this.detailsDialog = true;
      this.employeeDetails = null;
      this.isLoadingDetails = true;

      try {
        const token = localStorage.getItem("token");
        const url = `http://localhost:8000/api/showEmployee/${employee.id}`;
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
          this.$router.push({ name: "login-page" });
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const response = await res.json();
        
        if (response.status && response.employee) {
          this.employeeDetails = response.employee;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Failed to fetch employee details:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to load employee details"),
          "error",
          "mdi-alert-circle"
        );
        this.employeeDetails = null;
      } finally {
        this.isLoadingDetails = false;
      }
    },

    closeDetailsDialog() {
      this.detailsDialog = false;
      this.employeeDetails = null;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString();
    },

    getGovernmentName(governmentEntityId) {
      if (!governmentEntityId || !this.governments || this.governments.length === 0) {
        return null;
      }
      const government = this.governments.find(
        (gov) => gov.entity_id === governmentEntityId
      );
      return government ? government.name : null;
    },

    openEditDialog(employee) {
      this.employeeToEdit = employee;
      this.editForm = {
        name: employee.name || "",
        email: employee.email || "",
        government_entity_id: null,
      };

      // Find and set the government entity object
      if (employee.government_entity_id && this.governments.length > 0) {
        const gov = this.governments.find(
          (g) => g.entity_id === employee.government_entity_id
        );
        if (gov) {
          this.editForm.government_entity_id = gov;
        }
      }

      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
      this.employeeToEdit = null;
      this.editForm = {
        name: "",
        email: "",
        government_entity_id: null,
      };
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.resetValidation();
      }
    },

    async submitUpdate() {
      // Validate form
      if (this.$refs.editFormRef) {
        const { valid } = await this.$refs.editFormRef.validate();
        if (!valid) {
          return;
        }
      }

      if (!this.employeeToEdit) return;

      this.isUpdating = true;
      const employeeId = this.employeeToEdit.id;

      try {
        // Extract entity_id if government_entity_id is an object
        const governmentEntityId =
          typeof this.editForm.government_entity_id === "object"
            ? this.editForm.government_entity_id.entity_id
            : this.editForm.government_entity_id;

        // Only send government_entity_id for update (name and email are read-only)
        const payload = {
          government_entity_id: governmentEntityId,
        };

        const result = await this.updateEmployee(employeeId, payload);

        if (result.success) {
          this.showSnackbar(
            this.$t("Employee updated successfully"),
            "success",
            "mdi-check-circle"
          );

          // Refresh the employees list
          if (this.selectedGovernmentEntity) {
            const entityId =
              typeof this.selectedGovernmentEntity === "object"
                ? this.selectedGovernmentEntity.entity_id
                : this.selectedGovernmentEntity;
            await this.fetchEmployees(entityId);
          }

          // If details dialog is open, refresh it
          if (this.detailsDialog && this.employeeDetails?.id === employeeId) {
            await this.openDetailsDialog(this.employeeToEdit);
          }

          this.closeEditDialog();
        } else {
          this.showSnackbar(
            result.error || this.$t("Failed to update employee"),
            "error",
            "mdi-alert-circle"
          );
        }
      } catch (error) {
        console.error("Error updating employee:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to update employee"),
          "error",
          "mdi-alert-circle"
        );
      } finally {
        this.isUpdating = false;
      }
    },

    openDeleteDialog(employee) {
      this.employeeToDelete = employee;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.employeeToDelete = null;
    },

    async confirmDelete() {
      if (!this.employeeToDelete) return;

      this.isDeleting = true;
      const employeeId = this.employeeToDelete.id;

      try {
        const result = await this.deleteEmployee(employeeId);

        if (result.success) {
          this.showSnackbar(
            this.$t("Employee deleted successfully"),
            "success",
            "mdi-check-circle"
          );

          // Refresh the employees list
          if (this.selectedGovernmentEntity) {
            const entityId =
              typeof this.selectedGovernmentEntity === "object"
                ? this.selectedGovernmentEntity.entity_id
                : this.selectedGovernmentEntity;
            await this.fetchEmployees(entityId);
          }

          this.closeDeleteDialog();
        } else {
          this.showSnackbar(
            result.error || this.$t("Failed to delete employee"),
            "error",
            "mdi-alert-circle"
          );
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to delete employee"),
          "error",
          "mdi-alert-circle"
        );
      } finally {
        this.isDeleting = false;
      }
    },

    showSnackbar(message, color = "success", icon = "mdi-check-circle") {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbarIcon = icon;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>

