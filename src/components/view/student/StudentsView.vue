<script>
import { mapState, mapActions } from "pinia";
import { useStudentStore } from "@/stores/student";

export default {
  name: "StudentsView",

  data() {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",

      selectedStudent: null,
      dialogEdit: false,

      search: "",
      selectedClass: "ALL",
    };
  },

  computed: {
    ...mapState(useStudentStore, ["students", "isLoading"]),

    headers() {
      return [
        { title: this.$t("Name"), key: "name" },
        { title: this.$t("Gender"), key: "gender" },
        // { title: this.$t("Class"), key: "class" },
        {
          title: this.$t("Action"),
          key: "actions",
          sortable: false,
          align: "end",
          width: 140,
        },
      ];
    },

    classOptions() {
      const set = new Set(this.students.map((s) => s.class).filter(Boolean));
      return ["ALL", ...Array.from(set)];
    },

    filteredStudents() {
      const q = this.search.trim().toLowerCase();
      const selected = this.selectedClass;

      return (this.students || []).filter((s) => {
        const fullName =
          s.firstName && s.lastName
            ? `${s.firstName} ${s.lastName}`.toLowerCase()
            : (s.name || "").toLowerCase();

        const inSearch = q ? fullName.includes(q) : true;
        const classVal = s.class || s.className || s.classroom || null;
        const inClass = selected === "ALL" ? true : classVal === selected;

        return inSearch && inClass;
      });
    },
  },

  async mounted() {
    await this.listStudents();

    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "student-created"
          ? t("Student added successfully")
          : toast === "student-updated"
          ? t("Student updated successfully")
          : toast === "student-deleted"
          ? t("Student deleted successfully")
          : t("Done");
      this.snackbarColor = toast === "student-deleted" ? "success" : "success";
      this.snackbar = true;

      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },

  methods: {
    ...mapActions(useStudentStore, ["deleteStudent", "listStudents"]),
    genderIcon(gender) {
      return gender === "FEMALE" ? "mdi-gender-female" : "mdi-gender-male";
    },
    async onDelete(id) {
      try {
        await this.deleteStudent(id);
        await this.listStudents();

        this.snackbarText = this.$t("Student deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Failed to delete student");
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
    resetFilters() {
      this.search = "";
      this.selectedClass = "ALL";
    },
  },
};
</script>

<template>
  <VSnackbar
    v-model="snackbar"
    timeout="2500"
    location="top end"
    :color="snackbarColor"
    variant="flat"
    elevation="2"
  >
    <VIcon icon="mdi-check-circle" start class="me-2" />
    {{ snackbarText }}
  </VSnackbar>

  <v-container>
    <v-row class="align-end">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          :label="$t('Search by name')"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="selectedClass"
          :items="classOptions"
          :label="$t('Class')"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
        />
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-end ga-2">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          to="students/studentAddForm"
          class="text-none"
        >
          {{ $t("Add Student") }}
        </v-btn>

        <v-btn
          variant="tonal"
          prepend-icon="mdi-filter-remove"
          @click="resetFilters"
        >
          {{ $t("Reset") }}
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-data-table
        :items="filteredStudents"
        :headers="headers"
        :loading="isLoading"
        item-value="id"
        :items-length="filteredStudents.length"
      >
        <template #item.name="{ item }">
          <v-list-item
            class="font-weight-bold text-h6 d-flex justify-start pl-0"
            :prepend-avatar="item.imageUrl"
            :to="`/students/` + item.id"
          >
            {{
              item.firstName && item.lastName
                ? `${item.firstName} ${item.lastName}`
                : item.name
            }}
          </v-list-item>
        </template>

        <!-- <template #item.class="{ item }">
          <div class="d-flex ga-2">
            <v-chip color="primary" variant="tonal" size="small">
              {{ item.class || "—" }}
            </v-chip>
          </div>
        </template> -->

        <template #item.gender="{ item }">
          <div class="d-flex ga-2">
            <VChip size="small" variant="tonal">
              <VIcon :icon="genderIcon(item.gender)" start size="18" />
              {{ item.gender }}
            </VChip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-pencil"
              :to="{ name: 'StudentEditForm', params: { id: item.id } }"
            />
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              icon="mdi-delete"
              @click="onDelete(item.id)"
            />
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">
            {{ $t("No students match your filters") }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
