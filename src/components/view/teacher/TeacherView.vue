<script>
import { mapState, mapActions } from "pinia";
import { useTeacherStore } from "@/stores/teacher";

export default {
  name: "TeacherView",
  computed: {
    ...mapState(useTeacherStore, ["teacher", "isLoading"]),
    fullName() {
      return `${this.teacher.firstName} ${this.teacher.lastName}`;
    },
    statusColor() {
      return this.teacher.isActive ? "success" : "error";
    },
    genderIcon() {
      return this.teacher.gender === "FEMALE"
        ? "mdi-gender-female"
        : "mdi-gender-male";
    },
    subjectName() {
      return this.teacher.subject?.name || `Subject #${this.teacher.subjectId}`;
    },
  },
  async mounted() {
    const id = Number(this.$route.params.id);
    await this.getTeacher(id);
  },
  methods: {
    ...mapActions(useTeacherStore, ["getTeacher"]),
    formatMoney(n) {
      return `US $ ${Number(n).toLocaleString()}`;
    },
    formatDateTime(d) {
      if (!d) return "—";
      const dt = new Date(d);
      return isNaN(dt) ? "—" : dt.toLocaleDateString();
    },
  },
};
</script>

<template>
  <VContainer class="py-6">
    <!-- Toolbar -->
    <VToolbar flat density="comfortable" class="px-0">
      <VBtn
        variant="text"
        @click="$router.back()"
        prepend-icon="mdi-arrow-left"
      >
        Back
      </VBtn>
      <VToolbarTitle class="ms-2">Teacher Details</VToolbarTitle>

      <VBtn
        v-if="teacher"
        color="primary"
        :to="{ name: 'teacher-edit', params: { id: teacher.id } }"
        prepend-icon="mdi-pencil"
      >
        Edit
      </VBtn>
    </VToolbar>

    <!-- Loading -->
    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <!-- Teacher Card -->
    <VCard v-else-if="teacher" class="pa-4">
      <VRow>
        <!-- Profile -->
        <VCol
          cols="12"
          md="4"
          class="d-flex flex-column align-center text-center"
        >
          <VAvatar size="128" class="elevation-2">
            <img
              :src="teacher.imageUrl || '/placeholder-avatar.png'"
              :alt="fullName"
            />
          </VAvatar>

          <div class="text-h5 mt-4">{{ fullName }}</div>

          <div class="mt-2 d-flex flex-wrap justify-center ga-2">
            <VChip :color="statusColor" size="small" variant="tonal">
              <VIcon
                :icon="
                  teacher.isActive ? 'mdi-check-circle' : 'mdi-close-circle'
                "
                start
                size="18"
              />
              {{ teacher.isActive ? "Active" : "Inactive" }}
            </VChip>

            <VChip size="small" variant="tonal">
              <VIcon :icon="genderIcon" start size="18" />
              {{ teacher.gender }}
            </VChip>

            <VChip size="small" variant="tonal">
              <VIcon icon="mdi-book-open-variant" start size="18" />
              {{ subjectName }}
            </VChip>
          </div>

          <div class="mt-4 d-flex ga-6">
            <VBtn
              variant="outlined"
              prepend-icon="mdi-email"
              :href="`mailto:${teacher.email}`"
            >
              Email
            </VBtn>
            <VBtn
              variant="outlined"
              prepend-icon="mdi-phone"
              :href="`tel:${teacher.phone}`"
            >
              Call
            </VBtn>
          </div>
        </VCol>

        <!-- Info -->
        <VCol cols="12" md="8">
          <VRow>
            <VCol cols="12" md="6">
              <VList density="comfortable" class="card-list">
                <VListItem title="Email">
                  <b>{{ teacher.email }}</b>
                </VListItem>
                <VListItem title="Phone">
                  <b>{{ teacher.phone }}</b>
                </VListItem>
                <VListItem title="Salary / Session">
                  <b>{{ formatMoney(teacher.salaryPerSession) }}</b>
                </VListItem>
                <VListItem title="Sessions This Month">
                  <b>{{ teacher.sessionsCountInMonth }}</b>
                </VListItem>
              </VList>
            </VCol>

            <VCol cols="12" md="6">
              <VList density="comfortable" class="card-list">
                <VListItem title="Education Level">
                  <b>{{ teacher.educationLevel }}</b>
                </VListItem>
                <VListItem title="Degree">
                  <b>{{ teacher.universityDegree }}</b>
                </VListItem>
                <VListItem title="Experience">
                  <b>{{ teacher.yearsOfExperience }} years</b>
                </VListItem>
                <VListItem title="Date of Birth">
                  <b>{{ formatDateTime(teacher.dob) }}</b>
                </VListItem>
              </VList>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Subject Details -->
          <div v-if="teacher.subject">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              Subject Details
            </div>
            <VSheet class="pa-3 rounded border">
              <div><b>ID:</b> {{ teacher.subject.id }}</div>
              <div><b>Name:</b> {{ teacher.subject.name }}</div>
              <div>
                <b>Created At:</b>
                {{ formatDateTime(teacher.subject.createdAt) }}
              </div>
            </VSheet>
          </div>

          <VDivider class="my-4" />

          <!-- Courses Section -->
          <div>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Courses</div>

            <VExpansionPanels>
              <VExpansionPanel
                v-for="course in teacher.courses"
                :key="course.id"
                :title="course.title"
                :text="`From ${formatDateTime(
                  course.startDate
                )} to ${formatDateTime(course.endDate)}`"
              >
                <template #text>
                  <div class="pa-3">
                    <div class="mb-2">
                      <b>Time:</b> {{ course.startTime }} - {{ course.endTime }}
                    </div>
                    <div class="mb-2">
                      <b>Days:</b> {{ course.days.join(", ") }}
                    </div>

                    <div v-if="course.classRoom" class="mb-2">
                      <b>Classroom:</b> {{ course.classRoom.title }}
                      <VChip
                        size="small"
                        color="primary"
                        variant="tonal"
                        v-if="course.classRoom.hasProjector"
                        class="ms-2"
                      >
                        <VIcon start size="16" icon="mdi-projector" />
                        Projector
                      </VChip>
                    </div>

                    <!-- Students -->
                    <div>
                      <div class="text-subtitle-2 mt-4 mb-1">
                        Students ({{ course.students.length }})
                      </div>
                      <VTable
                        density="comfortable"
                        v-if="course.students.length"
                      >
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="s in course.students" :key="s.id">
                            <td>
                              {{ s.student.firstName }} {{ s.student.lastName }}
                            </td>
                            <td>{{ s.student.gender }}</td>
                            <td>{{ formatDateTime(s.student.bod) }}</td>
                            <td>{{ s.student.notes || "—" }}</td>
                          </tr>
                        </tbody>
                      </VTable>
                      <VAlert
                        v-else
                        type="info"
                        variant="tonal"
                        density="comfortable"
                      >
                        No students enrolled.
                      </VAlert>
                    </div>
                  </div>
                </template>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>

          <VDivider class="my-4" />

          <!-- Notes -->
          <div>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">Notes</div>
            <div v-if="teacher.notes" class="pa-3 rounded border">
              {{ teacher.notes }}
            </div>
            <VAlert v-else type="info" variant="tonal" density="comfortable"
              >No notes.</VAlert
            >
          </div>
        </VCol>
      </VRow>
    </VCard>

    <!-- Not Found -->
    <VAlert v-else type="warning" variant="tonal">Teacher not found.</VAlert>
  </VContainer>
</template>

<style scoped>
.card-list {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
</style>
