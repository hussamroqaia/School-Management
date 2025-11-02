<script>
import { mapState, mapActions } from "pinia";
import { useBusStore } from "@/stores/bus";

export default {
  name: "BusesView",
  data() {
    return {
      search: "",
      dialogDelete: false,
      itemToDelete: null,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
    };
  },
  computed: {
    ...mapState(useBusStore, ["buses", "isLoading"]),
    filteredBuses() {
      if (!this.search) return this.buses;
      const searchLower = this.search.toLowerCase();
      return this.buses.filter(
        (bus) =>
          bus.driverName?.toLowerCase().includes(searchLower) ||
          bus.carNumber?.toLowerCase().includes(searchLower) ||
          bus.carModel?.toLowerCase().includes(searchLower)
      );
    },
  },
  methods: {
    ...mapActions(useBusStore, ["listBuses", "deleteBus"]),
    async refresh() {
      await this.listBuses();
    },
    openDeleteDialog(id) {
      this.itemToDelete = id;
      this.dialogDelete = true;
    },
    async confirmDelete() {
      if (!this.itemToDelete) return;
      try {
        await this.deleteBus(this.itemToDelete);
        await this.refresh();
        this.snackbarText = this.$t("Bus deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (error) {
        console.error("Failed to delete bus:", error);
        const errorMessage = error?.message || this.$t("Failed to delete bus");
        this.snackbarText = errorMessage;
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.dialogDelete = false;
        this.itemToDelete = null;
      }
    },
  },
  async mounted() {
    await this.refresh();
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-bus" class="me-2" />
        {{ $t("Buses") }}
      </VToolbarTitle>
      <VSpacer />
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$router.push({ name: 'bus-add' })"
      >
        {{ $t("Add Bus") }}
      </VBtn>
    </VToolbar>
    <VDivider />

    <VCardText>
      <div
        class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2"
      >
        <VTextField
          v-model="search"
          :label="$t('Search')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          style="max-width: 300px"
          clearable
        />
      </div>

      <div v-if="isLoading">
        <VSkeletonLoader v-for="n in 3" :key="n" type="card" class="mb-4" />
      </div>

      <div v-else-if="filteredBuses.length === 0" class="text-center py-8">
        <VIcon icon="mdi-bus-off" size="64" class="mb-4 text-medium-emphasis" />
        <div class="text-h6 text-medium-emphasis">
          {{ $t("No buses found") }}
        </div>
      </div>

      <VRow v-else>
        <VCol
          v-for="bus in filteredBuses"
          :key="bus.id"
          cols="12"
          md="6"
          lg="4"
        >
          <VCard elevation="2" class="h-100">
            <VCardTitle class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <VIcon icon="mdi-bus" class="me-2" color="primary" />
                <span>{{ bus.driverName }}</span>
              </div>
              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    icon="mdi-dots-vertical"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <VList>
                  <VListItem :to="{ name: 'bus-view', params: { id: bus.id } }">
                    <template #prepend>
                      <VIcon icon="mdi-eye" />
                    </template>
                    <VListItemTitle>{{ $t("View") }}</VListItemTitle>
                  </VListItem>
                  <VListItem :to="{ name: 'bus-edit', params: { id: bus.id } }">
                    <template #prepend>
                      <VIcon icon="mdi-pencil" />
                    </template>
                    <VListItemTitle>{{ $t("Edit") }}</VListItemTitle>
                  </VListItem>
                  <VListItem @click="openDeleteDialog(bus.id)">
                    <template #prepend>
                      <VIcon icon="mdi-delete" color="error" />
                    </template>
                    <VListItemTitle>{{ $t("Delete") }}</VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </VCardTitle>

            <VDivider />

            <VCardText>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Car Number") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-car" size="16" class="me-2" />
                  <span class="text-body-1">{{ bus.carNumber }}</span>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Car Model") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-car-sports" size="16" class="me-2" />
                  <span class="text-body-1">{{ bus.carModel }}</span>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Start Time") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-clock-outline" size="16" class="me-2" />
                  <span class="text-body-1">{{ bus.startTime }}</span>
                </div>
              </div>

              <div class="mb-3" v-if="bus.startLat && bus.startLng">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Location") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-map-marker" size="16" class="me-2" />
                  <span class="text-body-1">
                    {{ bus.startLat?.toFixed(4) }},
                    {{ bus.startLng?.toFixed(4) }}
                  </span>
                </div>
              </div>

              <div>
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ $t("Students") }} ({{ bus.students?.length || 0 }})
                </div>
                <div v-if="bus.students && bus.students.length > 0">
                  <VChip
                    v-for="student in bus.students.slice(0, 3)"
                    :key="student.id"
                    size="small"
                    class="me-1 mb-1"
                  >
                    {{ student.student.firstName }}
                    {{ student.student.lastName }}
                  </VChip>
                  <VChip
                    v-if="bus.students.length > 3"
                    size="small"
                    variant="text"
                    class="me-1 mb-1"
                  >
                    +{{ bus.students.length - 3 }} {{ $t("more") }}
                  </VChip>
                </div>
                <div v-else class="text-body-2 text-medium-emphasis">
                  {{ $t("No students assigned") }}
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <VDialog v-model="dialogDelete" max-width="400">
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t("Confirm Delete") }}
      </VCardTitle>
      <VCardText>
        {{ $t("Are you sure you want to delete this bus?") }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="dialogDelete = false">
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn color="error" variant="flat" @click="confirmDelete">
          {{ $t("Delete") }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="snackbar"
    timeout="2500"
    location="top end"
    :color="snackbarColor"
    variant="flat"
    elevation="2"
  >
    <VIcon
      :icon="snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'"
      start
      class="me-2"
    />
    {{ snackbarText }}
  </VSnackbar>
</template>
