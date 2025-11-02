<template>
  <VContainer class="py-6">
    <VToolbar flat>
      <VBtn icon="mdi-arrow-left" @click="$router.back()" />
      <VToolbarTitle>Class Details</VToolbarTitle>
    </VToolbar>

    <div v-if="isLoading">
      <VSkeletonLoader type="list-item-avatar-two-line" class="mb-3" />
      <VSkeletonLoader type="list-item-three-line" />
    </div>
    <VCard v-else class="">
      <VCardTitle>{{ classRoom.title }}</VCardTitle>
      <VCardText>
        <p>
          <strong>Projector:</strong>
          <VChip
            :color="classRoom.hasProjector ? 'success' : 'grey'"
            size="small"
          >
            {{ classRoom.hasProjector ? "Yes" : "No" }}
          </VChip>
        </p>

        <p><strong>Organization ID:</strong> {{ classRoom.organizationId }}</p>
        <p>
          <strong>Created At:</strong> {{ formatDate(classRoom.createdAt) }}
        </p>
        <p>
          <strong>Updated At:</strong> {{ formatDate(classRoom.updatedAt) }}
        </p>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useClassStore } from "@/stores/class";

export default {
  name: "ClassDetails",

  data() {
    return {};
  },

  computed: {
    ...mapState(useClassStore, ["classes", "classRoom", "isLoading"]),
  },

  async beforeMount() {
    const id = Number(this.$route.params.id);
    await this.getClass(id);
  },

  methods: {
    ...mapActions(useClassStore, ["getClass"]),

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString();
    },
  },
};
</script>
