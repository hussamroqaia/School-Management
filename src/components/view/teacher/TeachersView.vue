<script>
import { mapState, mapActions } from "pinia";
import { useTeacherStore } from "@/stores/teacher";

export default {
  name: "TeachersView",
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      selectedTeacher: null,
      snackbarColor: "success",
      activatorProps: null,
    };
  },
  computed: {
    ...mapState(useTeacherStore, [
      "teachers",
      "isLoading",
      "itemsPerPage",
      "totalCount",
    ]),
    headers() {
      return [
        { title: this.$t("Name"), key: "name" },
        { title: this.$t("Email"), key: "email" },
        { title: this.$t("Phone"), key: "phone" },
        { title: this.$t("education"), key: "educationLevel" },
        { title: this.$t("Experience"), key: "yearsOfExperience" },
        {
          title: this.$t("Specialization"),
          key: "specialization",
        },
        {
          title: this.$t("Action"),
          key: "actions",
          sortable: false,
          align: "end",
          width: 140,
        },
      ];
    },
  },
  async mounted() {
    await this.listTeachers();

    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "email-dublicated"
          ? t("Email is reserved")
          : toast === "teacher-created"
          ? t("Teacher added successfully")
          : t("Done") || "Done";
      this.snackbar = true;
      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
  methods: {
    ...mapActions(useTeacherStore, ["deleteTeacher", "listTeachers"]),
    close() {
      this.dialog = false;
    },
    openEdit(row) {
      this.selectedTeacher = row;
      this.dialogEdit = true;
    },
    closeEditForm() {
      this.dialogEdit = false;
      this.selectedTeacher = null;
    },
    saveEdit(payload) {
      // Call store directly to avoid the "useStore(...)[key] is not a function" error
      const store = useTeacherStore();
      store.updateTeacher(payload); // payload must include { id, ...fields }
      this.closeEditForm();
    },
    async onDelete(id) {
      // console.log(id);

      try {
        await this.deleteTeacher(id);

        this.snackbarText = this.$t?.("Teacher deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;

        await this.listTeachers();
      } catch (e) {
        console.error(e);
        this.snackbarText =
          this.$t?.("Failed to delete teacher") || "Failed to delete teacher";
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
  },
};
</script>

<template>
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

  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn
          to="teachers/add"
          class="text-none font-weight-regular"
          prepend-icon="mdi-plus"
          :text="$t('Add Teacher')"
          variant="tonal"
          v-bind="activatorProps"
        />
      </v-col>
    </v-row>

    <!-- List -->
    <v-card class="mt-4">
      <v-data-table
        :items="teachers"
        :headers="headers"
        :loading="isLoading"
        item-value="id"
        v-model:items-per-page="itemsPerPage"
        :items-length="totalCount"
      >
        <template #item.name="{ item, value }">
          <v-list-item
            class="font-weight-bold text-h6 d-flex justify-start pl-0"
            :prepend-avatar="item.imageUrl"
          >
            <RouterLink
              :to="`/teachers/` + item.id"
              class="text-decoration-none"
            >
              {{ item.firstName }} {{ item.lastName }}
            </RouterLink>
          </v-list-item>
        </template>

        <template #item.specialization="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="primary">
              {{ item.subject.name }}
            </v-chip>
          </div>
        </template>

        <template #item.yearsOfExperience="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="cyan-accent-4">
              {{ item.yearsOfExperience }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              icon="mdi-delete"
              @click="onDelete(item.id)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
