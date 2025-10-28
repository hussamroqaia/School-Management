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

<!-- <template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense nav>
        <v-list-item class="mb-2">
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              School Manager
            </v-list-item-title>
            <v-list-item-subtitle> Admin Dashboard </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Dashboard Overview</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card color="success" dark elevation="10" class="pa-4">
              <v-icon large class="float-right">mdi-account-group</v-icon>
              <div class="text-h5">2500</div>
              <div class="text-subtitle-1">Total Students</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card color="info" dark elevation="10" class="pa-4">
              <v-icon large class="float-right">mdi-briefcase</v-icon>
              <div class="text-h5">120</div>
              <div class="text-subtitle-1">Total Staff</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card color="warning" dark elevation="10" class="pa-4">
              <v-icon large class="float-right">mdi-calendar-check</v-icon>
              <div class="text-h5">5</div>
              <div class="text-subtitle-1">Upcoming Events</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card color="error" dark elevation="10" class="pa-4">
              <v-icon large class="float-right">mdi-cash-multiple</v-icon>
              <div class="text-h5">$15k</div>
              <div class="text-subtitle-1">Pending Fees</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12" md="8">
            <v-card elevation="5" class="pa-4">
              <v-card-title>Recent Admissions</v-card-title>
              <v-data-table
                :headers="recentHeaders"
                :items="recentItems"
                :items-per-page="5"
                class="elevation-1"
              ></v-data-table>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card elevation="5" class="pa-4">
              <v-card-title>Fee Status Chart</v-card-title>
              <p>
                *(Placeholder for a chart library like Chart.js/ApexCharts
                integrated into a card)*
              </p>
              <v-progress-circular
                :size="100"
                :width="15"
                :value="75"
                color="primary"
                class="mx-auto d-block mt-3"
                >75% Paid</v-progress-circular
              >
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "SchoolDashboard",
  data: () => ({
    drawer: true, // Controls the sidebar visibility
    menuItems: [
      { title: "Dashboard", icon: "mdi-view-dashboard", route: "/" },
      { title: "Students", icon: "mdi-account-group", route: "/students" },
      { title: "Teachers", icon: "mdi-human-male-board", route: "/teachers" },
      { title: "Classes", icon: "mdi-book-multiple", route: "/classes" },
      { title: "Fees & Finance", icon: "mdi-cash-multiple", route: "/finance" },
      { title: "Settings", icon: "mdi-cog", route: "/settings" },
    ],
    recentHeaders: [
      { text: "Name", value: "name" },
      { text: "Class", value: "class" },
      { text: "Date", value: "date" },
    ],
    recentItems: [
      { name: "John Doe", class: "Grade 10", date: "2025-10-14" },
      { name: "Jane Smith", class: "Grade 5", date: "2025-10-13" },
      { name: "A. Black", class: "Grade 8", date: "2025-10-12" },
    ],
  }),
};
</script>

<style scoped>
/* Any specific component styling can go here */
</style> -->
