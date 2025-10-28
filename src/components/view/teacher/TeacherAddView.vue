<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useTeacherStore } from "@/stores/teacher";
import { useSubjectStore } from "@/stores/subject";
import { mapActions } from "pinia";
import { mapState } from "pinia";

export default {
  name: "TeacherAddForm",
  components: { Form, Field },
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      genders: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
      ],
      educationLevels: [
        // { label: "Diploma", value: "DIPLOMA" },
        { label: "Bachelors", value: "BACHELORS" },
        { label: "Master", value: "MASTERS" },
        // { label: "Phd", value: "PHD" },
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
        password: yup
          .string()
          .required("Password is required")
          .min(8, "Must be at least 8 characters")
          .matches(/[A-Z]/, "Must contain at least one uppercase letter")
          .matches(/[a-z]/, "Must contain at least one lowercase letter")
          .matches(/[0-9]/, "Must contain at least one number"),

        email: yup.string().trim().required().email(),
        salaryPerSession: yup
          .number()
          .required()
          .typeError("Enter a number")
          .min(0, "Must be ≥ 0"),
        subjectId: yup.string().trim().required("Pick one"),
        gender: yup
          .string()
          .required("Gender is required")
          .oneOf(["MALE", "FEMALE"], "Invalid value"),
      }),
    };
  },
  methods: {
    ...mapActions(useSubjectStore, ["listSubjects"]),
    ...mapActions(useTeacherStore, ["addTeacher"]),
    normalizeTeacherPayload(tech) {
      return {
        firstName: tech.firstName.trim(),
        lastName: tech.lastName.trim(),
        gender: tech.gender,
        bod: tech.bod ? new Date(tech.bod).toISOString() : null,
        notes: tech.notes?.trim() ? tech.notes.trim() : null,
        imageUrl: tech.imageUrl?.trim() ? tech.imageUrl.trim() : null,
        email: tech.email.trim(),
        password: tech.password,
        subjectId: tech.subjectId,
        phone: tech.phone.trim(),
        educationLevel: tech.educationLevel?.trim(),
        universityDegree: tech.universityDegree.trim(),
        salaryPerSession: Number(tech.salaryPerSession),
        yearsOfExperience: Number(tech.yearsOfExperience),
        isActive: tech.isActive,
      };
    },
    async onSubmit(values) {
      // console.log(this.normalizeTeacherPayload(values));

      try {
        const result = await this.addTeacher(
          this.normalizeTeacherPayload(values)
        );

        if (result?.conflict) {
          this.snackbarText = this.$t("Email is already registered");
          this.snackbarColor = "error";
          this.snackbar = true;
          return;
        }

        if (result?.success) {
          this.snackbarText = this.$t("Teacher created successfully");
          this.snackbarColor = "success";
          this.snackbar = true;

          setTimeout(() => {
            this.$router.push({
              name: "teachers",
              query: { toast: "teacher-created" },
            });
          }, 1500);
        } else {
          this.snackbarText = this.$t(
            "Something went wrong. Please try again."
          );
          this.snackbarColor = "error";
          this.snackbar = true;
        }
      } catch (error) {
        console.error("Error submitting teacher:", error);
        this.snackbarText = this.$t("An unexpected error occurred");
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
  },
  computed: {
    ...mapState(useSubjectStore, ["subjects", "isLoadingSubjects"]),
    ...mapState(useTeacherStore, ["isLoading", "conflict"]),
  },
  async mounted() {
    await this.listSubjects();
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-account-plus" class="me-2" />
        {{ $t("Add Teacher") }}
      </VToolbarTitle>
    </VToolbar>
    <VDivider />

    <VCardText>
      <Form
        :validation-schema="schema"
        v-slot="{ handleSubmit, meta, isSubmitting }"
      >
        <form @submit.prevent="handleSubmit(onSubmit)">
          <VRow class="mt-2" dense>
            <!-- firstName -->
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

            <!-- lastName -->
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

            <!-- Email -->
            <VCol cols="12" md="6">
              <Field name="email" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Email')"
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

            <!-- password -->
            <VCol cols="12" md="6">
              <Field name="password" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Password')"
                  type="password"
                  prepend-inner-icon="mdi-eye"
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
                  :label="$t('Phone')"
                  prepend-inner-icon="mdi-phone"
                  placeholder="0936928788"
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

            <!-- yearsOfExperience -->
            <VCol cols="12" md="6">
              <Field name="yearsOfExperience" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Experience')"
                  prepend-inner-icon="mdi-briefcase"
                  placeholder="0 or 1 or 2 ..."
                  type="number"
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

            <!-- subjectId -->
            <VCol cols="12" md="6">
              <Field name="subjectId" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :loading="isLoadingSubjects"
                  :label="$t('Subject Categorys')"
                  :items="subjects"
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

            <!-- imageUrl -->
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

            <!-- Degree -->
            <VCol cols="12" md="6">
              <Field name="universityDegree" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('University Degree')"
                  prepend-inner-icon="mdi-school-outline"
                  placeholder="e.g. Bachelor of Science in Mathematic"
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
              <Field name="bod" v-slot="{ field, errorMessage }">
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

            <!-- Salary / Session -->
            <VCol cols="12" md="6">
              <Field name="salaryPerSession" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Salary / Session')"
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
                  :label="$t('Education Level')"
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
                  :label="$t('Gender')"
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

            <!-- isActive -->
            <VCol cols="12" md="6">
              <Field name="isActive" v-slot="{ field, form }">
                <VSwitch
                  inset
                  color="success"
                  :label="$t('Is Active')"
                  :model-value="field.value ?? true"
                  @update:modelValue="
                    (val) => {
                      field.onChange(val);
                      form.setFieldValue('isActive', val);
                    }
                  "
                />
              </Field>
            </VCol>

            <!-- notes -->
            <VCol cols="12">
              <Field name="notes" v-slot="{ field }">
                <VTextarea
                  :label="$t('Notes')"
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
  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="3000"
    location="bottom right"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>
