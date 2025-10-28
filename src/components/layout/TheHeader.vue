<template>
  <v-app-bar>
    <v-app-bar-nav-icon @click="$emit('drawer', !drawer)"></v-app-bar-nav-icon>

    <v-app-bar-title>{{ $t("Application") }}</v-app-bar-title>
    <div class="pa-4 text-center"></div>
  </v-app-bar>
</template>

<script>
export default {
  props: ["drawer"],
  data() {
    return {
      // dialog: false,
    };
  },
};
</script>
