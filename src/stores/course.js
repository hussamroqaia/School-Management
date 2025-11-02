import { defineStore } from "pinia";
import { router } from "@/plugins/router";

export const useCourseStore = defineStore("course", {
  state: () => {
    return {
      courses: [],
      course: {},
      sessions: [],
      isLoading: false,
      isLoadingSessions: false,
    };
  },

  actions: {
    async listCourses() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://school-barakah.vercel.app/courses", {
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

        this.courses = data;
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addCourse(payload) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://school-barakah.vercel.app/courses`, {
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return { success: true, data };
      } catch (error) {
        console.error("Failed to add course:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteCourse(id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/courses/${id}`,
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
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return { success: true };
      } catch (error) {
        console.error("Failed to delete course:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateCourse(payload, id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/courses/${id}`,
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        return { success: true, data };
      } catch (error) {
        console.error("Failed to update course:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getCourse(id) {
      this.isLoading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://school-barakah.vercel.app/courses/${id}`,
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        this.course = data;
        console.log(this.course);
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSessions(courseId) {
      this.isLoadingSessions = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://school-barakah.vercel.app/course-sessions",
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);

        this.sessions = data.filter(
          (session) => Number(session.courseId) === Number(courseId)
        );
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        this.isLoadingSessions = false;
      }
    },

    async addSession(payload) {
      this.isLoadingSessions = true;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://school-barakah.vercel.app/course-sessions",
          {
            method: "POST",
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Failed to add session:", error);
        throw error;
      } finally {
        this.isLoadingSessions = false;
      }
    },

    async addAttendance(payload) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://school-barakah.vercel.app/student-attendance",
          {
            method: "POST",
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
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        return { success: true, data };
      } catch (error) {
        console.error("Failed to add attendance:", error);
        throw error;
      }
    },
  },
});
