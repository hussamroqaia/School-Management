<script>
import { useDashboardStore } from "@/stores/dashboard";
import { useAuthStore } from "@/stores/auth";
import { mapState, mapActions } from "pinia";

export default {
  name: "HomeView",
  data() {
    return {
      dashboardStore: useDashboardStore(),
      authStore: useAuthStore(),
    };
  },
  computed: {
    ...mapState(useDashboardStore, ["dashboard", "isLoading"]),
    ...mapState(useAuthStore, ["user"]),
    
    isAdmin() {
      return this.authStore.isAdmin;
    },
    
    metrics() {
      return this.dashboard?.metrics || {
        totalComplaints: 0,
        newComplaints: 0,
        processingComplaints: 0,
        resolvedComplaints: 0,
        rejectedComplaints: 0,
        employeeCount: 0,
      };
    },
    statsCards() {
      return [
        {
          title: this.$t("Total Complaints"),
          value: this.metrics.totalComplaints,
          color: "primary",
          icon: "mdi-alert-circle-outline",
        },
        {
          title: this.$t("New Complaints"),
          value: this.metrics.newComplaints,
          color: "info",
          icon: "mdi-new-box",
        },
        {
          title: this.$t("Processing Complaints"),
          value: this.metrics.processingComplaints,
          color: "warning",
          icon: "mdi-clock-outline",
        },
        {
          title: this.$t("Resolved Complaints"),
          value: this.metrics.resolvedComplaints,
          color: "success",
          icon: "mdi-check-circle",
        },
        {
          title: this.$t("Rejected Complaints"),
          value: this.metrics.rejectedComplaints,
          color: "error",
          icon: "mdi-close-circle",
        },
        ...(this.isAdmin
          ? [
              {
                title: this.$t("Total Employees"),
                value: this.metrics.employeeCount,
                color: "info",
                icon: "mdi-account-group",
              },
            ]
          : []),
      ];
    },
    
    chartSegments() {
      if (this.metrics.totalComplaints === 0) {
        return [];
      }
      
      const circumference = 2 * Math.PI * 80; // r = 80
      const segments = [
        {
          label: this.$t("New Complaints"),
          value: this.metrics.newComplaints,
          color: "#2196F3", // info color
          percentage: (this.metrics.newComplaints / this.metrics.totalComplaints) * 100,
        },
        {
          label: this.$t("Processing Complaints"),
          value: this.metrics.processingComplaints,
          color: "#FB8C00", // warning color
          percentage: (this.metrics.processingComplaints / this.metrics.totalComplaints) * 100,
        },
        {
          label: this.$t("Resolved Complaints"),
          value: this.metrics.resolvedComplaints,
          color: "#4CAF50", // success color
          percentage: (this.metrics.resolvedComplaints / this.metrics.totalComplaints) * 100,
        },
        {
          label: this.$t("Rejected Complaints"),
          value: this.metrics.rejectedComplaints,
          color: "#FF5252", // error color
          percentage: (this.metrics.rejectedComplaints / this.metrics.totalComplaints) * 100,
        },
      ].filter(seg => seg.value > 0);
      
      let offset = 0;
      return segments.map(segment => {
        const dashArray = (segment.percentage / 100) * circumference;
        const dashOffset = offset;
        offset -= dashArray;
        
        return {
          ...segment,
          dashArray: `${dashArray} ${circumference}`,
          dashOffset: dashOffset,
        };
      });
    },
  },
  mounted() {
    this.fetchDashboard();
  },
  methods: {
    ...mapActions(useDashboardStore, ["fetchDashboard"]),
    
    handleCardClick(card) {
      if (card.color === "primary") {
        this.$router.push({ name: "complaints" });
      } else if (card.icon === "mdi-account-group" && this.$router) {
        // Navigate to employees page if admin
        this.$router.push({ name: "employees" });
      }
    },
  },
};
</script>

<template>
  <VContainer class="py-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">{{ $t("Dashboard") }}</h1>
      <p class="text-body-2 text-medium-emphasis">
        {{ $t("Overview of complaint statistics and status") }}
      </p>
    </div>

    <div v-if="isLoading">
      <VRow>
        <VCol v-for="n in (isAdmin ? 6 : 5)" :key="n" cols="12" sm="6" md="4" lg="3">
          <VSkeletonLoader type="card" height="120" />
        </VCol>
      </VRow>
    </div>

    <div v-else-if="dashboard">
      <VRow>
        <VCol
          v-for="(card, index) in statsCards"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard
            :color="card.color"
            class="pa-4 text-white"
            elevation="3"
            :class="{ 'hover-elevation-6': true }"
            style="transition: all 0.3s ease; cursor: pointer"
            @click="handleCardClick(card)"
          >
            <div class="d-flex justify-space-between align-start">
              <div class="flex-grow-1">
                <div class="text-h4 font-weight-bold mb-1">{{ card.value }}</div>
                <div class="text-subtitle-2 opacity-90">{{ card.title }}</div>
              </div>
              <VIcon :icon="card.icon" :size="40" class="opacity-80" />
            </div>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="mt-6">
        <VCol cols="12">
          <VCard elevation="2">
            <VCardTitle class="d-flex align-center">
              <VIcon icon="mdi-chart-pie" class="me-2" />
              {{ $t("Complaint Statistics") }}
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol cols="12" md="6">
                  <div class="text-h6 mb-4">{{ $t("Status Distribution") }}</div>
                  <div class="d-flex flex-column ga-3">
                    <div
                      v-for="card in statsCards.slice(1)"
                      :key="card.title"
                      class="d-flex align-center justify-space-between pa-3 rounded"
                      :style="{
                        backgroundColor: `rgba(var(--v-theme-${card.color}), 0.1)`,
                      }"
                    >
                      <div class="d-flex align-center">
                        <VIcon :icon="card.icon" :color="card.color" class="me-3" />
                        <span class="text-body-1">{{ card.title }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <span class="text-h6 font-weight-bold me-2">{{ card.value }}</span>
                        <VChip
                          size="small"
                          :color="card.color"
                          variant="tonal"
                        >
                          {{
                            metrics.totalComplaints > 0
                              ? Math.round(
                              (card.value / metrics.totalComplaints) * 100
                            )
                              : 0
                          }}%
                        </VChip>
                      </div>
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" md="6">
                  <div class="text-h6 mb-4">{{ $t("Complaints Chart") }}</div>
                  <div class="chart-container">
                    <svg
                      viewBox="0 0 200 200"
                      class="complaints-chart"
                      v-if="metrics.totalComplaints > 0"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#e0e0e0"
                        stroke-width="30"
                      />
                      <circle
                        v-for="(segment, index) in chartSegments"
                        :key="index"
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        :stroke="segment.color"
                        stroke-width="30"
                        :stroke-dasharray="segment.dashArray"
                        :stroke-dashoffset="segment.dashOffset"
                        transform="rotate(-90 100 100)"
                        class="chart-segment"
                      />
                    </svg>
                    <div v-else class="text-center py-8">
                      <VIcon icon="mdi-chart-pie" size="64" class="text-medium-emphasis mb-2" />
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t("No data available") }}
                      </div>
                    </div>
                    <div class="chart-legend mt-4">
                      <div
                        v-for="(segment, index) in chartSegments"
                        :key="index"
                        class="d-flex align-center mb-2"
                      >
                        <div
                          class="legend-color me-2"
                          :style="{ backgroundColor: segment.color }"
                        ></div>
                        <span class="text-body-2">{{ segment.label }}</span>
                        <VSpacer />
                        <span class="text-body-2 font-weight-medium">{{ segment.value }}</span>
                      </div>
                    </div>
                  </div>
                </VCol>
              </VRow>
              <VDivider class="my-4" />
              <VRow>
                <VCol cols="12">
                  <div class="text-h6 mb-4">{{ $t("Quick Actions") }}</div>
                  <VCard variant="outlined" class="pa-4">
                    <VList>
                      <VListItem
                        prepend-icon="mdi-alert-circle-outline"
                        :title="$t('View All Complaints')"
                        @click="$router.push({ name: 'complaints' })"
                        class="cursor-pointer"
                      >
                        <template #append>
                          <VIcon icon="mdi-chevron-right" />
                        </template>
                      </VListItem>
                      <VDivider class="my-2" />
                      <VListItem
                        prepend-icon="mdi-filter"
                        :title="$t('Filter by Status')"
                        subtitle="New, Processing, Resolved, Rejected"
                      />
                    </VList>
                  </VCard>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <div v-else class="text-center py-12">
      <VIcon
        icon="mdi-alert-circle"
        size="64"
        class="mb-4 text-medium-emphasis"
      />
      <div class="text-h6 text-medium-emphasis">
        {{ $t("Failed to load dashboard data") }}
      </div>
    </div>
  </VContainer>
</template>

<style scoped>
.hover-elevation-6:hover {
  transform: translateY(-4px);
}
.cursor-pointer {
  cursor: pointer;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.complaints-chart {
  width: 100%;
  max-width: 250px;
  height: 250px;
  margin: 0 auto;
}

.chart-segment {
  transition: stroke-dasharray 0.5s ease;
}

.chart-legend {
  width: 100%;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>
