<template>
  <v-container>
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title>Login</v-card-title>

        <v-card-text>
          <v-text-field
            autocomplete
            v-model="email"
            placeholder="Email"
          ></v-text-field>
          <v-text-field
            autocomplete
            v-model="password"
            placeholder="Password"
            type="password"
          ></v-text-field>
        </v-card-text>

        <v-card-action>
          <v-btn type="submit" :loading>Submit</v-btn>
        </v-card-action>
      </v-card>
    </v-form>
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
