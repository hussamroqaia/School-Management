<template>
  <VContainer class="py-6">
    <VToolbar flat density="comfortable" class="px-0">
      <VToolbarTitle>
        <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
        {{ $t("Courses") }}</VToolbarTitle
      >
      
      <VBtn
        color="primary"
        prepend-icon="mdi-plus"
        :to="{ name: 'CourseAddForm' }"
      >
        {{ $t("Add Course") }}
      </VBtn>
    </VToolbar>

    <VCard>
      <VDataTable
        :items="courses"
        :headers="headers"
        item-key="id"
        :loading="isLoading"
        class="courses-table"
      >
        <template #item.title="{ item }">
          <div class="font-weight-medium">{{ item.title }}</div>
        </template>

        <template #item.teacher="{ item }">
          <div v-if="item.teacher">
            {{ item.teacher.firstName + " " + item.teacher.lastName }}
          </div>
          <div v-else>-</div>
        </template>

        <template #item.classRoom="{ item }">
          <div>{{ item.classRoom.title }}</div>
        </template>

        <template #item.studentsCount="{ item }">
          <VChip size="small" variant="tonal" color="primary">
            {{ item.students.length }}
          </VChip>
        </template>

        <template #item.sessionsCount="{ item }">
          <VChip size="small" variant="tonal" color="secondary">
            {{ item.courseSessions.length }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-eye"
              :to="`/courses/` + item.id"
            />
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-pencil"
              :to="{ name: 'course-edit', params: { id: item.id } }"
            />
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              icon="mdi-delete"
              @click="openDeleteDialog(item.id)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-center">
            {{ $t ? $t("No courses found") : "No courses found" }}
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VSnackbar
      v-model="snackbar"
      timeout="2500"
      location="top end"
      color="success"
      variant="flat"
      elevation="2"
      :color="snackbarColor"
    >
      <VIcon icon="mdi-check-circle" start class="me-2" />
      {{ snackbarText }}
    </VSnackbar>

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

<script>
import { mapState, mapActions } from "pinia";
import { useCourseStore } from "@/stores/course";

export default {
  name: "CoursesView",

  data() {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      dialogDelete: false,
      itemToDelete: null,
    };
  },

  computed: {
    ...mapState(useCourseStore, ["courses", "isLoading"]),

    headers() {
      return [
        { title: this.$t("Title"), key: "title" },

        {
          title: this.$t("Teacher"),
          key: "teacher",
          width: 240,
        },
        {
          title: this.$t("ClassRoom"),
          key: "classRoom",
          width: 180,
        },
        {
          title: this.$t("Students"),
          key: "studentsCount",
          width: 120,
        },
        {
          title: this.$t("Sessions"),
          key: "sessionsCount",
          width: 120,
        },
        {
          title: this.$t("Actions"),
          key: "actions",
          sortable: false,
          align: "end",
          width: 160,
        },
      ];
    },
  },

  methods: {
    ...mapActions(useCourseStore, ["listCourses", "deleteCourse"]),

    openDeleteDialog(id) {
      this.itemToDelete = id;
      this.dialogDelete = true;
    },
    async confirmDelete() {
      if (!this.itemToDelete) return;
      try {
        await this.deleteCourse(this.itemToDelete);
        await this.listCourses();

        this.snackbarText = this.$t("Course deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Failed to delete course");
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.dialogDelete = false;
        this.itemToDelete = null;
      }
    },
  },

  async mounted() {
    try {
      await this.listCourses();
    } catch (e) {
      console.error("Failed to load courses:", e);
    }
    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "course-created"
          ? t("Course added successfully")
          : toast === "course-updated"
          ? t("Course updated successfully")
          : t("Done") || "Done";
      this.snackbar = true;
      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
};
</script>
