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
      dialogDelete: false,
      itemToDelete: null,
    };
  },

  computed: {
    ...mapState(useStudentStore, ["students", "isLoading"]),

    headers() {
      return [
        { title: this.$t("Name"), key: "name" },
        { title: this.$t("Gender"), key: "gender" },
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
    openDeleteDialog(id) {
      this.itemToDelete = id;
      this.dialogDelete = true;
    },
    async confirmDelete() {
      if (!this.itemToDelete) return;
      try {
        await this.deleteStudent(this.itemToDelete);
        await this.listStudents();

        this.snackbarText = this.$t("Student deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Failed to delete student");
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.dialogDelete = false;
        this.itemToDelete = null;
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
    :color="snackbarColor"
    variant="flat"
    elevation="2"
  >
    <VIcon icon="mdi-check-circle" start class="me-2" />
    {{ snackbarText }}
  </VSnackbar>

  <v-container>
    <v-row class="align-end justify-space-between">
      <v-col cols="12" md="auto">
        <v-text-field
          v-model="search"
          :label="$t('Search by name')"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details="auto"
          variant="outlined"
          density="comfortable"
          style="min-width: 300px"
        />
      </v-col>

      <v-col cols="12" md="auto" class="d-flex justify-end ga-2">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          to="students/studentAddForm"
          class="text-none"
        >
          {{ $t("Add Student") }}
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
          >
            <template #prepend>
              <VAvatar :color="avatarColor(item.gender)" size="40" class="me-3">
                <VImg
                  :src="item.imageUrl"
                  v-if="item.imageUrl"
                  :alt="
                    item.firstName && item.lastName
                      ? `${item.firstName} ${item.lastName}`
                      : item.name
                  "
                />
                <span v-else class="text-body-1 font-weight-bold">
                  {{ initials(item) }}
                </span>
              </VAvatar>
            </template>
            <template #default>
              {{
                item.firstName && item.lastName
                  ? `${item.firstName} ${item.lastName}`
                  : item.name
              }}
            </template>
          </v-list-item>
        </template>

        <template #item.gender="{ item }">
          <div class="d-flex ga-2">
            <VChip
              size="small"
              variant="tonal"
              :color="avatarColor(item.gender)"
            >
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
              icon="mdi-eye"
              :to="`/students/` + item.id"
            />
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
              @click="openDeleteDialog(item.id)"
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

  <VDialog v-model="dialogDelete" max-width="500">
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t("Are you sure you want to delete this student?") }}
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
</template>
