import { defineStore } from "pinia";

// ---- localStorage helpers ---------------------------------------------------
const STORAGE_KEY = "sms.classes.v1";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function nowISO() {
  return new Date().toISOString();
}

// ---- initial seed (until your API is ready) ---------------------------------
function seededClasses() {
  const ts = nowISO();
  return [
    {
      id: 1,
      title: "Grade 10 - A",
      level: "Grade 10", // UI-only (not in your backend model yet)
      capacity: 30, // UI-only
      hasProjector: true,
      organizationId: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 2,
      title: "Grade 10 - B",
      level: "Grade 10",
      capacity: 28,
      hasProjector: false,
      organizationId: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 3,
      title: "Grade 11 - A",
      level: "Grade 11",
      capacity: 26,
      hasProjector: true,
      organizationId: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 4,
      title: "Grade 11 - B",
      level: "Grade 11",
      capacity: 25,
      hasProjector: false,
      organizationId: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 5,
      title: "Grade 12 - A",
      level: "Grade 12",
      capacity: 24,
      hasProjector: true,
      organizationId: 1,
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

// ---- Pinia store -------------------------------------------------------------
export const useClassStore = defineStore("class", {
  state: () => {
    const stored = loadFromStorage();
    const initial = stored?.length ? stored : seededClasses();
    return {
      classes: initial,
      isLoading: false,
    };
  },

  getters: {
    // Optional: sorted list by title
    sortedClasses: (state) =>
      [...state.classes].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      ),
  },

  actions: {
    // Simulate API call; replace with real fetch when backend is ready
    async list() {
      this.isLoading = true;
      await new Promise((r) => setTimeout(r, 200)); // tiny UX delay
      this.isLoading = false;
      // If you fetch from API later, assign: this.classes = fetched
      saveToStorage(this.classes);
    },

    addClass(payload) {
      // Compute next id
      const nextId =
        (this.classes.reduce((m, c) => Math.max(m, c.id || 0), 0) || 0) + 1;

      const item = {
        id: nextId,
        title: payload.title?.trim() || "Untitled Class",
        // UI-only fields (safe to remove when API model changes)
        level: payload.level ?? "",
        capacity: Number.isFinite(+payload.capacity) ? +payload.capacity : 0,

        hasProjector: !!payload.hasProjector,
        organizationId: payload.organizationId ?? 1,
        createdAt: payload.createdAt || nowISO(),
        updatedAt: payload.updatedAt || nowISO(),
      };

      this.classes.push(item);
      saveToStorage(this.classes);
      return item;
    },

    updateClass(payload) {
      const idx = this.classes.findIndex((c) => c.id === payload.id);
      if (idx === -1) return;

      const prev = this.classes[idx];
      const updated = {
        ...prev,
        ...payload,
        title: payload.title?.trim() ?? prev.title,
        level: payload.level ?? prev.level,
        capacity: payload.capacity != null ? +payload.capacity : prev.capacity,
        hasProjector:
          payload.hasProjector != null
            ? !!payload.hasProjector
            : prev.hasProjector,
        updatedAt: payload.updatedAt || nowISO(),
      };

      this.classes.splice(idx, 1, updated);
      saveToStorage(this.classes);
      return updated;
    },

    deleteClass(id) {
      const before = this.classes.length;
      this.classes = this.classes.filter((c) => c.id !== id);
      saveToStorage(this.classes);
      return this.classes.length < before;
    },

    // Utility: wipe & reseed (handy during development)
    reseed() {
      this.classes = seededClasses();
      saveToStorage(this.classes);
    },
  },
});
