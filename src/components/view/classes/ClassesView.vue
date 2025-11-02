<script>
import { mapState, mapActions } from "pinia";
import { Form, Field } from "vee-validate";
import * as yup from "yup";

import { useClassStore } from "@/stores/class";

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
      dialogDelete: false,
      itemToDelete: null,
      initialValues: {
        title: "",
        hasProjector: false,
      },

      schema: yup.object({
        title: yup
          .string()
          .trim()
          .required("Title is required")
          .min(2, "Too short"),
      }),
    };
  },

  computed: {
    ...mapState(useClassStore, ["classes", "isLoading"]),

    filteredClasses() {
      if (!this.search || this.search.trim() === "") {
        return this.classes;
      }
      const searchTerm = this.search.toLowerCase().trim();
      return this.classes.filter((clas) =>
        clas.title.toLowerCase().includes(searchTerm)
      );
    },

    headers() {
      return [
        { title: this.$t("Title"), key: "title", width: 200 },
        {
          title: this.$t("Projector"),
          key: "hasProjector",

          width: 800,
        },
        {
          title: this.$t("Action"),
          key: "actions",
          sortable: false,
          align: "center",
          width: 40,
        },
      ];
    },
  },

  async mounted() {
    await this.listClasses();
  },

  methods: {
    ...mapActions(useClassStore, [
      "listClasses",
      "addClass",
      "updateClass",
      "deleteClass",
    ]),

    openAdd() {
      this.formMode = "add";
      this.editingId = null;
      this.initialValues = {
        title: "",
        hasProjector: false,
      };
      this.formKey++;
      this.dialogOpen = true;
    },

    openEdit(clas) {
      this.formMode = "edit";
      this.editingId = clas.id;
      this.initialValues = {
        title: clas.title,
        hasProjector: clas.hasProjector,
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
          await this.addClass(values);
          await this.listClasses();

          this.snackbarText = this.$t("Class added successfully");
        } else {
          await this.updateClass(values, this.editingId);
          await this.listClasses();

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

    openDeleteDialog(id) {
      this.itemToDelete = id;
      this.dialogDelete = true;
    },
    async confirmDelete() {
      if (!this.itemToDelete) return;
      try {
        await this.deleteClass(this.itemToDelete);
        await this.listClasses();

        this.snackbarText = this.$t("Class deleted successfully");
        this.snackbarColor = "success";
        this.snackbar = true;
      } catch (e) {
        console.error(e);
        this.snackbarText = this.$t("Failed to delete class");
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
        class="classes-table"
      >
        <template #item.title="{ item }">
          <div class="text-decoration-none font-weight-medium">
            {{ item.title }}
          </div>
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

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              icon="mdi-eye"
              :to="{ name: 'class-view', params: { id: item.id } }"
            />
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
              @click="openDeleteDialog(item.id)"
            />
          </div>
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
                :disabled="isSubmitting"
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

  <VDialog v-model="dialogDelete" max-width="500">
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t("Are you sure you want to delete this class?") }}
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
