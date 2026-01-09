<template>
  <v-container class="py-4">
    <VSnackbar
      v-model="snackbar"
      timeout="3000"
      location="top end"
      :color="snackbarColor"
      variant="flat"
      elevation="2"
    >
      <VIcon :icon="snackbarIcon" start class="me-2" />
      {{ snackbarText }}
    </VSnackbar>

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="2" class="overflow-hidden">
          <v-card-title class="d-flex align-center pa-4 bg-primary">
            <VIcon icon="mdi-account-plus" class="me-2" color="white" />
            <span class="text-white">{{ $t("Add Employee") }}</span>
          </v-card-title>
          <VDivider />
          <v-card-text class="pa-6">
            <v-form ref="form" @submit.prevent="submit">
              <v-text-field
                v-model="form.name"
                :label="$t('Name')"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[rules.required]"
                required
              />

              <v-text-field
                v-model="form.email"
                :label="$t('Email')"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[rules.required, rules.email]"
                required
              />

              <v-text-field
                v-model="form.password"
                :label="$t('Password')"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[rules.required, rules.minLength]"
                required
              />

              <v-select
                v-model="form.government_entity_id"
                :items="governmentEntities"
                :label="$t('Government Entity')"
                prepend-inner-icon="mdi-office-building"
                variant="outlined"
                density="comfortable"
                :loading="loadingGovernments"
                :rules="[rules.required]"
                item-title="name"
                item-value="entity_id"
                return-object
                required
              >
                <template #no-data>
                  <div class="pa-4 text-center">
                    <div v-if="loadingGovernments" class="text-body-2">
                      {{ $t("Loading...") }}
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis">
                      {{ $t("No government entities found") }}
                    </div>
                  </div>
                </template>
              </v-select>
            </v-form>
          </v-card-text>
          <VDivider />
          <v-card-actions class="pa-4">
            <VSpacer />
            <VBtn
              variant="text"
              @click="goBack"
              :disabled="loading"
            >
              {{ $t("Cancel") }}
            </VBtn>
            <VBtn
              color="primary"
              variant="flat"
              @click="submit"
              :loading="loading"
              :disabled="loading"
            >
              <VIcon icon="mdi-content-save" start size="20" />
              {{ $t("Save Employee") }}
            </VBtn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "AddEmployeeView",
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        government_entity_id: null,
      },
      governmentEntities: [],
      loadingGovernments: false,
      loading: false,
      showPassword: false,
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      snackbarIcon: "mdi-check-circle",
      rules: {
        required: (value) => !!value || this.$t("This field is required"),
        email: (value) => {
          const pattern =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return pattern.test(value) || this.$t("Invalid email address");
        },
        minLength: (value) =>
          value.length >= 6 || this.$t("Password must be at least 6 characters"),
      },
    };
  },
  mounted() {
    this.fetchGovernmentEntities();
  },
  methods: {
    async fetchGovernmentEntities() {
      this.loadingGovernments = true;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/governments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch government entities");
        }

        const data = await response.json();
        // Handle response structure: { status: true, governments: [...] }
        if (data.governments && Array.isArray(data.governments)) {
          this.governmentEntities = data.governments;
        } else {
          this.governmentEntities = [];
        }
      } catch (error) {
        console.error("Error fetching government entities:", error);
        this.showSnackbar(
          this.$t("Failed to load government entities"),
          "error",
          "mdi-alert-circle"
        );
      } finally {
        this.loadingGovernments = false;
      }
    },

    async submit() {
      // Validate form
      const { valid } = await this.$refs.form.validate();
      if (!valid) {
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        
        // Extract entity_id if government_entity_id is an object
        const governmentEntityId = 
          typeof this.form.government_entity_id === 'object' 
            ? this.form.government_entity_id.entity_id 
            : this.form.government_entity_id;

        const payload = {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          government_entity_id: governmentEntityId,
        };

        const response = await fetch("http://localhost:8000/api/storeEmployee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create employee");
        }

        this.showSnackbar(
          data.message || this.$t("Employee created successfully"),
          "success",
          "mdi-check-circle"
        );

        // Reset form
        this.form = {
          name: "",
          email: "",
          password: "",
          government_entity_id: null,
        };
        this.$refs.form.resetValidation();

        // Optionally redirect after a delay
        setTimeout(() => {
          if (this.$router) {
            this.$router.push({ name: "home" });
          }
        }, 1500);
      } catch (error) {
        console.error("Error creating employee:", error);
        this.showSnackbar(
          error.message || this.$t("Failed to create employee"),
          "error",
          "mdi-alert-circle"
        );
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(message, color = "success", icon = "mdi-check-circle") {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbarIcon = icon;
      this.snackbar = true;
    },

    goBack() {
      if (this.$router) {
        this.$router.push({ name: "home" });
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>

