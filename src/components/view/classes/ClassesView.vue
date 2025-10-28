<template>
  <VSnackbar
    v-model="snackbar"
    timeout="1500"
    location="top end"
    :color="snackbarColor"
    variant="flat"
    elevation="2"
  >
    <VIcon icon="mdi-check-circle" start class="me-2" />
    {{ snackbarText }}
  </VSnackbar>

  <VContainer class="py-6">
    <VToolbar flat density="comfortable" class="px-0">
      <VToolbarTitle>{{ $t("Classes") }}</VToolbarTitle>

      <VTextField
        v-model="search"
        :label="$t('Search class')"
        prepend-inner-icon="mdi-magnify"
        class="mr-3"
        clearable
        hide-details="auto"
        density="comfortable"
        variant="outlined"
        style="max-width: 280px"
      />
      <VBtn color="primary" prepend-icon="mdi-plus" @click="openAdd">
        {{ $t("Add Class") }}
      </VBtn>
    </VToolbar>

    <VCard>
      <VDataTable
        :items="filteredClasses"
        :headers="headers"
        :loading="isLoading"
        item-key="id"
        show-expand
        class="classes-table"
      >
        <template #item.title="{ item }">
          <RouterLink
            :to="{ name: 'class-view', params: { id: item.id } }"
            class="text-decoration-none font-weight-medium"
          >
            {{ item.title }}
          </RouterLink>
        </template>

        <template #item.hasProjector="{ item }">
          <VChip
            :color="item.hasProjector ? 'success' : 'grey'"
            size="small"
            variant="tonal"
            :prepend-icon="
              item.hasProjector ? 'mdi-projector' : 'mdi-close-circle-outline'
            "
          >
            {{ item.hasProjector ? $t("Yes") : $t("No") }}
          </VChip>
        </template>

        <template #item.studentsCount="{ item }">
          <VChip color="primary" variant="tonal" size="small">
            <VIcon start icon="mdi-account-group" />
            {{ getStudentsFor(item).length }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <VBtn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-pencil"
              @click="openEdit(item)"
            />
            <VBtn
              size="small"
              variant="tonal"
              color="error"
              icon="mdi-delete"
              @click="onDelete(item.id)"
            />
          </div>
        </template>

        <template #expanded-row="{ columns, item }">
          <td :colspan="columns.length" class="pa-4">
            <div class="text-subtitle-1 mb-3">
              {{ $t("Students in") }} <b>{{ item.title }}</b>
            </div>

            <div v-if="getStudentsFor(item).length">
              <VList density="comfortable" class="rounded border">
                <VListItem
                  v-for="s in getStudentsFor(item)"
                  :key="s.id"
                  :title="`${s.firstName}  ${s.lastName}`"
                  :subtitle="s.email"
                >
                  <template #prepend>
                    <VAvatar size="28">
                      <VImg :src="s.imageUrl" />
                    </VAvatar>
                  </template>
                  <template #append>
                    <RouterLink
                      :to="`/students/${s.id}`"
                      class="text-decoration-none"
                    >
                      <VBtn
                        size="small"
                        variant="text"
                        prepend-icon="mdi-open-in-new"
                      >
                        {{ $t("Open") }}
                      </VBtn>
                    </RouterLink>
                  </template>
                </VListItem>
              </VList>
            </div>
            <VAlert v-else type="info" variant="tonal" density="comfortable">
              {{ $t("No students in this class") }}
            </VAlert>
          </td>
        </template>

        <template #no-data>
          <div class="py-8 text-medium-emphasis">
            {{ $t("No classes found") }}
          </div>
        </template>
      </VDataTable>
    </VCard>
  </VContainer>

  <VDialog v-model="dialogOpen" max-width="560">
    <VCard>
      <VToolbar flat density="comfortable">
        <VToolbarTitle class="ms-2">
          <VIcon
            :icon="formMode === 'add' ? 'mdi-plus' : 'mdi-pencil'"
            class="me-2"
          />
          {{ formMode === "add" ? $t("Add Class") : $t("Edit Class") }}
        </VToolbarTitle>
      </VToolbar>
      <VDivider />

      <VCardText>
        <Form
          :validation-schema="schema"
          :initial-values="initialValues"
          :key="formKey"
          validate-on-mount
          v-slot="{ handleSubmit, meta, isSubmitting }"
        >
          <form @submit.prevent="handleSubmit(onSubmit)">
            <VRow dense>
              <VCol cols="12">
                <Field name="title" v-slot="{ field, errorMessage }">
                  <VTextField
                    :label="$t('Title')"
                    prepend-inner-icon="mdi-form-textbox"
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

              <VCol cols="12" md="6">
                <Field name="level" v-slot="{ field, errorMessage }">
                  <VTextField
                    :label="$t('Level')"
                    prepend-inner-icon="mdi-layers"
                    placeholder="e.g. Grade 10"
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

              <VCol cols="12" md="6">
                <Field name="capacity" v-slot="{ field, errorMessage }">
                  <VTextField
                    :label="$t('Capacity')"
                    prepend-inner-icon="mdi-account-multiple"
                    type="number"
                    min="1"
                    step="1"
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
                <Field name="hasProjector" v-slot="{ field }">
                  <VSwitch
                    inset
                    :label="$t('Has projector')"
                    :model-value="field.value"
                    @update:modelValue="field.onChange"
                  />
                </Field>
              </VCol>
            </VRow>

            <div class="d-flex justify-end ga-2 mt-6">
              <VBtn variant="tonal" @click="closeDialog">
                {{ $t("Cancel") }}
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :disabled="isSubmitting || meta.pending || !meta.valid"
                :loading="isSubmitting"
              >
                <VIcon icon="mdi-content-save" start />
                {{ $t("Save") }}
              </VBtn>
            </div>
          </form>
        </Form>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { Form, Field } from "vee-validate";
import * as yup from "yup";

import { useClassStore } from "@/stores/class";
import { useStudentStore } from "@/stores/student";

export default {
  name: "ClassesView",
  components: { Form, Field },

  data() {
    return {
      search: "",
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",

      dialogOpen: false,
      formMode: "add",
      formKey: 0,
      editingId: null,
      initialValues: {
        title: "",
        level: "",
        capacity: 30,
        hasProjector: false,
      },

      schema: yup.object({
        title: yup
          .string()
          .trim()
          .required("Title is required")
          .min(2, "Too short"),
        level: yup.string().trim().nullable().notRequired(),
        capacity: yup
          .number()
          .typeError("Enter a number")
          .integer("Whole number only")
          .min(1, "Must be ≥ 1")
          .required("Capacity is required"),
        hasProjector: yup.boolean().required(),
      }),
    };
  },

  computed: {
    ...mapState(useClassStore, ["classes", "isLoading"]),
    ...mapState(useStudentStore, ["students"]),

    headers() {
      return [
        { title: this.$t("Title"), key: "title" },
        { title: this.$t("Level"), key: "level", width: 150 },
        {
          title: this.$t("Capacity"),
          key: "capacity",
          width: 120,
        },
        {
          title: this.$t("Projector"),
          key: "hasProjector",
          width: 140,
        },
        {
          title: this.$t("Students"),
          key: "studentsCount",
          width: 130,
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

    filteredClasses() {
      const q = this.search.trim().toLowerCase();
      return this.classes
        .map((c) => ({
          ...c,
          level: c.level ?? "",
          capacity: c.capacity ?? 0,
        }))
        .filter((c) => {
          return q ? (c.title || "").toLowerCase().includes(q) : true;
        });
    },

    // If you already have route 'class-view' registered, set true
    hasClassView() {
      return this.$routerhasRoute("class-view");
    },
  },

  async mounted() {
    this.isLoading = true;
    await this.listClasses();
    this.isLoading = false;

    await this.listStudents();
  },

  methods: {
    ...mapActions(useClassStore, {
      listClasses: "list",
      addClass: "addClass",
      updateClass: "updateClass",
      deleteClass: "deleteClass",
    }),
    ...mapActions(useStudentStore, { listStudents: "list" }),

    getStudentsFor(clas) {
      const title = clas.title.toLowerCase();
      return this.students.filter((s) => s.class.toLowerCase() === title);
    },

    openAdd() {
      this.formMode = "add";
      this.editingId = null;
      this.initialValues = {
        title: "",
        level: "",
        capacity: 30,
        hasProjector: false,
      };
      this.formKey++;
      this.dialogOpen = true;
    },

    openEdit(row) {
      this.formMode = "edit";
      this.editingId = row.id;
      this.initialValues = {
        title: row.title,
        level: row.level,
        capacity: row.capacity,
        hasProjector: row.hasProjector,
      };
      this.formKey++;
      this.dialogOpen = true;
    },

    closeDialog() {
      this.dialogOpen = false;
      this.editingId = null;
    },

    async onSubmit(values) {
      try {
        if (this.formMode === "add") {
          await this.addClass({
            ...values,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // organizationId: ... set when you have auth/org context
          });
          this.snackbarText = this.$t("Class added successfully");
        } else {
          await this.updateClass({
            id: this.editingId,
            ...values,
            updatedAt: new Date().toISOString(),
          });
          this.snackbarText = this.$t("Class updated successfully");
        }
        this.snackbarColor = "success";
        this.snackbar = true;
        this.closeDialog();
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Something went wrong");
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },

    async onDelete(id) {
      try {
        await this.deleteClass(id);
        this.snackbarText = this.$t("Class deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Failed to delete class");
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
  },
};
</script>
