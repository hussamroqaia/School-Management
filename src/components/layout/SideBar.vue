<template>
  <v-navigation-drawer v-model="open" app>
    <v-list>
      <v-list-item class="pa-4">
        <template #prepend>
          <VAvatar
            :color="isAdmin ? 'primary' : 'info'"
            size="48"
            class="me-3"
          >
            <VIcon 
              :icon="isAdmin ? 'mdi-account-cog' : 'mdi-account'" 
              size="24"
              color="white"
          />
          </VAvatar>
        </template>
        <VListItemTitle class="font-weight-bold">
          {{ isAdmin ? $t("Manager") : $t("Employee") }}
        </VListItemTitle>
        <VListItemSubtitle class="text-caption">
          {{ user?.name || user?.email || "" }}
        </VListItemSubtitle>
      </v-list-item>
    </v-list>

    <VDivider />

    <v-list density="comfortable" nav class="pa-2">
      <VListItem
        v-if="!isEmployee"
        prepend-icon="mdi-view-dashboard"
        :title="$t('Dashboard')"
        :active="$route && $route.name === 'home'"
        class="mb-1 rounded"
        @click="goToHome"
      />

      <VListItem
        v-if="isEmployee"
        prepend-icon="mdi-alert-circle-outline"
        :title="$t('Complaints')"
        :active="$route && ($route.name === 'complaints' || $route.name === 'complaint-view')"
        class="mb-1 rounded"
        @click="goToComplaints"
      />

      <VListItem
        v-if="isAdmin"
        prepend-icon="mdi-account-plus"
        :title="$t('Add Employee')"
        :active="$route && $route.name === 'add-employee'"
        class="mb-1 rounded"
        @click="goToAddEmployee"
      />

      <VListItem
        v-if="isAdmin"
        prepend-icon="mdi-account-group"
        :title="$t('Employees')"
        :active="$route && $route.name === 'employees'"
        class="mb-1 rounded"
        @click="goToEmployees"
      />
      <VListItem
        v-if="!isEmployee"
        prepend-icon="mdi-monitor-dashboard"
        :title="$t('Monitoring Complaints')"
        :active="$route && $route.name === 'monitoring-complaints'"
        class="mb-1 rounded"
        @click="goToMonitoringComplaints"
      />
    </v-list>

    <template #append>
      <div class="pa-2">
        <VCard variant="tonal" color="primary" class="pa-3">
          <div class="text-caption text-medium-emphasis mb-1">
            {{ $t("Application") }}
          </div>
          <div class="text-body-2 font-weight-medium">
            {{ $t("Government Complaints") }}
          </div>
        </VCard>
      </div>
    </template>
  </v-navigation-drawer>
</template>
<script>
import { useAuthStore } from "@/stores/auth";
import { mapState } from "pinia";

export default {
  props: {
    drawer: Boolean,
  },
  data() {
    return {
      open: this.drawer,
      opened: ["ad_mgmt"],
      authStore: useAuthStore(),
    };
  },
  computed: {
    ...mapState(useAuthStore, ["user"]),
    isOrganization() {
      return this.authStore.isOrganization;
    },
    isTeacher() {
      return this.authStore.isTeacher;
    },
    isAdmin() {
      return this.authStore.isAdmin;
    },
    
    isEmployee() {
      return this.user?.role === "employee";
    },
  },
  watch: {
    drawer(newVal) {
      this.open = newVal;
    },
  },
  methods: {
    goToHome() {
      if (this.$router) {
        this.$router.push({ name: "home" });
      }
    },
    goToComplaints() {
      if (this.$router) {
        this.$router.push({ name: "complaints" });
      }
    },
    goToAddEmployee() {
      if (this.$router) {
        this.$router.push({ name: "add-employee" });
      }
    },
    goToEmployees() {
      if (this.$router) {
        this.$router.push({ name: "employees" });
      }
    },
    goToMonitoringComplaints() {
      if (this.$router) {
        this.$router.push({ name: "monitoring-complaints" });
      }
    },
  },
};
</script>

<style scoped>
.v-list-item {
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
