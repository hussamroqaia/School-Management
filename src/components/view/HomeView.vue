<script>
import { mapState, mapActions } from "pinia";
import { useDashboardStore } from "@/stores/dashboard";

export default {
  name: "HomeView",
  computed: {
    ...mapState(useDashboardStore, ["dashboard", "isLoading"]),
    metrics() {
      return this.dashboard.metrics;
    },
    attendanceEvolution() {
      return this.dashboard.attendanceEvolution;
    },
    courseAttendance() {
      return this.dashboard.courseAttendance;
    },
    teacherSessionsSummary() {
      return this.dashboard.teacherSessionsSummary;
    },
    courseAttendanceChartData() {
      return this.courseAttendance.map((course, index) => ({
        id: course.courseId,
        title: course.courseTitle,
        value: Math.max(course.averageAttendanceRate || 0, 1),
        label: course.courseTitle,
        color: this.getColorForIndex(index),
      }));
    },
    attendanceEvolutionLabels() {
      return this.attendanceEvolution.map((item) =>
        new Date(item.date).toLocaleDateString()
      );
    },
    attendanceEvolutionChartData() {
      if (this.attendanceEvolution.length === 0) return [];
      return [
        {
          label: this.$t("Attendance Rate"),
          data: this.attendanceEvolution.map((item) => ({
            x: new Date(item.date).toLocaleDateString(),
            y: item.attendanceRate || 0,
          })),
        },
      ];
    },
  },
  async mounted() {
    await this.fetchDashboard();
  },
  methods: {
    ...mapActions(useDashboardStore, ["fetchDashboard"]),
    getColorForIndex(index) {
      const colors = [
        "#1976d2",
        "#388e3c",
        "#f57c00",
        "#7b1fa2",
        "#c2185b",
        "#0097a7",
        "#455a64",
        "#5d4037",
      ];
      return colors[index % colors.length];
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
    formatMoney(amount) {
      return `${this.$t("US Dollar")} ${Number(amount).toLocaleString()}`;
    },
  },
};
</script>

<template>
  <VContainer class="py-6">
    <div v-if="isLoading">
      <VRow>
        <VCol v-for="n in 7" :key="n" cols="12" sm="6" md="4" lg="3">
          <VSkeletonLoader type="card" />
        </VCol>
      </VRow>
    </div>

    <div v-else-if="dashboard">
      <VRow>
        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="success" class="pa-4">
            <VIcon :size="32" class="float-right"
              >mdi-book-open-page-variant</VIcon
            >
            <div class="text-h5">{{ metrics.coursesCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Total") }} {{ $t("Courses") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="info" class="pa-4">
            <VIcon :size="32" class="float-right">mdi-account-group</VIcon>
            <div class="text-h5">{{ metrics.studentsCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Total") }} {{ $t("Students") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="primary" class="pa-4">
            <VIcon :size="32" class="float-right">mdi-account-tie</VIcon>
            <div class="text-h5">{{ metrics.teachersCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Total") }} {{ $t("Teachers") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="warning" class="pa-4">
            <VIcon :size="32" class="float-right">mdi-google-classroom</VIcon>
            <div class="text-h5">{{ metrics.classRoomsCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Total") }} {{ $t("Classes") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard class="pa-4" style="background-color: #9c27b0; color: white">
            <VIcon :size="32" class="float-right">mdi-bus</VIcon>
            <div class="text-h5">{{ metrics.busesCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Total") }} {{ $t("Buses") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="success" variant="tonal" class="pa-4">
            <VIcon :size="32" class="float-right">mdi-check-circle</VIcon>
            <div class="text-h5">{{ metrics.activeTeachersCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Active") }} {{ $t("Teachers") }}
            </div>
          </VCard>
        </VCol>

        <VCol cols="12" sm="6" md="4" lg="3">
          <VCard color="error" variant="tonal" class="pa-4">
            <VIcon :size="32" class="float-right">mdi-close-circle</VIcon>
            <div class="text-h5">{{ metrics.inactiveTeachersCount }}</div>
            <div class="text-subtitle-1">
              {{ $t("Inactive") }} {{ $t("Teachers") }}
            </div>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="mt-6">
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-chart-line" class="me-2" />
              {{ $t("Attendance Evolution") }}
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div
                v-if="attendanceEvolution.length === 0"
                class="text-center py-8"
              >
                <VIcon
                  icon="mdi-chart-line"
                  size="64"
                  class="mb-4 text-medium-emphasis"
                />
                <div class="text-body-1 text-medium-emphasis">
                  {{ $t("No attendance data available") }}
                </div>
              </div>
              <div v-else>
                <VSparkline
                  :model-value="
                    attendanceEvolution.map((item) => item.attendanceRate)
                  "
                  :labels="attendanceEvolutionLabels"
                  color="primary"
                  height="200"
                  padding="16"
                  smooth
                  show-labels
                  line-width="2"
                  :min="0"
                  :max="100"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-chart-bar" class="me-2" />
              {{ $t("Course Attendance") }}
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div
                v-if="courseAttendance.length === 0"
                class="text-center py-8"
              >
                <VIcon
                  icon="mdi-chart-bar"
                  size="64"
                  class="mb-4 text-medium-emphasis"
                />
                <div class="text-body-1 text-medium-emphasis">
                  {{ $t("No course attendance data available") }}
                </div>
              </div>
              <div v-else>
                <VSparkline
                  :model-value="
                    courseAttendance.map(
                      (course) => course.averageAttendanceRate
                    )
                  "
                  :labels="courseAttendance.map((course) => course.courseTitle)"
                  color="secondary"
                  height="200"
                  padding="16"
                  smooth
                  show-labels
                  line-width="2"
                  :min="0"
                  :max="100"
                />
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow class="mt-6">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-account-tie" class="me-2" />
              {{ $t("Teacher Sessions Summary") }}
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div
                v-if="teacherSessionsSummary.length === 0"
                class="text-center py-8"
              >
                <VIcon
                  icon="mdi-account-tie"
                  size="64"
                  class="mb-4 text-medium-emphasis"
                />
                <div class="text-body-1 text-medium-emphasis">
                  {{ $t("No teacher sessions data available") }}
                </div>
              </div>
              <VDataTable
                v-else
                :items="teacherSessionsSummary"
                :headers="[
                  { title: $t('Teacher Name'), key: 'teacherName' },
                  {
                    title: $t('Sessions This Month'),
                    key: 'sessionsCountThisMonth',
                  },
                  {
                    title: $t('Total Payments'),
                    key: 'totalPaymentsThisMonth',
                  },
                ]"
                item-key="teacherId"
              >
                <template #item.teacherName="{ item }">
                  <div class="d-flex align-center">
                    <VIcon icon="mdi-account" class="me-2" />
                    {{ item.teacherName }}
                  </div>
                </template>
                <template #item.sessionsCountThisMonth="{ item }">
                  <VChip size="small" color="primary" variant="tonal">
                    {{ item.sessionsCountThisMonth }}
                  </VChip>
                </template>
                <template #item.totalPaymentsThisMonth="{ item }">
                  <div class="font-weight-bold">
                    {{ formatMoney(item.totalPaymentsThisMonth) }}
                  </div>
                </template>
              </VDataTable>
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
