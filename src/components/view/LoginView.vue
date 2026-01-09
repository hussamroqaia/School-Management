<template>
  <v-container
    class="d-flex align-center justify-center login-container"
    style="min-height: 100vh"
  >
    <v-card class="w-100 login-card" max-width="500" elevation="12">
      <div class="login-header pa-6">
        <div class="login-icon-wrapper mb-4">
          <div class="government-badge">
            <VIcon icon="mdi-office-building" size="48" color="white" />
          </div>
        </div>
        <v-card-title class="text-h4 d-flex align-center justify-center pa-0 mb-2 font-weight-bold">
          {{ $t("Government Complaints") }}
        </v-card-title>
        <div class="text-center text-body-2 login-subtitle mb-1">
          {{ $t("Official Portal") }}
        </div>
        <VDivider class="my-3" />
        <div class="text-center text-h6 pa-0 mt-3">
          {{ $t("Sign In") }}
        </div>
        <div class="text-center text-body-2 login-subtitle mt-1">
          {{ $t("Access your account to manage complaints") }}
        </div>
      </div>
      <VDivider />
      <v-card-text class="pa-6">
        <VAlert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = null"
        >
          <VIcon icon="mdi-alert-circle" start />
          {{ error }}
        </VAlert>
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
            :error="!!error"
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
            class="mb-6"
            autocomplete="current-password"
            :error="!!error"
            required
          ></v-text-field>

          <v-card-actions class="pa-0 mt-4">
            <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              :loading="loading"
              :disabled="loading"
              class="login-button"
              elevation="3"
            >
              <VIcon icon="mdi-login" size="24" class="me-2" />
              <span class="text-h6 font-weight-bold">{{ $t("Sign In") }}</span>
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
      <VDivider />
      <v-card-text class="pa-4 text-center">
        <div class="text-caption text-medium-emphasis">
          {{ $t("Secure access to government complaint management system") }}
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { mapActions } from "pinia";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      showPassword: false,
      error: null,
    };
  },

  methods: {
    ...mapActions(useAuthStore, ["login"]),

    async submit() {
      this.loading = true;
      this.error = null;

      try {
        await this.login(this.email, this.password);
        // Only set loading to false if login succeeds (redirect will happen)
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = error.message || "Login failed. Please check your credentials and try again.";
        console.error("Login error:", error);
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-card {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%);
  text-align: center;
  color: white;
  position: relative;
}

.login-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.login-icon-wrapper {
  display: flex;
  justify-content: center;
}

.government-badge {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.3);
  position: relative;
  transition: transform 0.3s ease;
}

.government-badge::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.government-badge:hover {
  transform: scale(1.05);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.6;
}

.login-button {
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.4);
}

:deep(.v-text-field) {
  border-radius: 8px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field__outline) {
  border-width: 2px;
}

:deep(.v-field--focused .v-field__outline) {
  border-width: 2px;
}

@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(20, 25, 35, 0.98);
  }
  
  .login-header {
    background: linear-gradient(135deg, rgba(30, 60, 114, 0.98) 0%, rgba(42, 82, 152, 0.98) 100%);
  }
  
  .login-subtitle {
    color: rgba(255, 255, 255, 0.95);
  }
}
</style>
