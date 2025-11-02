<script>
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { useStudentStore } from "@/stores/student";
import { useBusStore } from "@/stores/bus";
import { mapState, mapActions } from "pinia";
import MapOSM from "@/components/MapOSM.vue";

export default {
  name: "BusEditView",
  components: { Form, Field, MapOSM },
  data() {
    return {
      formKey: 0,
      location: null,
      initialValues: null,
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
      }),
    };
  },
  computed: {
    ...mapState(useBusStore, ["bus", "isLoading"]),
    ...mapState(useStudentStore, ["students"]),
  },
  methods: {
    ...mapActions(useStudentStore, ["listStudents"]),
    ...mapActions(useBusStore, ["getBus", "updateBus"]),
    normalizeBusPayload(bus) {
      const lat = this.location?.lat ?? null;
      const lng = this.location?.lng ?? null;

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
        const id = Number(this.$route.params.id);
        const payload = this.normalizeBusPayload(values);
        await this.updateBus(payload, id);

        this.snackbarText = this.$t("Bus updated successfully");
        this.snackbarColor = "success";
        this.snackbar = true;

        setTimeout(() => {
          this.$router.push({
            name: "buses",
            query: { toast: "bus-updated" },
          });
        }, 1500);
      } catch (error) {
        this.snackbarText = this.$t("Failed to update bus");
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

    const id = Number(this.$route.params.id);
    await this.getBus(id);

    if (this.bus && this.bus.id) {
      this.initialValues = {
        driverName: this.bus.driverName || "",
        carNumber: this.bus.carNumber || "",
        carModel: this.bus.carModel || "",
        startTime: this.bus.startTime || "",
        studentIds: this.bus.students
          ? this.bus.students.map((s) => s.studentId)
          : [],
      };
      this.formKey++;

      if (this.bus.startLat != null && this.bus.startLng != null) {
        this.location = {
          lat: Number(this.bus.startLat),
          lng: Number(this.bus.startLng),
        };
      }
    }

    const { toast } = this.$route.query || {};
    if (toast) {
      const t = this.$t?.bind?.(this) || ((s) => s);
      this.snackbarText =
        toast === "bus-updated"
          ? t("Bus updated successfully")
          : t("Done");

      this.snackbar = true;

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
        <VIcon icon="mdi-pencil" class="me-2" />
        {{ $t("Edit Bus") }}
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

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>

    <VCardText v-else-if="bus && bus.id">
      <Form
        :validation-schema="schema"
        :initial-values="initialValues"
        :key="formKey"
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
          </VRow>

          <div class="text-subtitle-1 text-medium-emphasis mb-2 mt-4">
            {{ $t("Start Location") }}
          </div>

          <div>
            <MapOSM v-model="location" :readonly="false" />
            <div v-if="location" class="mt-3 text-medium-emphasis">
              {{ $t("Lat") }}: <b>{{ location?.lat?.toFixed(6) }}</b
              >, {{ $t("Lng") }}: <b>{{ location?.lng?.toFixed(6) }}</b>
              <VBtn
                v-if="location?.lat && location?.lng"
                class="ms-2"
                size="small"
                variant="text"
                :href="`https://www.google.com/maps?q=${location.lat},${location.lng}`"
                target="_blank"
                prepend-icon="mdi-map"
              >
                {{ $t("Open in Maps") }}
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

    <VAlert v-else type="warning" variant="tonal">
      {{ $t("Bus not found") }}
    </VAlert>
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

