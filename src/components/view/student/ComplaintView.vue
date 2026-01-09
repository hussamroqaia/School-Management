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
  <VToolbar flat density="comfortable" class="px-0">
    <VBtn variant="text" @click="$router.back()" prepend-icon="mdi-arrow-left">
      {{ $t("Back") }}
    </VBtn>
    <VToolbarTitle class="ms-2">{{ $t("Complaint Details") }}</VToolbarTitle>
  </VToolbar>

  <div v-if="isLoading">
    <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
    <VSkeletonLoader type="list-item-three-line" />
  </div>

  <VCard v-else-if="complaint" class="pa-4">
    <VRow>
      <VCol cols="12" md="4" class="d-flex flex-column align-center text-center">
        <VAvatar size="128" class="elevation-2" :color="getStatusColor(complaint.status)">
          <VIcon :icon="getStatusIcon(complaint.status)" size="64" />
        </VAvatar>

        <div class="text-h5 mt-4">{{ complaint.reference_number }}</div>

        <div class="mt-2">
          <VChip
            size="default"
            variant="tonal"
            :color="getStatusColor(complaint.status)"
          >
            <VIcon :icon="getStatusIcon(complaint.status)" start size="20" />
            {{ complaint.status }}
          </VChip>
        </div>
      </VCol>

      <VCol cols="12" md="8">
        <VRow>
          <VCol cols="12">
            <VList density="comfortable" class="card-list">
              <VListItem>
                <VListItemTitle class="text-medium-emphasis">
                  {{ $t("Reference Number") }}
                </VListItemTitle>
                <div>
                  <b>{{ complaint.reference_number }}</b>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis">
                  {{ $t("Status") }}
                </VListItemTitle>
                <div>
                  <VChip
                    size="small"
                    :color="getStatusColor(complaint.status)"
                    variant="tonal"
                  >
                    <VIcon :icon="getStatusIcon(complaint.status)" start size="16" />
                    {{ complaint.status }}
                  </VChip>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis">
                  {{ $t("Location") }}
                </VListItemTitle>
                <div>
                  <b>{{ complaint.location }}</b>
                </div>
              </VListItem>
            </VList>
          </VCol>
        </VRow>

        <VDivider class="my-4" />

        <div>
          <div class="text-subtitle-1 text-medium-emphasis mb-2">
            {{ $t("Description") }}
          </div>
          <div class="pa-3 rounded border">
            {{ complaint.description }}
          </div>
        </div>
      </VCol>
    </VRow>

    <VDivider class="my-6" />

    <div>
      <div class="text-subtitle-1 text-medium-emphasis mb-3">
        {{ $t("Status History") }}
      </div>
      <VTimeline side="end" density="compact">
        <VTimelineItem
          v-for="(history, index) in complaint.histories"
          :key="index"
          :dot-color="getStatusColor(history.status)"
          size="small"
        >
          <template #icon>
            <VIcon :icon="getStatusIcon(history.status)" size="20" />
          </template>
          <VCard>
            <VCardText>
              <div class="d-flex justify-space-between align-start mb-2">
                <VChip
                  size="small"
                  :color="getStatusColor(history.status)"
                  variant="tonal"
                >
                  {{ history.status }}
                </VChip>
                <div class="text-caption text-medium-emphasis">
                  {{ formatDate(history.changed_at) }}
                </div>
              </div>
              <div class="text-body-2 mb-2">{{ history.note }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ $t("Handled by") }}: {{ history.handled_by.employee }}
              </div>
            </VCardText>
          </VCard>
        </VTimelineItem>
      </VTimeline>
    </div>
  </VCard>

  <VAlert v-else type="warning" variant="tonal">
    {{ $t("Complaint not found") }}.
  </VAlert>
</template>

