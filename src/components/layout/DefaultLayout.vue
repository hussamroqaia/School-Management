<template>
  <v-app id="inspire">
    <SideBar v-model="drawer" />

    <TheHeader @drawer="toggleDrawer" />

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script>
import TheHeader from "./TheHeader.vue";
import SideBar from "./SideBar.vue";

export default {
  components: {
    TheHeader,
    SideBar,
  },
  data() {
    return {
      drawer: true,
      show: true,
    };
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
  },
};
</script>

