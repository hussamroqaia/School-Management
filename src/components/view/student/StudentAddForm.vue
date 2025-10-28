<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useStudentStore } from "@/stores/student";
import { mapActions } from "pinia";

import MapPage from "@/components/view/MapPage.vue";

export default {
  name: "TeacherAddForm",
  components: { Form, Field },
  data() {
    return {
      genders: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
      ],
      schema: yup.object({
        firstName: yup
          .string()
          .trim()
          .required()
          .min(3, "Must be at least 3 characters"),
        lastName: yup
          .string()
          .trim()
          .required()
          .min(3, "Must be at least 3 characters"),
        gender: yup
          .string()
          .required("Gender is required")
          .oneOf(["MALE", "FEMALE"], "Invalid value"),
      }),
    };
  },
  methods: {
    ...mapActions(useStudentStore, ["addStudents"]),
    normalizeStudentPayload(std) {
      const lat = std.map?.lat ?? null;
      const lng = std.map?.lng ?? null;

      return {
        firstName: std.firstName.trim(),
        lastName: std.lastName.trim(),
        bod: std.dob ? new Date(std.dob).toISOString() : null,
        notes: std.notes?.trim() ? std.notes.trim() : null,
        lng: lng,
        lat: lat,
        imageUrl: std.imageUrl?.trim() ? std.imageUrl.trim() : null,
        gender: std.gender,
      };
    },

    onSubmit(values) {
      this.addStudents(this.normalizeStudentPayload(values));
      this.$router.push({
        name: "students",
        query: { toast: "student-created" },
      });
    },
  },
  mounted() {
    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "teacher-created"
          ? t("Teacher added successfully")
          : toast === "teacher-updated"
          ? t("Teacher updated successfully")
          : toast === "teacher-deleted"
          ? t("Teacher deleted successfully")
          : t("Done") || "Done";

      this.snackbar = true;

      // clear the query so refresh doesn’t retrigger
      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-account-plus" class="me-2" />
        {{ $t("Add Student") }}
      </VToolbarTitle>
    </VToolbar>
    <VDivider />

    <VCardText>
      <Form
        :validation-schema="schema"
        :initial-values="{ map: null }"
        v-slot="{ handleSubmit, meta, isSubmitting }"
      >
        <form @submit.prevent="handleSubmit(onSubmit)">
          <VRow class="mt-2" dense>
            <VCol cols="12" md="6">
              <Field name="firstName" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('First Name')"
                  prepend-inner-icon="mdi-account"
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
              <Field name="lastName" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Last Name')"
                  prepend-inner-icon="mdi-account"
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
              <Field name="imageUrl" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Image url')"
                  prepend-inner-icon="mdi-image"
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  @blur="field.onBlur"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  clearable
                  :menu-props="{ maxHeight: 260 }"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field name="dob" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Date of Birth')"
                  prepend-inner-icon="mdi-cake-variant"
                  type="date"
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  @blur="field.onBlur"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </Field>
            </VCol>

            <VCol cols="12" md="6">
              <Field name="gender" v-slot="{ field, errorMessage }">
                <VSelect
                  :label="$t('Gender') || 'Gender'"
                  :items="genders"
                  item-title="label"
                  item-value="value"
                  prepend-inner-icon="mdi-gender-male-female"
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  @blur="field.onBlur"
                  :error="!!errorMessage"
                  :error-messages="errorMessage"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  clearable
                  :menu-props="{ maxHeight: 260 }"
                />
              </Field>
            </VCol>

            <VCol cols="12">
              <Field name="notes" v-slot="{ field }">
                <VTextarea
                  :label="$t('Notes') || 'Notes'"
                  prepend-inner-icon="mdi-note-text-outline"
                  auto-grow
                  rows="3"
                  counter="200"
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  @blur="field.onBlur"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </Field>
            </VCol>

            <Field name="map" v-slot="{ field, errorMessage }">
              <MapPage
                :model-value="field.value"
                @update:modelValue="field.onChange"
              />
              <div v-if="errorMessage" class="text-error text-caption mt-1">
                {{ errorMessage }}
              </div>
            </Field>
          </VRow>

          <div class="d-flex justify-end ga-3 mt-6">
            <VBtn
              type="submit"
              color="primary"
              :disabled="!meta.valid || isSubmitting"
              :loading="isSubmitting"
            >
              <VIcon icon="mdi-check" size="18" class="me-2" />
              {{ $t("Save") }}
            </VBtn>
          </div>
        </form>
      </Form>
    </VCardText>
  </VCard>
</template>
