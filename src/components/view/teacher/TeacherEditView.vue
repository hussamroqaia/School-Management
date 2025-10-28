<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useTeacherStore } from "@/stores/teacher";

export default {
  name: "TeacherEditView",
  components: { Form, Field },
  data() {
    return {
      loading: true,
      teacher: null,
      formKey: 0,
      initialValues: null, // seeded from teacher record
      genders: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
      ],
      specializations: [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Computer Science",
        "English",
        "History",
      ],
      educationLevels: [
        { label: "Diploma", value: "DIPLOMA" },
        { label: "Bachelor", value: "BACHELORS" },
        { label: "Master", value: "MASTERS" },
        { label: "PhD", value: "DOCTORATE" },
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
        email: yup.string().trim().required().email(),
        phone: yup
          .string()
          .trim()
          .required()
          .matches(/^\+?963\d{9}$/, "Invalid phone"),
        yearsOfExperience: yup
          .number()
          .typeError("Enter a number")
          .integer("Whole number only")
          .min(0, "Must be ≥ 0")
          .max(60, "Unrealistic value")
          .required("Experience is required"),
        specialization: yup.string().trim().required("Pick one"),
        gender: yup
          .string()
          .required("Gender is required")
          .oneOf(["MALE", "FEMALE"], "Invalid value"),
        salaryPerSession: yup
          .number()
          .typeError("Enter a valid amount")
          .transform((v, orig) => {
            if (typeof orig === "string") {
              const n = Number(orig.replace(/,/g, "."));
              return Number.isNaN(n) ? v : n;
            }
            return v;
          })
          .required("Salary per session is required")
          .min(0, "Must be ≥ 0")
          .test("max-2-decimals", "Max 2 decimal places", (v) =>
            v == null ? true : Number.isInteger(v * 100)
          ),
        universityDegree: yup
          .string()
          .trim()
          .required("Degree is required")
          .min(2, "Too short"),
        dob: yup
          .string()
          .required("Date of Birth is required")
          .matches(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
          .test("not-future", "Cannot be in the future", (v) => {
            if (!v) return true;
            const d = new Date(v);
            const t = new Date();
            d.setHours(0, 0, 0, 0);
            t.setHours(0, 0, 0, 0);
            return d <= t;
          }),
        educationLevel: yup
          .string()
          .required("Education level is required")
          .oneOf(
            ["DIPLOMA", "BACHELORS", "MASTERS", "DOCTORATE"],
            "Invalid value"
          ),
        // Keep imageUrl optional as a plain string
        imageUrl: yup
          .string()
          .trim()
          .url("Must be a valid URL")
          .nullable()
          .notRequired()
          .transform((v) => (v === "" ? null : v)),
        // notes: no validation
      }),
    };
  },
  async mounted() {
    const store = useTeacherStore();
    // Ensure we have data in the store (adjust if you already have it)
    if (store.list) {
      await store.list();
    }

    const id = Number(this.$route.params.id);
    const found = (store.teachers || []).find((t) => t.id === id);
    this.teacher = found || null;

    if (this.teacher) {
      // Map teacher -> form initial values
      this.initialValues = {
        firstName: this.teacher.firstName || "",
        lastName: this.teacher.lastName || "",
        email: this.teacher.email || "",
        phone: this.teacher.phone || "",
        gender: this.teacher.gender || null,

        yearsOfExperience: this.teacher.yearsOfExperience ?? 0, // not ''
        salaryPerSession: this.teacher.salaryPerSession ?? 0, // not ''

        specialization:
          this.teacher.specialization || this.teacher.subject?.name || null,

        imageUrl: this.teacher.imageUrl || null,
        universityDegree: this.teacher.universityDegree || "",

        // expects YYYY-MM-DD; if empty, form will be invalid until user fills it
        dob:
          (this.teacher.dob || this.teacher.dateOfBirth || "")
            .toString()
            .slice(0, 10) || null,

        educationLevel: this.teacher.educationLevel ?? null,
        notes: this.teacher.notes ?? "",
      };
      this.formKey++;
    }

    this.loading = false;
  },
  methods: {
    async onSubmit(values) {
      const store = useTeacherStore();
      const id = Number(this.$route.params.id);

      const payload = {
        id,
        ...values,
        // normalize
        salaryPerSession: Number(values.salaryPerSession),
        notes: values.notes?.trim() ? values.notes.trim() : null,
        // if your backend uses dateOfBirth instead of dob:
        // dateOfBirth: values.dob,
      };

      if (store.updateTeacher) {
        store.updateTeacher(payload);
      } else {
        // fallback: simple replace if no action exists
        const idx = store.teachers.findIndex((t) => t.id === id);
        if (idx > -1) {
          store.teachers[idx] = {
            ...store.teachers[idx],
            ...payload,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      // navigate back with a toast
      this.$router.push({
        name: "teachers",
        query: { toast: "teacher-updated" },
      });
    },
  },
};
</script>

<template>
  <VContainer class="py-6">
    <!-- Top bar -->
    <VToolbar flat density="comfortable" class="px-0">
      <VBtn
        variant="text"
        @click="$router.back()"
        prepend-icon="mdi-arrow-left"
      >
        Back
      </VBtn>
      <VToolbarTitle class="ms-2">Edit Teacher</VToolbarTitle>
      <VSpacer />
    </VToolbar>

    <VDivider class="my-4" />

    <!-- Loading / not found -->
    <div v-if="loading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>
    <VAlert v-else-if="!teacher" type="warning" variant="tonal">
      Teacher not found.
    </VAlert>

    <!-- Form -->
    <VCard v-else class="pa-4">
      <!-- Force Form to re-mount when data arrives via :key -->
      <Form
        :key="formKey"
        :initial-values="initialValues"
        :validation-schema="schema"
        validate-on-mount
        v-slot="{ handleSubmit, meta, isSubmitting }"
      >
        <form @submit.prevent="handleSubmit(onSubmit)">
          <VRow class="mt-2" dense>
            <!-- firstName -->
            <VCol cols="12" md="6">
              <Field name="firstName" v-slot="{ field, errorMessage }">
                <VTextField
                  label="First Name"
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

            <!-- lastName -->
            <VCol cols="12" md="6">
              <Field name="lastName" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Last Name"
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

            <!-- Email -->
            <VCol cols="12" md="6">
              <Field name="email" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email"
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

            <!-- Phone -->
            <VCol cols="12" md="6">
              <Field name="phone" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Phone"
                  prepend-inner-icon="mdi-phone"
                  placeholder="+963936928788"
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

            <!-- Years of Experience -->
            <VCol cols="12" md="6">
              <Field name="yearsOfExperience" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Experience"
                  prepend-inner-icon="mdi-briefcase"
                  type="number"
                  placeholder="1 or 2 ..."
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

            <!-- Specialization -->
            <VCol cols="12" md="6">
              <Field name="specialization" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  label="Specialization"
                  :items="specializations"
                  prepend-inner-icon="mdi-school"
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

            <!-- Image URL (keep same as your Add form) -->
            <VCol cols="12" md="6">
              <Field name="imageUrl" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Image url"
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
                />
              </Field>
            </VCol>

            <!-- Degree -->
            <VCol cols="12" md="6">
              <Field name="universityDegree" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Degree"
                  prepend-inner-icon="mdi-school-outline"
                  placeholder="e.g. B.Sc. in Mathematics"
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

            <!-- Date of Birth -->
            <VCol cols="12" md="6">
              <Field name="dob" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Date of Birth"
                  type="date"
                  prepend-inner-icon="mdi-cake-variant"
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

            <!-- Salary / Session -->
            <VCol cols="12" md="6">
              <Field name="salaryPerSession" v-slot="{ field, errorMessage }">
                <VTextField
                  label="Salary / Session"
                  prepend-inner-icon="mdi-cash-multiple"
                  type="number"
                  inputmode="decimal"
                  step="0.01"
                  placeholder="e.g. 22.00"
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

            <!-- Education Level -->
            <VCol cols="12" md="6">
              <Field name="educationLevel" v-slot="{ field, errorMessage }">
                <VSelect
                  label="Education Level"
                  :items="educationLevels"
                  item-title="label"
                  item-value="value"
                  prepend-inner-icon="mdi-school"
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

            <!-- Gender -->
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

            <!-- Notes (optional) -->
            <VCol cols="12">
              <Field name="notes" v-slot="{ field }">
                <VTextarea
                  label="Notes"
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

          <!-- Actions -->
          <div class="d-flex justify-end ga-3 mt-6">
            <VBtn
              type="submit"
              color="primary"
              :disabled="isSubmitting || meta.pending || !meta.valid"
              :loading="isSubmitting"
            >
              <VIcon icon="mdi-content-save" size="18" class="me-2" />
              Save Changes
            </VBtn>
          </div>
        </form>
      </Form>
    </VCard>
  </VContainer>
</template>
