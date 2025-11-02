<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100vh">
    <v-card class="w-100" max-width="450" elevation="4">
      <v-card-title class="text-h5 d-flex align-center justify-center pa-6">
        <VIcon icon="mdi-lock" size="32" class="me-2" />
        {{ $t("Login") }}
      </v-card-title>
      <VDivider />
      <v-card-text class="pa-6">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="email"
            :label="$t('Email')"
            type="email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            autocomplete="email"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :label="$t('Password')"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            autocomplete="current-password"
            required
          ></v-text-field>

          <v-card-actions class="pa-0">
            <v-btn 
              type="submit" 
              color="primary" 
              size="large"
              block
              :loading="loading"
              :disabled="loading"
            >
              <VIcon icon="mdi-login" size="20" class="me-2" />
              {{ $t("Submit") }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { mapActions } from "pinia";

export default {
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      showPassword: false,
    };
  },

  methods: {
    ...mapActions(useAuthStore, ["login"]),

    async submit() {
      this.loading = true;
      console.log(this.email);
      console.log(this.password);

      await this.login(this.email, this.password);
      this.loading = false;
    },
  },
};
</script>
