<script>
import { mapState, mapActions } from "pinia";
import { useStudentStore } from "@/stores/student";
import MapOSM from "@/components/MapOSM.vue";

export default {
  name: "StudentView",
  data() {
    return {
      location: null,
    };
  },
  computed: {
    ...mapState(useStudentStore, ["student", "isLoading"]),
    fullName() {
      return `${this.student.firstName} ${this.student.lastName}`;
    },
  },
  async mounted() {
    const id = Number(this.$route.params.id);
    await this.getStudent(id);

    if (this.student?.lat != null && this.student?.lng != null) {
      this.location = {
        lat: Number(this.student.lat),
        lng: Number(this.student.lng),
      };
    } else {
      this.location = null;
    }
  },
  methods: {
    ...mapActions(useStudentStore, ["deleteStudent", "getStudent"]),
    genderIcon(gender) {
      return gender === "FEMALE" ? "mdi-gender-female" : "mdi-gender-male";
    },
    formatDateTime(d) {
      if (!d) return "—";
      const dt = new Date(d);
      return isNaN(dt) ? "—" : dt.toLocaleString();
    },
  },
};
</script>

<template>
  <VToolbar flat density="comfortable" class="px-0">
    <VBtn variant="text" @click="$router.back()" prepend-icon="mdi-arrow-left">
      Back
    </VBtn>
    <VToolbarTitle class="ms-2">student Details</VToolbarTitle>
    <VBtn
      v-if="student"
      color="primary"
      prepend-icon="mdi-pencil"
      :to="{ name: 'StudentEditForm', params: { id: student.id } }"
    >
      Edit
    </VBtn>
  </VToolbar>

  <div v-if="isLoading">
    <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
    <VSkeletonLoader type="list-item-three-line" />
  </div>

  <VCard v-else-if="student" class="pa-4">
    <VRow>
      <VCol
        cols="12"
        md="4"
        class="d-flex flex-column align-center text-center"
      >
        <VAvatar size="128" class="elevation-2">
          <img :src="student.imageUrl" :alt="fullName" />
        </VAvatar>

        <div class="text-h5 mt-4">{{ fullName }}</div>

        <div class="mt-2 d-flex flex-wrap justify-center ga-2">
          <VChip size="small" variant="tonal">
            <VIcon :icon="genderIcon(student.gender)" start size="18" />
            {{ student.gender }}
          </VChip>

          <VChip size="small" variant="tonal">
            <VIcon icon="mdi-school" start size="18" />
            {{ student.course }}
          </VChip>
        </div>
      </VCol>

      <VCol cols="12" md="8">
        <VRow>
          <VCol cols="12" md="6">
            <VList density="comfortable" class="card-list">
              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >Organization ID</VListItemTitle
                >
                <div>
                  <b>{{ student.organizationId }}</b>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >Date of Birth</VListItemTitle
                >
                <div>
                  <b>{{ formatDateTime(student.bod) }}</b>
                </div>
              </VListItem>
            </VList>
          </VCol>

          <VCol cols="12" md="6">
            <VList density="comfortable" class="card-list">
              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >Created At</VListItemTitle
                >
                <div>
                  <b>{{ formatDateTime(student.createdAt) }}</b>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >Updated At</VListItemTitle
                >
                <div>
                  <b>{{ formatDateTime(student.updatedAt) }}</b>
                </div>
              </VListItem>
            </VList>
          </VCol>
        </VRow>

        <VDivider class="my-4" />

        <div>
          <div class="text-subtitle-1 text-medium-emphasis mb-2">Notes</div>
          <div v-if="student.notes" class="pa-3 rounded border">
            {{ student.notes }}
          </div>
          <VAlert v-else type="info" variant="tonal" density="comfortable">
            No notes.
          </VAlert>
        </div>
      </VCol>
    </VRow>
    <VDivider class="my-6" />
    <div class="text-subtitle-1 text-medium-emphasis mb-2">Location</div>

    <div v-if="location">
      <MapOSM v-model="location" />
      <div class="mt-3 text-medium-emphasis">
        Lat: <b>{{ location.lat?.toFixed(6) }}</b
        >, Lng: <b>{{ location.lng?.toFixed(6) }}</b>
        <VBtn
          class="ms-2"
          size="small"
          variant="text"
          :href="`https://www.google.com/maps?q=${location.lat},${location.lng}`"
          target="_blank"
          prepend-icon="mdi-map"
        >
          Open in Maps
        </VBtn>
      </div>
    </div>
    <VAlert v-else type="info" variant="tonal" density="comfortable">
      No location set for this student.
    </VAlert>
  </VCard>

  <VAlert v-else type="warning" variant="tonal"> student not found. </VAlert>
</template>
