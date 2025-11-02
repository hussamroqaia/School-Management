<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useStudentStore } from "@/stores/student";
import { useTeacherStore } from "@/stores/teacher";
import { useClassStore } from "@/stores/class";
import { useCourseStore } from "@/stores/course";
import { mapState } from "pinia";
import { mapActions } from "pinia";

export default {
  name: "TeacherAddForm",
  components: { Form, Field },
  data() {
    return {
      teachersMap: [],
      classesMap: [],
      StudentsMap: [],

      isLoadingClasses: false,
      isLoadingStudents: false,

      startDate: null,
      endDate: null,

      snackbar: false,
      snackbarColor: "success",
      snackbarText: "",

      daysOfWeek: [
        { label: "Sunday", value: "Sunday" },
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
      ],

      schema: yup.object({
        studentIds: yup.array().required("Students is required"),
        classRoomId: yup.number().required("ClassRoom students is required"),
        teacherId: yup.number().required("Teacher is required"),
        startTime: yup
          .string()
          .required("Start Time is required")
          .trim()
          .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Invalid time format (HH:MM)"
          ),
        endTime: yup
          .string()
          .trim()

          .required("End Time is required")
          .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Invalid time format (HH:MM)"
          ),

        days: yup
          .array()
          .of(
            yup
              .string()
              .oneOf(
                [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                "Invalid day"
              )
          )
          .min(1, "At least one day must be selected")
          .required("Days is required"),
        endDate: yup.string().required("End Date is required"),
        startDate: yup.string().required("Start Date is required"),

        title: yup.string().required("Title is required").trim(),
      }),
    };
  },
  methods: {
    ...mapActions(useStudentStore, ["listStudents"]),
    ...mapActions(useTeacherStore, ["listTeachers"]),
    ...mapActions(useClassStore, ["listClasses"]),
    ...mapActions(useCourseStore, ["addCourse"]),
    normalizeCoursePayload(cors) {
      return {
        ...cors,
        startDate: new Date(cors.startDate).toISOString(),
        endDate: new Date(cors.startDate).toISOString(),
      };
    },

    async onSubmit(values) {
      console.log(this.normalizeCoursePayload(values));

      await this.addCourse(this.normalizeCoursePayload(values));

      this.snackbarText = this.$t("Course created successfully");
      this.snackbarColor = "success";
      this.snackbar = true;

      setTimeout(() => {
        this.$router.push({
          name: "courses",
          query: { toast: "course-created" },
        });
      }, 1500);
    },
  },
  async mounted() {
    await this.listTeachers();
    this.teachersMap = this.teachers.map((el) => ({
      label: el.firstName + " " + el.lastName,
      value: el.id,
    }));
    this.isLoadingClasses = true;
    await this.listClasses();
    this.isLoadingClasses = false;
    this.classesMap = this.classes.map((el) => ({
      label: el.title,
      value: el.id,
    }));

    this.isLoadingStudents = true;
    await this.listStudents();
    this.isLoadingStudents = false;
    this.StudentsMap = this.students.map((el) => ({
      label: el.firstName + " " + el.lastName,
      value: el.id,
    }));

    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "course-created"
          ? t("Teacher added successfully")
          : t("Done");

      this.snackbar = true;

      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
  computed: {
    ...mapState(useTeacherStore, ["isLoading", "teachers"]),
    ...mapState(useClassStore, ["classes"]),
    ...mapState(useStudentStore, ["students"]),
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-account-plus" class="me-2" />
        {{ $t("Add Course") }}
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
            <VCol cols="12" md="6">
              <Field name="title" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Title')"
                  placeholder="example: Advanced Mathematics"
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
              <Field name="startDate" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Start Date')"
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
              <Field name="endDate" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('End Date')"
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
              <Field name="days" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :label="$t('Days')"
                  :items="daysOfWeek"
                  multiple
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

            <VCol cols="12" md="6">
              <Field name="startTime" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Start Time')"
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  placeholder="09:00"
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
              <Field name="endTime" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('End Time')"
                  :model-value="field.value"
                  placeholder="11:00"
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
              <Field name="teacherId" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :loading="isLoading"
                  :label="$t('Teacher')"
                  :items="teachersMap"
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

            <VCol cols="12" md="6">
              <Field name="classRoomId" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :loading="isLoadingClasses"
                  :label="$t('ClassRoom')"
                  :items="classesMap"
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

            <VCol cols="12" md="6">
              <Field name="studentIds" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :loading="isLoadingStudents"
                  :label="$t('Students')"
                  multiple
                  :items="StudentsMap"
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

  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    timeout="1500"
    location="bottom right"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>
