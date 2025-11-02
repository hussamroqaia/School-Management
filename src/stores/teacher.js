import { defineStore } from "pinia";
import { router } from "@/plugins/router";
export const useTeacherStore = defineStore("teacher", {
  state: () => ({
    teachers: [],
    teacher: null,
    isLoading: false,
    conflict: false,
  }),
  actions: {
    async listTeachers() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://school-barakah.vercel.app/teachers", {
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

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);

        this.teachers = data;
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getTeacher(id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/teachers/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        const data = await res.json();
        console.log(data);

        this.teacher = data;
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async addTeacher(payload) {
      this.isLoading = true;
      this.conflict = false;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(`https://school-barakah.vercel.app/teachers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        if (res.status === 409) {
          this.conflict = true;
          return { success: false, conflict: true };
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return { success: true, conflict: false };
      } catch (error) {
        console.error("Failed to add teacher:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async updateTeacher(payload, id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/teachers/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        if (res.status === 409) {
          this.conflict = true;
          return { success: false, conflict: true };
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return { success: true, conflict: false };
      } catch (error) {
        console.error("Failed to update student:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async deleteTeacher(id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/teachers/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 401) {
          console.warn("Unauthorized - redirecting to login...");
          localStorage.removeItem("token");
          router.push({ name: "login-page" });
          return;
        }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to delete teacher. Status: ${res.status}`
          );
        }
        return { success: true };
      } catch (error) {
        console.error("Failed to delete teacher:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
