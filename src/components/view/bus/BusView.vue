<script>
import { mapState, mapActions } from "pinia";
import { useBusStore } from "@/stores/bus";
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from "@vue-leaflet/vue-leaflet";
import L from "leaflet";

export default {
  name: "BusView",
  components: { LMap, LTileLayer, LMarker, LPopup, LPolyline },
  computed: {
    ...mapState(useBusStore, ["bus", "isLoading"]),
    busLocation() {
      if (this.bus?.startLat != null && this.bus?.startLng != null) {
        return {
          lat: Number(this.bus.startLat),
          lng: Number(this.bus.startLng),
        };
      }
      return null;
    },
    students() {
      return this.bus?.students || [];
    },
    studentsWithLocation() {
      return this.students.filter(
        (studentRel) =>
          studentRel.student?.lat != null && studentRel.student?.lng != null
      );
    },
    mapCenter() {
      if (this.busLocation) {
        return this.busLocation;
      }
      if (this.studentsWithLocation.length > 0) {
        const firstStudent = this.studentsWithLocation[0];
        return {
          lat: Number(firstStudent.student.lat),
          lng: Number(firstStudent.student.lng),
        };
      }
      return { lat: 20, lng: 0 };
    },
    mapZoom() {
      if (
        this.busLocation ||
        (this.studentsWithLocation.length > 0 &&
          this.studentsWithLocation.length === 1)
      ) {
        return 15;
      }
      if (this.studentsWithLocation.length > 1) {
        return 12;
      }
      return 3;
    },
    redBusIcon() {
      return L.divIcon({
        className: "custom-red-marker",
        html: `<div style="
          background-color: #f44336;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "><div style="
          transform: rotate(45deg);
          color: white;
          font-size: 18px;
          font-weight: bold;
        ">🚌</div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    },
  },
  methods: {
    ...mapActions(useBusStore, ["getBus"]),
    formatDate(iso) {
      return new Date(iso).toLocaleDateString();
    },
    formatDateTime(iso) {
      return new Date(iso).toLocaleString();
    },
    initials(student) {
      return (
        (student.firstName?.[0] || "") + (student.lastName?.[0] || "")
      ).toUpperCase();
    },
    avatarColor(gender) {
      return gender === "FEMALE" ? "pink" : "blue";
    },
    getStudentLocation(studentRel) {
      return {
        lat: Number(studentRel.student.lat),
        lng: Number(studentRel.student.lng),
      };
    },
    allLocationsLatLngs() {
      const points = [];
      if (this.busLocation) {
        points.push([this.busLocation.lat, this.busLocation.lng]);
      }
      this.studentsWithLocation.forEach((studentRel) => {
        points.push([
          Number(studentRel.student.lat),
          Number(studentRel.student.lng),
        ]);
      });
      return points;
    },
  },
  async mounted() {
    const id = Number(this.$route.params.id);
    await this.getBus(id);
  },
};
</script>

<template>
  <VContainer class="py-6">
    <VToolbar flat>
      <VBtn icon="mdi-arrow-left" @click="$router.back()" />
      <VToolbarTitle>{{ $t("Bus Details") }}</VToolbarTitle>
      <VSpacer />
      <VBtn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-pencil"
        :to="{ name: 'bus-edit', params: { id: bus.id } }"
      >
        {{ $t("Edit") }}
      </VBtn>
    </VToolbar>

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <div v-else-if="!bus || !bus.id" class="mt-6">
      <VAlert type="warning" variant="tonal">
        {{ $t("Bus not found") }}.
      </VAlert>
    </div>

    <div v-else>
      <VCard class="mt-4">
        <VCardTitle class="d-flex align-center">
          <VIcon icon="mdi-bus" class="me-2" color="primary" />
          <div>
            <div class="text-h6">{{ bus.driverName }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ $t("Bus ID") }}: {{ bus.id }}
            </div>
          </div>
        </VCardTitle>
        <VDivider />
        <VCardText>
          <VRow>
            <VCol cols="12" md="6">
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Car Number") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-car" size="20" class="me-2" />
                  <span class="text-body-1">{{ bus.carNumber }}</span>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Car Model") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-car-sports" size="20" class="me-2" />
                  <span class="text-body-1">{{ bus.carModel }}</span>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Start Time") }}
                </div>
                <div class="d-flex align-center">
                  <VIcon icon="mdi-clock-outline" size="20" class="me-2" />
                  <span class="text-body-1">{{ bus.startTime }}</span>
                </div>
              </div>
            </VCol>

            <VCol cols="12" md="6">
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Created At") }}
                </div>
                <div class="text-body-1">
                  {{ formatDateTime(bus.createdAt) }}
                </div>
              </div>

              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t("Updated At") }}
                </div>
                <div class="text-body-1">
                  {{ formatDateTime(bus.updatedAt) }}
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VRow class="mt-4">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-map-marker" class="me-2" />
              {{ $t("Locations") }}
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div v-if="busLocation || studentsWithLocation.length > 0">
                <div style="height: 520px; border-radius: 12px; overflow: hidden">
                  <l-map
                    :zoom="mapZoom"
                    :center="mapCenter"
                    style="height: 100%; width: 100%"
                  >
                    <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />

                    <l-polyline
                      v-if="busLocation && studentsWithLocation.length > 0"
                      :lat-lngs="allLocationsLatLngs"
                      :options="{ color: '#1976d2', weight: 3, opacity: 0.6, dashArray: '5, 5' }"
                    />

                    <l-marker
                      v-if="busLocation"
                      :lat-lng="busLocation"
                      :draggable="false"
                      :icon="redBusIcon"
                    >
                      <l-popup>
                        <div class="text-body-2">
                          <b>{{ $t("Bus Start Location") }}</b><br />
                          <b>{{ $t("Lat") }}:</b>
                          {{ bus.startLat?.toFixed(6) }}<br />
                          <b>{{ $t("Lng") }}:</b>
                          {{ bus.startLng?.toFixed(6) }}
                        </div>
                      </l-popup>
                    </l-marker>

                    <l-marker
                      v-for="studentRel in studentsWithLocation"
                      :key="studentRel.id"
                      :lat-lng="getStudentLocation(studentRel)"
                      :draggable="false"
                    >
                      <l-popup>
                        <div class="text-body-2">
                          <b
                            >{{ studentRel.student.firstName }}
                            {{ studentRel.student.lastName }}</b
                          ><br />
                          <b>{{ $t("Lat") }}:</b>
                          {{ studentRel.student.lat?.toFixed(6) }}<br />
                          <b>{{ $t("Lng") }}:</b>
                          {{ studentRel.student.lng?.toFixed(6) }}
                        </div>
                      </l-popup>
                    </l-marker>
                  </l-map>
                </div>
                <div class="mt-3">
                  <div v-if="busLocation" class="mb-2 d-flex align-center">
                    <VIcon icon="mdi-bus" color="primary" class="me-2" />
                    <span class="text-body-2 me-4"
                      >{{ $t("Bus Start Location") }}</span
                    >
                    <span class="text-medium-emphasis text-caption">
                      {{ $t("Lat") }}: {{ bus.startLat?.toFixed(6) }},
                      {{ $t("Lng") }}: {{ bus.startLng?.toFixed(6) }}
                    </span>
                    <VBtn
                      size="small"
                      variant="text"
                      class="ms-auto"
                      :href="`https://www.google.com/maps?q=${bus.startLat},${bus.startLng}`"
                      target="_blank"
                      prepend-icon="mdi-open-in-new"
                    >
                      {{ $t("Open in Maps") }}
                    </VBtn>
                  </div>
                  <div
                    v-if="studentsWithLocation.length > 0"
                    class="d-flex flex-wrap ga-2"
                  >
                    <VChip
                      v-for="studentRel in studentsWithLocation"
                      :key="studentRel.id"
                      size="small"
                      :color="
                        studentRel.student.gender === 'FEMALE'
                          ? 'pink'
                          : 'blue'
                      "
                      variant="tonal"
                    >
                      <VIcon
                        icon="mdi-map-marker"
                        size="16"
                        class="me-1"
                      />
                      {{ studentRel.student.firstName }}
                      {{ studentRel.student.lastName }}
                    </VChip>
                  </div>
                </div>
              </div>
              <VAlert
                v-else
                type="info"
                variant="tonal"
                class="text-center py-8"
              >
                <VIcon icon="mdi-map-marker-off" size="48" class="mb-3" />
                <div class="text-h6 mb-2">
                  {{ $t("No locations available") }}
                </div>
                <div class="text-body-2">
                  {{ $t("No location set for this bus or students") }}
                </div>
              </VAlert>
            </VCardText>
          </VCard>
        </VCol>

      </VRow>

      <VRow class="mt-4">
        <VCol cols="12">
          <VCard>
            <VCardTitle>
              <VIcon icon="mdi-account-group" class="me-2" />
              {{ $t("Students") }} ({{ students.length }})
            </VCardTitle>
            <VDivider />
            <VCardText>
              <div v-if="students.length">
                <VList density="comfortable" class="rounded border">
                  <VListItem
                    v-for="studentRel in students"
                    :key="studentRel.id"
                    class="py-2"
                  >
                    <template #prepend>
                      <VAvatar
                        :color="avatarColor(studentRel.student.gender)"
                        size="40"
                      >
                        <VImg
                          :src="studentRel.student.imageUrl"
                          v-if="studentRel.student.imageUrl"
                        />
                        <span v-else class="text-body-1">
                          {{ initials(studentRel.student) }}
                        </span>
                      </VAvatar>
                    </template>
                    <template #default>
                      <div class="text-subtitle-2">
                        {{ studentRel.student.firstName }}
                        {{ studentRel.student.lastName }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        <VChip
                          size="x-small"
                          :color="
                            studentRel.student.gender === 'FEMALE'
                              ? 'pink'
                              : 'blue'
                          "
                          variant="tonal"
                        >
                          {{ studentRel.student.gender }}
                        </VChip>
                      </div>
                    </template>
                    <template #append>
                      <RouterLink
                        :to="`/students/${studentRel.student.id}`"
                        class="text-decoration-none"
                      >
                        <VBtn
                          size="small"
                          variant="text"
                          color="primary"
                          prepend-icon="mdi-open-in-new"
                        >
                          {{ $t("View") }}
                        </VBtn>
                      </RouterLink>
                    </template>
                  </VListItem>
                </VList>
              </div>
              <VAlert v-else type="info" variant="tonal">
                {{ $t("No students assigned") }}.
              </VAlert>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style scoped>
:deep(.leaflet-container) {
  border-radius: 12px;
}
</style>

