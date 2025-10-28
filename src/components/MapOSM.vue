<template>
  <VCard class="pa-0">
    <VToolbar density="comfortable" flat>
      <VTextField
        v-model="searchText"
        :loading="searching"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search places, streets, cities…"
        clearable
        hide-details
        @keydown.enter.prevent="triggerSearch"
        class="flex-grow-1"
      />
      <VBtn
        class="ml-2"
        variant="tonal"
        :loading="locating"
        prepend-icon="mdi-map-marker"
        @click="locateMe"
      >
        Locate me
      </VBtn>
    </VToolbar>

    <VList
      v-if="searchResults.length"
      density="compact"
      class="mx-4 my-2"
      lines="two"
      max-height="240"
      style="overflow: auto"
    >
      <VListItem
        v-for="r in searchResults"
        :key="r.displayName + r.lat + r.lon"
        @click="goTo(r)"
        prepend-icon="tabler-map-pin"
      >
        <VListItemTitle>{{ r.displayName }}</VListItemTitle>
        <VListItemSubtitle>
          {{ r.lat.toFixed(5) }}, {{ r.lon.toFixed(5) }}
        </VListItemSubtitle>
      </VListItem>
    </VList>

    <div style="height: 520px">
      <l-map
        :zoom="zoom"
        :center="center"
        style="height: 100%; width: 100%"
        @click="onMapClick"
      >
        <l-tile-layer :url="tileUrl" :attribution="tileAttribution" />

        <l-marker
          v-if="marker"
          :lat-lng="marker"
          :draggable="true"
          @dragend="onDragEnd"
        >
          <l-popup>
            <div class="text-body-2">
              <b>Lat:</b> {{ marker.lat?.toFixed(6) }}<br />
              <b>Lng:</b> {{ marker.lng?.toFixed(6) }}
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </VCard>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";

export default {
  name: "MapOSM",
  components: { LMap, LTileLayer, LMarker, LPopup },

  props: {
    modelValue: { type: Object, default: null },
  },
  emits: ["update:modelValue"],

  data() {
    return {
      zoom: 3,
      center: {
        lat: 20,
        lng: 0,
      },
      marker: this.modelValue || null,

      tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileAttribution: "&copy; OpenStreetMap contributors",

      searchText: "",
      searching: false,
      searchResults: [],
      locating: false,

      _debounceId: null,
      _aborter: null,
    };
  },

  watch: {
    modelValue(newVal) {
      this.marker = newVal || null;
      if (newVal) this.center = newVal;
    },
    searchText(q) {
      clearTimeout(this._debounceId);
      this._debounceId = setTimeout(() => this.search(q), 350);
    },
  },

  methods: {
    async search(q) {
      const query = (q || "").trim();
      if (!query) {
        this.searchResults = [];
        return;
      }

      if (this._aborter) this._aborter.abort();
      this._aborter = new AbortController();

      this.searching = true;
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?" +
          new URLSearchParams({
            format: "json",
            q: query,
            addressdetails: "1",
            limit: "8",
          }).toString();

        const res = await fetch(url, {
          signal: this._aborter.signal,
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        this.searchResults = (data || []).map((d) => ({
          displayName: d.display_name,
          lat: Number(d.lat),
          lon: Number(d.lon),
        }));
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      } finally {
        this.searching = false;
      }
    },

    triggerSearch() {
      this.search(this.searchText);
    },

    goTo(r) {
      this.center = { lat: r.lat, lng: r.lon };
      this.marker = this.center;
      this.zoom = 15;
      this.searchText = r.displayName;
      this.searchResults = [];
      this.$emit("update:modelValue", this.marker);
    },

    onMapClick(e) {
      const { latlng } = e;
      this.marker = { lat: latlng.lat, lng: latlng.lng };
      this.center = this.marker;
      this.$emit("update:modelValue", this.marker);
    },

    onDragEnd(e) {
      const pos = e.target.getLatLng();
      this.marker = { lat: pos.lat, lng: pos.lng };
      this.center = this.marker;
      this.$emit("update:modelValue", this.marker);
    },

    locateMe() {
      if (!navigator.geolocation) return;
      this.locating = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.center = { lat: latitude, lng: longitude };
          this.marker = this.center;
          this.zoom = 15;
          this.locating = false;
          this.$emit("update:modelValue", this.marker);
        },
        () => {
          this.locating = false;
        }
      );
    },
  },
};
</script>

<style scoped>
:deep(.leaflet-container) {
  border-radius: 12px;
}
</style>
