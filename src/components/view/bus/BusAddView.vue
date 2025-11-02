<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useStudentStore } from "@/stores/student";
import { useBusStore } from "@/stores/bus";
import { mapState } from "pinia";
import { mapActions } from "pinia";
import MapOSM from "@/components/MapOSM.vue";

export default {
  name: "BusAddView",
  components: { Form, Field, MapOSM },
  data() {
    return {
      studentsMap: [],
      isLoadingStudents: false,
      snackbar: false,
      snackbarColor: "success",
      snackbarText: "",
      schema: yup.object({
        driverName: yup
          .string()
          .trim()
          .required("Driver name is required")
          .min(3, "Must be at least 3 characters"),
        carNumber: yup
          .string()
          .trim()
          .required("Car number is required"),
        carModel: yup
          .string()
          .trim()
          .required("Car model is required"),
        startTime: yup
          .string()
          .required("Start time is required")
          .trim()
          .matches(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Invalid time format (HH:MM)"
          ),
        studentIds: yup
          .array()
          .required("Students is required")
          .min(1, "At least one student must be selected"),
        map: yup
          .object()
          .required("Location is required")
          .test("has-coordinates", "Location coordinates are required", (value) => {
            return value && value.lat != null && value.lng != null;
          }),
      }),
    };
  },
  methods: {
    ...mapActions(useStudentStore, ["listStudents"]),
    ...mapActions(useBusStore, ["addBus"]),
    normalizeBusPayload(bus) {
      const lat = bus.map?.lat ?? null;
      const lng = bus.map?.lng ?? null;

      return {
        driverName: bus.driverName.trim(),
        carNumber: bus.carNumber.trim(),
        carModel: bus.carModel.trim(),
        startTime: bus.startTime.trim(),
        startLat: lat,
        startLng: lng,
        studentIds: bus.studentIds,
      };
    },

    async onSubmit(values) {
      try {
        await this.addBus(this.normalizeBusPayload(values));
        this.snackbarText = this.$t("Bus created successfully");
        this.snackbarColor = "success";
        this.snackbar = true;

        setTimeout(() => {
          this.$router.push({
            name: "buses",
            query: { toast: "bus-created" },
          });
        }, 1500);
      } catch (error) {
        this.snackbarText = this.$t("Failed to create bus");
        this.snackbarColor = "error";
        this.snackbar = true;
      }
    },
  },
  async mounted() {
    this.isLoadingStudents = true;
    await this.listStudents();
    this.isLoadingStudents = false;
    this.studentsMap = this.students.map((el) => ({
      label: el.firstName + " " + el.lastName,
      value: el.id,
    }));

    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "bus-created"
          ? t("Bus created successfully")
          : t("Done");

      this.snackbar = true;

      const q = { ...this.$route.query };
      delete q.toast;
      this.$router.replace({ query: q });
    }
  },
  computed: {
    ...mapState(useStudentStore, ["students"]),
  },
};
</script>

<template>
  <VCard>
    <VToolbar density="comfortable" flat>
      <VToolbarTitle class="d-flex align-center">
        <VIcon icon="mdi-bus" class="me-2" />
        {{ $t("Add Bus") }}
      </VToolbarTitle>
      <VSpacer />
      <VBtn
        icon="mdi-arrow-left"
        variant="text"
        @click="$router.back()"
        :title="$t('Back')"
      />
    </VToolbar>
    <VDivider />

    <VCardText>
      <Form
        :validation-schema="schema"
        :initial-values="{ map: null, studentIds: [] }"
        v-slot="{ handleSubmit, meta, isSubmitting }"
      >
        <form @submit.prevent="handleSubmit(onSubmit)">
          <VRow class="mt-2" dense>
            <VCol cols="12" md="6">
              <Field name="driverName" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Driver Name')"
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
              <Field name="carNumber" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Car Number')"
                  prepend-inner-icon="mdi-car"
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
              <Field name="carModel" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Car Model')"
                  prepend-inner-icon="mdi-car-sports"
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
              <Field name="startTime" v-slot="{ field, errorMessage }">
                <VTextField
                  :label="$t('Start Time')"
                  prepend-inner-icon="mdi-clock-outline"
                  placeholder="07:00"
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
              <Field name="studentIds" v-slot="{ field, errorMessage }">
                <VAutocomplete
                  :loading="isLoadingStudents"
                  :label="$t('Students')"
                  multiple
                  :items="studentsMap"
                  item-title="label"
                  item-value="value"
                  prepend-inner-icon="mdi-account-group"
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
              <Field name="map" v-slot="{ field, errorMessage }">
                <div class="text-subtitle-1 text-medium-emphasis mb-2">{{ $t("Start Location") }}</div>
                <MapOSM
                  :model-value="field.value"
                  @update:modelValue="field.onChange"
                  :readonly="false"
                />
                <div v-if="errorMessage" class="text-error text-caption mt-1">
                  {{ errorMessage }}
                </div>
                <div v-if="field.value" class="mt-3 text-medium-emphasis">
                  {{ $t("Lat") }}: <b>{{ field.value?.lat?.toFixed(6) }}</b
                  >, {{ $t("Lng") }}: <b>{{ field.value?.lng?.toFixed(6) }}</b>
                </div>
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

