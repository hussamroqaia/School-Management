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
    pageBackgroundStyle() {
      return {
        backgroundColor: "#212121", // Dark gray background
      };
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
    initials(student) {
      if (student.firstName && student.lastName) {
        return (
          (student.firstName?.[0] || "") + (student.lastName?.[0] || "")
        ).toUpperCase();
      }
      return (student.name?.[0] || "?").toUpperCase();
    },
    avatarColor(gender) {
      return gender === "FEMALE" ? "pink" : "blue";
    },
    formatDate(d) {
      if (!d) return "—";
      const dt = new Date(d);
      return isNaN(dt) ? "—" : dt.toLocaleDateString();
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
      {{ $t("Back") }}
    </VBtn>
    <VToolbarTitle class="ms-2">{{ $t("Student Details") }}</VToolbarTitle>
    <VBtn
      v-if="student"
      color="primary"
      prepend-icon="mdi-pencil"
      :to="{ name: 'StudentEditForm', params: { id: student.id } }"
    >
      {{ $t("Edit") }}
    </VBtn>
  </VToolbar>

  <div v-if="isLoading">
    <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
    <VSkeletonLoader type="list-item-three-line" />
  </div>

  <VCard v-else-if="student" class="pa-4" :style="pageBackgroundStyle">
    <VRow>
      <VCol
        cols="12"
        md="4"
        class="d-flex flex-column align-center text-center"
      >
        <VAvatar 
          size="128" 
          class="elevation-2"
          :color="avatarColor(student.gender)"
        >
          <VImg
            :src="student.imageUrl"
            v-if="student.imageUrl"
            :alt="fullName"
          />
          <span v-else class="text-h4 font-weight-bold">
            {{ initials(student) }}
          </span>
        </VAvatar>

        <div class="text-h5 mt-4">{{ fullName }}</div>

        <div class="mt-2 d-flex flex-wrap justify-center ga-2">
          <VChip 
            size="small" 
            variant="tonal"
            :color="avatarColor(student.gender)"
          >
            <VIcon :icon="genderIcon(student.gender)" start size="18" />
            {{ student.gender }}
          </VChip>

          
        </div>
      </VCol>

      <VCol cols="12" md="8">
        <VRow>
          <VCol cols="12" md="6">
            <VList density="comfortable" class="card-list">
              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >{{ $t("Organization ID") }}</VListItemTitle
                >
                <div>
                  <b>{{ student.organizationId }}</b>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >{{ $t("Date of Birth") }}</VListItemTitle
                >
                <div>
                  <b>{{ formatDate(student.bod) }}</b>
                </div>
              </VListItem>
            </VList>
          </VCol>

          <VCol cols="12" md="6">
            <VList density="comfortable" class="card-list">
              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >{{ $t("Created At") }}</VListItemTitle
                >
                <div>
                  <b>{{ formatDateTime(student.createdAt) }}</b>
                </div>
              </VListItem>

              <VListItem>
                <VListItemTitle class="text-medium-emphasis"
                  >{{ $t("Updated At") }}</VListItemTitle
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
          <div class="text-subtitle-1 text-medium-emphasis mb-2">{{ $t("Notes") }}</div>
          <div v-if="student.notes" class="pa-3 rounded border">
            {{ student.notes }}
          </div>
          <VAlert v-else type="info" variant="tonal" density="comfortable">
            {{ $t("No notes") }}.
          </VAlert>
        </div>
      </VCol>
    </VRow>
    <VDivider class="my-6" />
    <div class="text-subtitle-1 text-medium-emphasis mb-2">{{ $t("Location") }}</div>

    <div v-if="location">
      <MapOSM v-model="location" :readonly="true" />
      <div class="mt-3 d-flex justify-end">
        <VBtn
          size="small"
          variant="text"
          :href="`https://www.google.com/maps?q=${location.lat},${location.lng}`"
          target="_blank"
          prepend-icon="mdi-map"
        >
          {{ $t("Open in Maps") }}
        </VBtn>
      </div>
    </div>
    <VAlert v-else type="info" variant="tonal" density="comfortable">
      {{ $t("No location set for this student") }}.
    </VAlert>
  </VCard>

  <VAlert v-else type="warning" variant="tonal"> {{ $t("Student not found") }}. </VAlert>
</template>
