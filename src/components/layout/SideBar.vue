<template>
  <v-navigation-drawer v-model="open" app>
    <v-list>
      <v-list-item
        :prepend-avatar="
          user?.imageUrl || 'https://randomuser.me/api/portraits/men/85.jpg'
        "
        :subtitle="user?.email || ''"
        :title="user?.name || $t('Manager')"
      />
    </v-list>

    <v-divider />

    <v-list density="compact" nav>
      <VListItem
        prepend-icon="mdi-view-dashboard"
        :title="$t('Dashboard')"
        :to="{ name: 'home' }"
      />

      <template v-if="isOrganization">
        <VListItem
          prepend-icon="mdi-account-group"
          :title="$t('Students')"
          :to="{ name: 'students' }"
        />
        <VListItem
          prepend-icon="mdi-account-tie"
          :title="$t('Teachers')"
          :to="{ name: 'teachers' }"
        />
        <VListItem
          prepend-icon="mdi-google-classroom"
          :title="$t('Classes')"
          :to="{ name: 'classes' }"
        />
        <VListItem
          prepend-icon="mdi-book-open-page-variant"
          :title="$t('Courses')"
          :to="{ name: 'courses' }"
        />
        <VListItem
          prepend-icon="mdi-bus"
          :title="$t('Buses')"
          :to="{ name: 'buses' }"
        />
      </template>

      <VListItem
        v-if="isTeacher"
        prepend-icon="mdi-account-tie"
        :title="$t('Teachers')"
        :to="{ name: 'teachers' }"
      />
    </v-list>
  </v-navigation-drawer>
</template>
<script>
import { useAuthStore } from "@/stores/auth";
import { mapState } from "pinia";

export default {
  props: {
    drawer: Boolean,
  },
  data() {
    return {
      open: this.drawer,
      opened: ["ad_mgmt"],
      authStore: useAuthStore(),
    };
  },
  computed: {
    ...mapState(useAuthStore, ["user"]),
    isOrganization() {
      return this.authStore.isOrganization;
    },
    isTeacher() {
      return this.authStore.isTeacher;
    },
  },
  watch: {
    drawer(newVal) {
      this.open = newVal;
    },
  },
};
</script>
