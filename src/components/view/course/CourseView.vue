<script>
import { mapState, mapActions } from "pinia";
import { useCourseStore } from "@/stores/course";
import { Form, Field } from "vee-validate";
import * as yup from "yup";

export default {
  name: "CourseDetails",
  components: { Form, Field },

  data() {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      dialogAddSession: false,
      dialogAddAttendance: false,
      dialogDelete: false,
      selectedSessionId: null,
      selectedStudentId: null,
      isSubmittingAttendance: false,
      schema: yup.object({
        title: yup.string().required("Title is required").trim(),
        duration: yup
          .number()
          .required("Duration is required")
          .typeError("Enter a number")
          .min(1, "Duration must be at least 1 minute"),
      }),
      attendanceSchema: yup.object({
        studentId: yup
          .number()
          .required(this.$t("Student is required"))
          .typeError(this.$t("Please select a student")),
      }),
    };
  },

  computed: {
    ...mapState(useCourseStore, [
      "course",
      "isLoading",
      "sessions",
      "isLoadingSessions",
    ]),
  },

  methods: {
    ...mapActions(useCourseStore, [
      "deleteCourse",
      "getCourse",
      "fetchSessions",
      "addSession",
      "addAttendance",
    ]),

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

    async refresh() {
      const id = Number(this.$route.params.id);

      await this.getCourse(id);
      await this.fetchSessions(id);
      this.snackbarText = "Refreshed";
      this.snackbarColor = "success";
      this.snackbar = true;
    },

    async onSubmitSession(values) {
      try {
        const courseId = Number(this.$route.params.id);
        const payload = {
          ...values,
          courseId: courseId,
          duration: Number(values.duration),
        };
        await this.addSession(payload);
        this.snackbarText = "Session created successfully";
        this.snackbarColor = "success";
        this.snackbar = true;
        this.dialogAddSession = false;
        await this.fetchSessions(courseId);
      } catch (error) {
        console.error(error);
        this.snackbarText = "Failed to create session";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
      const id = Number(this.$route.params.id);
      await this.fetchSessions(id);
      
    },

    openAttendanceDialog(sessionId) {
      this.selectedSessionId = sessionId;
      this.selectedStudentId = null;
      this.dialogAddAttendance = true;
    },

    async onSubmitAttendance() {
      if (!this.selectedStudentId) {
        this.snackbarText = this.$t("Please select a student");
        this.snackbarColor = "error";
        this.snackbar = true;
        return;
      }

      this.isSubmittingAttendance = true;
      try {
        const payload = {
          studentId: Number(this.selectedStudentId),
          sessionId: Number(this.selectedSessionId),
          attendanceType: "ATTEND",
        };
        await this.addAttendance(payload);
        this.snackbarText = this.$t("Attendance marked successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
        this.dialogAddAttendance = false;
        this.selectedStudentId = null;
        this.selectedSessionId = null;
        
        const courseId = Number(this.$route.params.id);
        await this.fetchSessions(courseId);
      } catch (error) {
        console.error(error);
        this.snackbarText = this.$t("Failed to mark attendance");
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.isSubmittingAttendance = false;
      }
    },

    getCourseStudents() {
      if (!this.course || !this.course.students) return [];
      return this.course.students.map((rel) => ({
        title: `${rel.student.firstName} ${rel.student.lastName}`,
        value: rel.student.id,
      }));
    },

    goToEdit() {
      this.$router.push({
        name: "course-edit",
        params: { id: this.course.id },
      });
    },

    onDelete() {
      this.dialogDelete = true;
    },

    async confirmDelete() {
      try {
        await this.deleteCourse(this.course.id);
        this.snackbarText = this.$t("Course deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
        this.dialogDelete = false;
        this.$router.push({ name: "courses" });
      } catch (err) {
        console.error(err);
        this.snackbarText = this.$t("Failed to delete course");
        this.snackbarColor = "error";
        this.snackbar = true;
        this.dialogDelete = false;
      }
    },
  },

  async mounted() {
    const id = Number(this.$route.params.id);

    await this.getCourse(id);
    await this.fetchSessions(id);
  },
};
</script>

<template>
  <VContainer class="">
    <VToolbar flat>
      <VBtn icon="mdi-arrow-left" @click="$router.back()" />
      <VToolbarTitle>Course Details</VToolbarTitle>
      <VSpacer />
      <VBtn text @click="refresh" :loading="isLoading">
        <VIcon icon="mdi-refresh" />
      </VBtn>
    </VToolbar>

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <div v-else>
      <div v-if="!course && !isLoading" class="mt-6">
        <VAlert type="info" variant="tonal">Course not found.</VAlert>
      </div>

      <div v-if="course">
        <VCard class="mt-4">
          <VCardTitle class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6">{{ course.title }}</div>
              <div class="text-caption">
                {{ formatDate(course.startDate) }} —
                {{ formatDate(course.endDate) }}
              </div>
            </div>

            <div class="text-right">
              <div class="mb-1">
                <strong>Time:</strong>
                {{ course.startTime }} — {{ course.endTime }}
              </div>

              <div>
                <strong>Days:</strong>
                <span class="ml-2">
                  <VChip
                    v-for="d in course.days"
                    :key="d"
                    class="me-1"
                    size="small"
                    variant="tonal"
                  >
                    {{ d }}
                  </VChip>
                </span>
              </div>
            </div>
          </VCardTitle>

          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <div class="mt-1">
                  <strong>Created:</strong>
                  {{ formatDateTime(course.createdAt) }}
                </div>
                <div class="mt-1">
                  <strong>Updated:</strong>
                  {{ formatDateTime(course.updatedAt) }}
                </div>
              </VCol>

              <VCol cols="12" md="6" class="d-flex justify-end align-start">
                <div>
                  <VBtn small variant="tonal" @click="goToEdit" class="me-2">
                    <VIcon icon="mdi-pencil" start /> Edit
                  </VBtn>
                  <VBtn small color="error" variant="tonal" @click="onDelete">
                    <VIcon icon="mdi-delete" start /> Delete
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <VRow class="mt-4" dense>
          <VCol cols="12" md="6">
            <VCard>
              <VCardTitle>
                <VIcon icon="mdi-teach" class="me-2" /> Teacher
              </VCardTitle>
              <VDivider />
              <VCardText>
                <div v-if="course.teacher">
                  <div class="d-flex align-center gap-3">
                    <VAvatar size="56" class="mr-4">
                      <VImg
                        :src="course.teacher.imageUrl"
                        v-if="course.teacher.imageUrl"
                      />
                    </VAvatar>

                    <div>
                      <div class="text-subtitle-1">
                        {{ course.teacher.firstName }}
                        {{ course.teacher.lastName }}
                      </div>
                      <div class="text-caption">
                        {{ course.teacher.email }}
                      </div>
                      <div class="text-caption">
                        {{ course.teacher.phone ?? "-" }}
                      </div>
                      <div class="mt-2 text-caption">
                        <strong>Subject:</strong>
                        {{ course.teacher.subject.name }}
                      </div>
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" md="6">
            <VCard class="pb-11">
              <VCardTitle>
                <VIcon icon="mdi-google-classroom" class="me-2" /> Classroom
              </VCardTitle>
              <VDivider />
              <VCardText>
                <div v-if="course.classRoom">
                  <div class="text-subtitle-2">
                    {{ course.classRoom.title }}
                  </div>
                  <div class="text-caption mt-1">
                    Projector:
                    <VChip
                      :color="
                        course.classRoom.hasProjector ? 'success' : 'grey'
                      "
                      size="small"
                      variant="tonal"
                      :prepend-icon="
                        course.classRoom.hasProjector
                          ? 'mdi-projector'
                          : 'mdi-close-circle-outline'
                      "
                    >
                      {{ course.classRoom.hasProjector ? $t("Yes") : $t("No") }}
                    </VChip>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol cols="12">
            <VCard>
              <VExpansionPanels variant="accordion">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    <VIcon icon="mdi-account-group" class="me-2" />
                    Students ({{ (course.students || []).length }})
                  </VExpansionPanelTitle>

                  <VExpansionPanelText>
                    <div v-if="(course.students || []).length">
                      <VList density="comfortable" class="rounded border">
                        <VListItem
                          v-for="rel in course.students"
                          :key="rel.id"
                          class="py-2"
                        >
                          <template #prepend>
                            <VAvatar size="36">
                              <VImg
                                :src="rel.student.imageUrl"
                                v-if="rel.student.imageUrl"
                              />
                              <span v-else class="text-body-1">
                                {{ initials(rel.student) }}
                              </span>
                            </VAvatar>
                          </template>

                          <template #default>
                            <div class="text-subtitle-2">
                              {{ rel.student.firstName }}
                              {{ rel.student.lastName }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              {{
                                rel.student.bod
                                  ? formatDate(rel.student.bod)
                                  : ""
                              }}
                            </div>
                          </template>

                          <template #append>
                            <RouterLink :to="`/students/${rel.student.id}`">
                              <VBtn
                                size="small"
                                variant="text"
                                color="primary"
                                prepend-icon="mdi-open-in-new"
                              >
                                Open
                              </VBtn>
                            </RouterLink>
                          </template>
                        </VListItem>
                      </VList>
                    </div>

                    <div v-else>
                      <VAlert
                        type="info"
                        variant="tonal"
                        density="comfortable"
                        class="mt-2"
                      >
                        No students enrolled.
                      </VAlert>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCard>
          </VCol>
          <VCol cols="12">
            <VCard>
              <VCardTitle class="d-flex align-center justify-space-between">
                <div>
                  <VIcon icon="mdi-calendar-clock" class="me-2" /> Sessions ({{
                    sessions.length
                  }})
                </div>
                <VBtn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-plus"
                  @click="dialogAddSession = true"
                >
                  Add Session
                </VBtn>
              </VCardTitle>
              <VDivider />
              <VCardText>
                <div v-if="isLoadingSessions">
                  <VSkeletonLoader type="list-item-three-line" />
                </div>
                <div v-else-if="sessions.length">
                  <VExpansionPanels>
                    <VExpansionPanel
                      v-for="session in sessions"
                      :key="session.id"
                    >
                      <template #title>
                        <div
                          class="d-flex align-center justify-space-between w-100"
                        >
                          <div>
                            <div class="text-subtitle-2">
                              {{ session.title }}
                            </div>
                            <div class="text-caption">
                              Duration: {{ session.duration ?? "-" }} mins
                            </div>
                          </div>
                          <VBtn
                            size="small"
                            color="primary"
                            variant="tonal"
                            prepend-icon="mdi-check-circle"
                            @click.stop="openAttendanceDialog(session.id)"
                          >
                            {{ $t("Mark Attendance") }}
                          </VBtn>
                        </div>
                      </template>

                      <VExpansionPanelText>
                        <div v-if="(session.studentAttendance || []).length">
                          <VList density="comfortable">
                            <VListItem
                              v-for="att in session.studentAttendance"
                              :key="att.id"
                            >
                              <template #default>
                                <div>
                                  <div class="text-subtitle-2">
                                    {{ att.student?.firstName ?? "-" }}
                                    {{ att.student?.lastName ?? "" }}
                                  </div>
                                  <div class="text-caption">
                                    Status: {{ att.attendanceType }}
                                  </div>
                                </div>
                              </template>
                              <template #append>
                                <VChip size="small" variant="tonal">
                                  {{ att.attendanceType }}
                                </VChip>
                              </template>
                            </VListItem>
                          </VList>
                        </div>
                        <div v-else>
                          <VAlert type="info" variant="tonal"
                            >No attendance records.</VAlert
                          >
                        </div>
                      </VExpansionPanelText>
                    </VExpansionPanel>
                  </VExpansionPanels>
                </div>
                <div v-else-if="!isLoadingSessions">
                  <VAlert type="info" variant="tonal"
                    >No sessions created for this course.</VAlert
                  >
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </div>

    <VSnackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="1500"
      location="top end"
    >
      {{ snackbarText }}
    </VSnackbar>

    <VDialog v-model="dialogAddSession" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Add Session</span>
          <VBtn icon="mdi-close" variant="text" @click="dialogAddSession = false" />
        </VCardTitle>
        <VDivider />
        <VCardText>
          <Form
            :validation-schema="schema"
            v-slot="{ handleSubmit, isSubmitting }"
          >
            <form @submit.prevent="handleSubmit(onSubmitSession)">
              <VRow dense>
                <VCol cols="12">
                  <Field name="title" v-slot="{ field, errorMessage }">
                    <VTextField
                      :label="$t('Title') + ' *'"
                      :placeholder="$t('Enter session title')"
                      :model-value="field.value"
                      @update:modelValue="field.onChange"
                      @blur="field.onBlur"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      autocomplete="off"
                    />
                  </Field>
                </VCol>

                <VCol cols="12">
                  <Field name="duration" v-slot="{ field, errorMessage }">
                    <VTextField
                      :label="$t('Duration (minutes)') + ' *'"
                      :placeholder="$t('Enter duration in minutes')"
                      type="number"
                      :model-value="field.value"
                      @update:modelValue="field.onChange"
                      @blur="field.onBlur"
                      :error="!!errorMessage"
                      :error-messages="errorMessage"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      autocomplete="off"
                    />
                  </Field>
                </VCol>
              </VRow>

              <VCardActions class="px-0 mt-4">
                <VSpacer />
                <VBtn
                  variant="text"
                  @click="dialogAddSession = false"
                  :disabled="isSubmitting"
                >
                  {{ $t("Cancel") }}
                </VBtn>
                <VBtn
                  type="submit"
                  color="primary"
                  variant="tonal"
                  :loading="isSubmitting || isLoadingSessions"
                  :disabled="isSubmitting || isLoadingSessions"
                >
                  {{ $t("Create Session") }}
                </VBtn>
              </VCardActions>
            </form>
          </Form>
        </VCardText>
      </VCard>
    </VDialog>

    <VDialog v-model="dialogAddAttendance" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>{{ $t("Mark Attendance") }}</span>
          <VBtn
            icon="mdi-close"
            variant="text"
            @click="dialogAddAttendance = false"
          />
        </VCardTitle>
        <VDivider />
        <VCardText>
          <VSelect
            v-model="selectedStudentId"
            :label="$t('Select Student')"
            :items="getCourseStudents()"
            item-title="title"
            item-value="value"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :disabled="isSubmittingAttendance"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogAddAttendance = false"
            :disabled="isSubmittingAttendance"
          >
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn
            color="primary"
            variant="tonal"
            @click="onSubmitAttendance"
            :loading="isSubmittingAttendance"
            :disabled="!selectedStudentId || isSubmittingAttendance"
          >
            {{ $t("Mark Attendance") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="dialogDelete" max-width="500">
      <VCard>
        <VCardTitle class="text-h6">
          {{ $t("Are you sure you want to delete this course?") }}
        </VCardTitle>
        <VCardText>
          {{ $t("This action cannot be undone.") }}
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="dialogDelete = false">
            {{ $t("Cancel") }}
          </VBtn>
          <VBtn color="error" variant="tonal" @click="confirmDelete">
            {{ $t("Delete") }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>
