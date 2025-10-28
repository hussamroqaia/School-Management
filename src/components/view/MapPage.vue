<template>
  <VRow class="mt-4">
    <VCol cols="12" md="7">
      <MapOSM
        :model-value="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </VCol>

    <VCol cols="12" md="5">
      <VCard class="pa-4">
        <div class="text-subtitle-1 mb-2">Selected location</div>
        <div v-if="modelValue">
          Lat: {{ modelValue.lat }}, Lng: {{ modelValue.lng }}
        </div>
        <div v-else class="text-medium-emphasis">
          No pin yet — click the map.
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<script>
import MapOSM from "@/components/MapOSM.vue";

export default {
  name: "MapPage",
  components: { MapOSM },
  data() {
    return {
      picked: null,
    };
  },
  props: {
    modelValue: { type: Object, default: null },
  },
  emits: ["update:modelValue"],
};
</script>
