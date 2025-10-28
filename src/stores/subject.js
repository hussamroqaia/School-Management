import { defineStore } from "pinia";

export const useSubjectStore = defineStore("subject", {
  state() {
    return {
      subjects: [],
      isLoadingSubjects: false,
    };
  },

  actions: {
    async listSubjects() {
      this.isLoadingSubjects = true;

      try {
        let token = localStorage.getItem("token");
        const res = await fetch("https://school-barakah.vercel.app/subjects", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        const data = await res.json();

        this.subjects = data.map((el) => ({
          label: el.name,
          value: el.id,
        }));
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        this.isLoadingSubjects = false;
      }
    },
  },
});
