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
      dialogDelete: false,
      itemToDelete: null,
    };
  },
  computed: {
    ...mapState(useTeacherStore, ["teachers", "isLoading"]),
    headers() {
      return [
        { title: this.$t("Name"), key: "name" },
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
          : toast === "teacher-updated"
          ? t("Teacher updated successfully")
          : t("Done") || "Done";
      this.snackbar = true;
      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
  methods: {
    ...mapActions(useTeacherStore, ["deleteTeacher", "listTeachers"]),
    initials(teacher) {
      if (teacher.firstName && teacher.lastName) {
        return (
          (teacher.firstName?.[0] || "") + (teacher.lastName?.[0] || "")
        ).toUpperCase();
      }
      return (teacher.name?.[0] || "?").toUpperCase();
    },
    avatarColor(teacher) {
      if (teacher.gender) {
        return teacher.gender === "FEMALE" ? "pink" : "blue";
      }
      return "primary";
    },
    openDeleteDialog(id) {
      this.itemToDelete = id;
      this.dialogDelete = true;
    },
    async confirmDelete() {
      if (!this.itemToDelete) return;
      try {
        await this.deleteTeacher(this.itemToDelete);
        this.snackbarText = this.$t("Teacher deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
        await this.listTeachers();
      } catch (e) {
        console.error(e);
        const errorMessage = e?.message || this.$t("Failed to delete teacher");
        this.snackbarText = errorMessage;
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
    <VIcon 
      :icon="snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle'" 
      start 
      class="me-2" 
    />
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

    <v-card class="mt-4">
      <v-data-table
        :items="teachers"
        :headers="headers"
        :loading="isLoading"
        item-value="id"
      >
        <template #item.name="{ item, value }">
          <v-list-item
            class="font-weight-bold text-h6 d-flex justify-start pl-0"
          >
            <template #prepend>
              <VAvatar :color="avatarColor(item)" size="40" class="me-3">
                <VImg
                  :src="item.imageUrl"
                  v-if="item.imageUrl"
                  :alt="
                    item.firstName && item.lastName
                      ? `${item.firstName} ${item.lastName}`
                      : ''
                  "
                />
                <span v-else class="text-body-1 font-weight-bold">
                  {{ initials(item) }}
                </span>
              </VAvatar>
            </template>
            <template #default>
              {{ item.firstName }} {{ item.lastName }}
            </template>
          </v-list-item>
        </template>

        <template #item.specialization="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="primary" prepend-icon="mdi-book-open-variant">
              {{ item.subject.name }}
            </v-chip>
          </div>
        </template>

        <template #item.yearsOfExperience="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="cyan-accent-4" prepend-icon="mdi-briefcase">
              {{ item.yearsOfExperience ? item.yearsOfExperience : "_" }}
            </v-chip>
          </div>
        </template>

        <template #item.educationLevel="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="cyan-accent-4" prepend-icon="mdi-school">
              {{ item.educationLevel ? item.educationLevel : "_" }}
            </v-chip>
          </div>
        </template>

        <template #item.phone="{ item, value }">
          <div class="d-flex ga-2">
            <v-chip color="cyan-accent-4" prepend-icon="mdi-phone">
              {{ item.phone ? item.phone : "_" }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-eye"
              :to="`/teachers/` + item.id"
            />

            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-pencil"
              :to="{ name: 'teacher-edit', params: { id: item.id } }"
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
      </v-data-table>
    </v-card>
  </v-container>

  <VDialog v-model="dialogDelete" max-width="500">
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t("Are you sure you want to delete this teacher?") }}
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
