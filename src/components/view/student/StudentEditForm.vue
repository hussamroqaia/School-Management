<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { mapState, mapActions } from "pinia";
import { useStudentStore } from "@/stores/student";
import MapOSM from "@/components/MapOSM.vue";

export default {
  name: "TeacherAddForm",
  components: { Form, Field },
  data() {
    return {
      formKey: 0,
      location: null,
      initialValues: null,
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
  computed: {
    ...mapState(useStudentStore, ["student", "isLoading"]),
  },
  methods: {
    ...mapActions(useStudentStore, ["getStudent", "updateStudent"]),
    normalizeStudentPayload(std) {
      const lat = this.location?.lat ?? null;
      const lng = this.location?.lng ?? null;

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

    async onSubmit(values) {
      const id = Number(this.$route.params.id);
      const payload = this.normalizeStudentPayload(values);
      await this.updateStudent(payload, id);

      this.$router.push({
        name: "students",
        query: { toast: "student-updated" },
      });
    },
  },
  async mounted() {
    this.loading = true;
    const id = Number(this.$route.params.id);
    await this.getStudent(id);

    if (this.student) {
      this.initialValues = {
        firstName: this.student.firstName,
        lastName: this.student.lastName,
        gender: this.student.gender,
        imageUrl: this.student.imageUrl ?? null,
        dob: (this.student.bod ?? "").toString().slice(0, 10) ?? null,

        notes: this.student.notes ?? "",
      };
      this.formKey++;
    }

    if (this.student?.lat != null && this.student?.lng != null) {
      this.location = {
        lat: Number(this.student.lat),
        lng: Number(this.student.lng),
      };
    }

    this.loading = false;
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-pencil" class="me-2" />
        {{ $t("Student Edit") }}
      </VToolbarTitle>
    </VToolbar>
    <VDivider />

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <VCardText v-else-if="student">
      <Form
        :validation-schema="schema"
        :initial-values="initialValues"
        :key="formKey"
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
          </VRow>
          <div class="text-subtitle-1 text-medium-emphasis mb-2">Location</div>

          <div>
            <MapOSM v-model="location" />
            <div class="mt-3 text-medium-emphasis">
              Lat: <b>{{ location?.lat?.toFixed(6) }}</b
              >, Lng: <b>{{ location?.lng?.toFixed(6) }}</b>
              <VBtn
                class="ms-2"
                size="small"
                variant="text"
                :href="`https://www.google.com/maps?q=${location?.lat},${location?.lng}`"
                target="_blank"
                prepend-icon="mdi-map"
              >
                Open in Maps
              </VBtn>
            </div>
          </div>

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

    <VAlert v-else type="warning" variant="tonal"> student not found. </VAlert>
  </VCard>
</template>
