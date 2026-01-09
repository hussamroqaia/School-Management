<script>
export default {
  name: "ComplaintView",
  data() {
    return {
      complaint: null,
      isLoading: false,

      // Static complaints array (same as ComplaintsView)
      complaints: [
        {
          status: true,
          complain: {
            reference_number: "CMP-0911",
            status: "resolved",
            description:
              "Illo qui in quia aut amet deserunt. Et enim perferendis ducimus odio beatae voluptatem voluptatem. Incidunt asperiores minus illum illo laboriosam. Totam voluptas quam eius dolorum qui nihil ut nobis.",
            location: "507 Gorczany Glen\nWalterland, AK 50219",
            histories: [
              {
                status: "rejected",
                note: "Excepturi et saepe perferendis repellendus ratione nulla optio.",
                changed_at: "2025-11-22 20:49:42",
                handled_by: {
                  id: 51,
                  employee: "Jalen Hyatt",
                },
              },
              {
                status: "processing",
                note: "Sit voluptatem ipsum quisquam et in reprehenderit tenetur qui.",
                changed_at: "2025-11-22 20:49:42",
                handled_by: {
                  id: 50,
                  employee: "Delfina Carter",
                },
              },
              {
                status: "new",
                note: "Earum quam dolores doloribus excepturi delectus vel.",
                changed_at: "2025-11-22 20:49:42",
                handled_by: {
                  id: 40,
                  employee: "Dayana Hand Jr.",
                },
              },
              {
                status: "resolved",
                note: "Atque cum fugiat debitis distinctio repudiandae.",
                changed_at: "2025-11-22 20:49:42",
                handled_by: {
                  id: 50,
                  employee: "Delfina Carter",
                },
              },
            ],
          },
        },
        {
          status: true,
          complain: {
            reference_number: "CMP-0912",
            status: "processing",
            description:
              "Another complaint description here. This is a longer description to test the display.",
            location: "123 Main Street\nCity, State 12345",
            histories: [
              {
                status: "new",
                note: "Complaint received and logged.",
                changed_at: "2025-11-23 10:30:00",
                handled_by: {
                  id: 40,
                  employee: "Dayana Hand Jr.",
                },
              },
              {
                status: "processing",
                note: "Complaint is being processed.",
                changed_at: "2025-11-23 14:20:00",
                handled_by: {
                  id: 50,
                  employee: "Delfina Carter",
                },
              },
            ],
          },
        },
        {
          status: true,
          complain: {
            reference_number: "CMP-0913",
            status: "new",
            description:
              "A new complaint that needs attention. Please review this issue carefully.",
            location: "456 Oak Avenue\nSpringfield, IL 62701",
            histories: [
              {
                status: "new",
                note: "Complaint submitted.",
                changed_at: "2025-11-24 09:15:00",
                handled_by: {
                  id: 40,
                  employee: "Dayana Hand Jr.",
                },
              },
            ],
          },
        },
        {
          status: true,
          complain: {
            reference_number: "CMP-0914",
            status: "rejected",
            description:
              "This complaint was rejected due to insufficient information provided.",
            location: "789 Pine Road\nDenver, CO 80202",
            histories: [
              {
                status: "new",
                note: "Initial submission.",
                changed_at: "2025-11-20 11:00:00",
                handled_by: {
                  id: 40,
                  employee: "Dayana Hand Jr.",
                },
              },
              {
                status: "rejected",
                note: "Rejected due to insufficient information.",
                changed_at: "2025-11-21 15:45:00",
                handled_by: {
                  id: 51,
                  employee: "Jalen Hyatt",
                },
              },
            ],
          },
        },
      ],
    };
  },

  mounted() {
    const referenceNumber = this.$route.params.id;
    this.loadComplaint(referenceNumber);
  },

  methods: {
    loadComplaint(referenceNumber) {
      this.isLoading = true;
      // Simulate loading
      setTimeout(() => {
        const found = this.complaints.find(
          (c) => c.complain.reference_number === referenceNumber
        );
        this.complaint = found ? found.complain : null;
        this.isLoading = false;
      }, 300);
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

    formatDate(dateString) {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return isNaN(date) ? "—" : date.toLocaleString();
    },
  },
};
</script>

<template>
  <VToolbar flat density="comfortable" class="px-0 mb-4">
    <VBtn variant="text" @click="$router.back()" prepend-icon="mdi-arrow-left">
      {{ $t("Back") }}
    </VBtn>
    <VToolbarTitle class="ms-2">{{ $t("Complaint Details") }}</VToolbarTitle>
  </VToolbar>

  <div v-if="isLoading">
    <VRow>
      <VCol cols="12" md="4">
        <VSkeletonLoader type="avatar" class="mb-3" />
      </VCol>
      <VCol cols="12" md="8">
        <VSkeletonLoader type="list-item-two-line" class="mb-3" />
        <VSkeletonLoader type="list-item-two-line" />
      </VCol>
    </VRow>
  </div>

  <VCard v-else-if="complaint" class="pa-4" elevation="2">
    <VRow>
      <VCol cols="12" md="4" class="d-flex flex-column align-center text-center">
        <VAvatar size="128" class="elevation-4 mb-4" :color="getStatusColor(complaint.status)">
          <VIcon :icon="getStatusIcon(complaint.status)" size="64" color="white" />
        </VAvatar>

        <div class="text-h5 mt-2 font-weight-bold">{{ complaint.reference_number }}</div>

        <div class="mt-3">
          <VChip
            size="large"
            variant="tonal"
            :color="getStatusColor(complaint.status)"
            class="font-weight-medium"
          >
            <VIcon :icon="getStatusIcon(complaint.status)" start size="20" />
            {{ $t(complaint.status) }}
          </VChip>
        </div>
      </VCol>

      <VCol cols="12" md="8">
        <VRow>
          <VCol cols="12">
            <VCard variant="tonal" class="pa-3 mb-3">
              <VList density="comfortable">
                <VListItem>
                  <VListItemTitle class="text-medium-emphasis d-flex align-center mb-1">
                    <VIcon icon="mdi-tag-outline" size="18" class="me-2" />
                    {{ $t("Reference Number") }}
                  </VListItemTitle>
                  <div class="text-h6 font-weight-bold">
                    {{ complaint.reference_number }}
                  </div>
                </VListItem>

                <VDivider class="my-2" />

                <VListItem>
                  <VListItemTitle class="text-medium-emphasis d-flex align-center mb-1">
                    <VIcon icon="mdi-information-outline" size="18" class="me-2" />
                    {{ $t("Status") }}
                  </VListItemTitle>
                  <div>
                    <VChip
                      size="small"
                      :color="getStatusColor(complaint.status)"
                      variant="tonal"
                    >
                      <VIcon :icon="getStatusIcon(complaint.status)" start size="16" />
                      {{ $t(complaint.status) }}
                    </VChip>
                  </div>
                </VListItem>

                <VDivider class="my-2" />

                <VListItem>
                  <VListItemTitle class="text-medium-emphasis d-flex align-center mb-1">
                    <VIcon icon="mdi-map-marker-outline" size="18" class="me-2" />
                    {{ $t("Location") }}
                  </VListItemTitle>
                  <div class="text-body-1 font-weight-medium">
                    {{ complaint.location }}
                  </div>
                </VListItem>
              </VList>
            </VCard>
          </VCol>
        </VRow>

        <VDivider class="my-4" />

        <VCard variant="outlined" class="pa-4">
          <div class="text-subtitle-1 text-medium-emphasis mb-3 d-flex align-center">
            <VIcon icon="mdi-text-box-outline" size="20" class="me-2" />
            {{ $t("Description") }}
          </div>
          <div class="text-body-1 pa-3 rounded bg-surface">
            {{ complaint.description }}
          </div>
        </VCard>
      </VCol>
    </VRow>

    <VDivider class="my-6" />

    <div>
      <div class="text-subtitle-1 text-medium-emphasis mb-4 d-flex align-center">
        <VIcon icon="mdi-history" size="20" class="me-2" />
        {{ $t("Status History") }}
      </div>
      <VTimeline density="compact">
        <VTimelineItem
          v-for="(history, index) in complaint.histories"
          :key="index"
          :dot-color="getStatusColor(history.status)"
          size="small"
        >
          <template #icon>
            <VIcon :icon="getStatusIcon(history.status)" size="20" color="white" />
          </template>
          <VCard elevation="2" class="mb-3">
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
              <div class="text-body-2 mb-2 pa-2 rounded bg-surface">{{ history.note }}</div>
              <div class="text-caption text-medium-emphasis d-flex align-center">
                <VIcon icon="mdi-account" size="14" class="me-1" />
                {{ $t("Handled by") }}: <strong class="ms-1">{{ history.handled_by.employee }}</strong>
              </div>
            </VCardText>
          </VCard>
        </VTimelineItem>
      </VTimeline>
    </div>
  </VCard>

  <VAlert v-else type="warning" variant="tonal" class="mt-4">
    <VIcon icon="mdi-alert" class="me-2" />
    {{ $t("Complaint not found") }}.
  </VAlert>
</template>
