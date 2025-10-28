import { defineStore } from "pinia";
import { router } from "@/plugins/router";
export const useStudentStore = defineStore("student", {
  state: () => ({
    students: [],
    student: null,
    isLoading: false,
  }),
  actions: {
    async listStudents() {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch("https://school-barakah.vercel.app/students", {
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
        console.log(data);

        this.students = data;
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async getStudent(id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/students/${id}`,
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
        this.student = data;
      } catch (error) {
        console.error("Failed to fetch student:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addStudents(payload) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(`https://school-barakah.vercel.app/students`, {
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
      } catch (error) {
        console.error("Failed to add student:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async updateStudent(payload, id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/students/${id}`,
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
      } catch (error) {
        console.error("Failed to update student:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async deleteStudent(id) {
      this.isLoading = true;
      try {
        let token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/students/${id}`,
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
      } catch (error) {
        console.error("Failed to delete student:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
