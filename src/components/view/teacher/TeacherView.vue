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
    pageBackgroundStyle() {
      return {
        backgroundColor: "#212121",
      };
    },
  },
  async mounted() {
    const id = Number(this.$route.params.id);
    await this.getTeacher(id);
  },
  methods: {
    ...mapActions(useTeacherStore, ["getTeacher"]),
    initials(teacher) {
      if (teacher.firstName && teacher.lastName) {
        return (
          (teacher.firstName?.[0] || "") + (teacher.lastName?.[0] || "")
        ).toUpperCase();
      }
      return (teacher.name?.[0] || "?").toUpperCase();
    },
    studentInitials(student) {
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
    formatMoney(n) {
      return `US $ ${Number(n).toLocaleString()}`;
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
  <VContainer class="py-6">
    <VToolbar flat density="comfortable" class="px-0">
      <VBtn
        variant="text"
        @click="$router.back()"
        prepend-icon="mdi-arrow-left"
      >
        {{ $t("Back") }}
      </VBtn>
      <VToolbarTitle class="ms-2">{{ $t("Teacher Details") }}</VToolbarTitle>

      <VBtn
        v-if="teacher"
        color="primary"
        :to="{ name: 'teacher-edit', params: { id: teacher.id } }"
        prepend-icon="mdi-pencil"
      >
        {{ $t("Edit") }}
      </VBtn>
    </VToolbar>

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <VCard v-else-if="teacher" class="pa-4" :style="pageBackgroundStyle">
      <VRow>
        <VCol
          cols="12"
          md="4"
          class="d-flex flex-column align-center text-center"
        >
          <VAvatar
            size="128"
            class="elevation-2"
            :color="avatarColor(teacher.gender)"
          >
            <VImg
              :src="teacher.imageUrl"
              v-if="teacher.imageUrl"
              :alt="fullName"
            />
            <span v-else class="text-h4 font-weight-bold">
              {{ initials(teacher) }}
            </span>
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
              {{ teacher.isActive ? $t("Active") : $t("Inactive") }}
            </VChip>

            <VChip
              size="small"
              variant="tonal"
              :color="avatarColor(teacher.gender)"
            >
              <VIcon :icon="genderIcon" start size="18" />
              {{ teacher.gender }}
            </VChip>

            <VChip size="small" variant="tonal">
              <VIcon icon="mdi-book-open-variant" start size="18" />
              {{ subjectName }}
            </VChip>
          </div>
        </VCol>

        <VCol cols="12" md="8">
          <VRow>
            <VCol cols="12" md="6">
              <VList density="comfortable" class="card-list">
                <VListItem :title="$t('Email')">
                  <b>{{ teacher.email }}</b>
                </VListItem>
                <VListItem :title="$t('Phone')">
                  <b>{{ teacher.phone }}</b>
                </VListItem>
                <VListItem :title="$t('Salary / Session')">
                  <b>{{ formatMoney(teacher.salaryPerSession) }}</b>
                </VListItem>
                <VListItem :title="$t('Sessions This Month')">
                  <b>{{ teacher.sessionsCountInMonth }}</b>
                </VListItem>
              </VList>
            </VCol>

            <VCol cols="12" md="6">
              <VList density="comfortable" class="card-list">
                <VListItem :title="$t('Education Level')">
                  <b>{{ teacher.educationLevel }}</b>
                </VListItem>
                <VListItem :title="$t('Degree')">
                  <b>{{ teacher.universityDegree }}</b>
                </VListItem>
                <VListItem :title="$t('Experience')">
                  <b>{{ teacher.yearsOfExperience }} {{ $t("years") }}</b>
                </VListItem>
                <VListItem :title="$t('Date of Birth')">
                  <b>{{ formatDate(teacher.bod) }}</b>
                </VListItem>
              </VList>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <div v-if="teacher.subject">
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              {{ $t("Subject Details") }}
            </div>
            <VSheet class="pa-3 rounded border">
              <div>
                <b>{{ $t("Name") }}:</b> {{ teacher.subject.name }}
              </div>
            </VSheet>
          </div>

          <VDivider class="my-4" />

          <div>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              {{ $t("Courses") }}
            </div>

            <VExpansionPanels>
              <VExpansionPanel
                v-for="course in teacher.courses"
                :key="course.id"
                :title="course.title"
                :text="`${$t('From')} ${formatDateTime(course.startDate)} ${$t(
                  'to'
                )} ${formatDateTime(course.endDate)}`"
              >
                <template #text>
                  <div class="pa-3">
                    <div class="mb-2">
                      <b>{{ $t("Time") }}:</b> {{ course.startTime }} -
                      {{ course.endTime }}
                    </div>
                    <div class="mb-2">
                      <b>{{ $t("Days") }}:</b> {{ course.days.join(", ") }}
                    </div>

                    <div v-if="course.classRoom" class="mb-2">
                      <b>{{ $t("Classroom") }}:</b> {{ course.classRoom.title }}
                      <VChip
                        size="small"
                        color="primary"
                        variant="tonal"
                        v-if="course.classRoom.hasProjector"
                        class="ms-2"
                      >
                        <VIcon start size="16" icon="mdi-projector" />
                        {{ $t("Projector") }}
                      </VChip>
                    </div>

                    <div>
                      <div class="text-subtitle-2 mt-4 mb-1">
                        {{ $t("Students") }} ({{ course.students.length }})
                      </div>
                      <VTable
                        density="comfortable"
                        v-if="course.students.length"
                      >
                        <thead>
                          <tr>
                            <th>{{ $t("Name") }}</th>
                            <th>{{ $t("Gender") }}</th>
                            <th>{{ $t("Date of Birth") }}</th>
                            <th>{{ $t("Notes") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="s in course.students" :key="s.id">
                            <td>
                              <div class="d-flex align-center ga-2">
                                <VAvatar
                                  :color="avatarColor(s.student.gender)"
                                  size="32"
                                >
                                  <VImg
                                    :src="s.student.imageUrl"
                                    v-if="s.student.imageUrl"
                                    :alt="
                                      s.student.firstName && s.student.lastName
                                        ? `${s.student.firstName} ${s.student.lastName}`
                                        : ''
                                    "
                                  />
                                  <span
                                    v-else
                                    class="text-body-2 font-weight-bold"
                                  >
                                    {{ studentInitials(s.student) }}
                                  </span>
                                </VAvatar>
                                <span>
                                  {{ s.student.firstName }}
                                  {{ s.student.lastName }}
                                </span>
                              </div>
                            </td>
                            <td>
                              <VChip
                                size="small"
                                variant="tonal"
                                :color="avatarColor(s.student.gender)"
                              >
                                {{ s.student.gender }}
                              </VChip>
                            </td>
                            <td>{{ formatDate(s.student.bod) }}</td>
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
                        {{ $t("No students enrolled") }}.
                      </VAlert>
                    </div>
                  </div>
                </template>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>

          <VDivider class="my-4" />

          <div>
            <div class="text-subtitle-1 text-medium-emphasis mb-2">
              {{ $t("Notes") }}
            </div>
            <div v-if="teacher.notes" class="pa-3 rounded border">
              {{ teacher.notes }}
            </div>
            <VAlert v-else type="info" variant="tonal" density="comfortable"
              >{{ $t("No notes") }}.</VAlert
            >
          </div>
        </VCol>
      </VRow>
    </VCard>

    <VAlert v-else type="warning" variant="tonal"
      >{{ $t("Teacher not found") }}.</VAlert
    >
  </VContainer>
</template>

<style scoped>
.card-list {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
</style>
