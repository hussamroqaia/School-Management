<template>
  <v-navigation-drawer v-model="open" app>
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        subtitle="Ali_a88@gmailcom"
        :title="$t('Manager')"
      />
    </v-list>

    <v-divider />

    <v-list density="compact" nav>
      <VListGroup value="ad_mgmt" expand-icon="tabler-chevron-down">
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            prepend-icon="mdi-file"
            :title="$t('Dashboard')"
            to="/"
          />
        </template>

        <VListItem
          prepend-icon="tabler-bolt"
          :title="$t('Students')"
          to="students"
        />
        <VListItem
          prepend-icon="tabler-shield-check"
          :title="$t('Teachers')"
          to="teachers"
        />
        <VListItem
          prepend-icon="tabler-star"
          :title="$t('Classes')"
          to="classes"
        />
        <VListItem
          prepend-icon="tabler-snowflake"
          :title="$t('Courses')"
          to="courses"
        />
      </VListGroup>
    </v-list>
  </v-navigation-drawer>
</template>
<script>
export default {
  props: {
    drawer: Boolean,
  },
  data() {
    return {
      open: this.drawer,
      opened: ["ad_mgmt"],
    };
  },
};
</script>
