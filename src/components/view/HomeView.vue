<script>
import { mapState, mapActions } from "pinia";
import { useStudentStore } from "@/stores/student";
import { useTeacherStore } from "@/stores/teacher";

export default {
  name: "GroupItems",
  data() {
    return {
      selectedGroup: "Transactions",
    };
  },
  computed: {
    currentItems() {
      const tx = [
        {
          id: 1,
          title: "House & Bills",
          value: 40,
          color: "rgba(var(--v-theme-on-surface), .2)",
          pattern: "url(#pattern-0)",
        },
        {
          id: 2,
          title: "Transportation",
          value: 25,
          color: "rgba(255, 151, 215, .4)",
        },
        {
          id: 3,
          title: "Entertainment",
          value: 20,
          color: "rgba(255, 151, 215, .6)",
        },
        { id: 4, title: "Food", value: 10, color: "rgba(255, 151, 215, .8)" },
        { id: 5, title: "Other", value: 5, color: "rgba(255, 151, 215, 1)" },
      ].map((it) => ({ ...it, label: it.title }));

      const other = [
        { id: 1, title: "OSS Donations", value: 37, color: "#767119" },
        { id: 2, title: "Travel", value: 22, color: "#9e850d" },
        { id: 3, title: "Investment", value: 20, color: "#cb9700" },
        { id: 4, title: "Books", value: 11, color: "#ffa600" },
      ].map((it) => ({ ...it, label: it.title }));

      return this.selectedGroup === "Transactions" ? tx : other;
    },
    ...mapState(useStudentStore, ["totalCount"]),
    ...mapState(useTeacherStore, ["totalTeacherCount"]),
  },
  async mounted() {
    this.isLoading = true;
    await this.list();
    await this.listTeaches();

    this.isLoading = false;
  },
  methods: {
    ...mapActions(useStudentStore, ["list"]),
    ...mapActions(useTeacherStore, ["listTeachers"]),
  },
};
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" class="pa-4">
          <v-icon :size="32" class="float-right">mdi-account-group</v-icon>
          <div class="text-h5">{{ totalCount }}</div>
          <div class="text-subtitle-1">
            {{ $t("Total") }} {{ $t("Students") }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" class="pa-4">
          <v-icon :size="32" class="float-right">mdi-account-group</v-icon>
          <div class="text-h5">{{ totalTeacherCount }}</div>
          <div class="text-subtitle-1">
            {{ $t("Total") }} {{ $t("Teachers") }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" class="pa-4">
          <v-icon :size="32" class="float-right">mdi-account-group</v-icon>
          <div class="text-h5">5</div>
          <div class="text-subtitle-1">
            {{ $t("Total") }} {{ $t("Classes") }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" class="pa-4">
          <v-icon :size="32" class="float-right">mdi-account-group</v-icon>
          <div class="text-h5">7</div>
          <div class="text-subtitle-1">
            {{ $t("Total") }} {{ $t("Courses") }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex my-6 justify-center">
      <v-card class="pa-6" elevation="6" rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-truncate mr-6">Expenses</div>
          <v-select
            v-model="selectedGroup"
            :items="['Transactions', 'Other']"
            density="compact"
            max-width="200"
            variant="solo-filled"
            flat
            hide-details
            single-line
          />
        </v-card-title>

        <!-- ✅ Use VPieChart (Labs) instead of v-pie -->
        <VPieChart
          :key="selectedGroup"
          :items="currentItems"
          :legend="{ position: $vuetify.display.mdAndUp ? 'right' : 'bottom' }"
          :tooltip="{ subtitleFormat: '[value]%' }"
          class="pa-3 mt-3 justify-center"
          gap="2"
          inner-cut="70"
          item-key="id"
          rounded="2"
          size="300"
          animation
          hide-slice
          reveal
        >
          <template #center>
            <div class="text-center">
              <div class="text-h3">130</div>
              <div class="opacity-70 mt-1 mb-n1">Total</div>
            </div>
          </template>

          <template #legend="{ items, toggle, isActive }">
            <v-list
              class="py-0 mb-n5 mb-md-0 bg-transparent"
              density="compact"
              width="300"
            >
              <v-list-item
                v-for="item in items"
                :key="item.key"
                :class="['my-1', { 'opacity-40': !isActive(item) }]"
                :title="item.title"
                rounded="lg"
                link
                @click="toggle(item)"
              >
                <template #prepend>
                  <v-avatar :color="item.color" :size="16" />
                </template>
                <template #append>
                  <div class="font-weight-bold">{{ item.value }}%</div>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </VPieChart>
      </v-card>
    </div>

    <div class="h-0">
      <svg height="0" width="0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="pattern-0"
            height="20"
            width="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(145) scale(.2)"
          >
            <path
              d="M0 10h20zm0 20h20zm0 20h20zm0 20h20z"
              fill="none"
              stroke="rgb(var(--v-theme-surface))"
              stroke-width="3"
            />
          </pattern>
        </defs>
      </svg>
    </div>
  </v-container>
</template>
