import { createWebHistory, createRouter } from "vue-router";

import HomeView from "@/components/view/HomeView.vue";
import NotFoundView from "@/components/view/NotFoundView.vue";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";

import LoginLayout from "@/components/layout/LoginLayout.vue";
import LoginView from "@/components/view/LoginView.vue";

import CoursesView from "@/components/view/course/CoursesView.vue";
import CourseView from "@/components/view/course/CourseView.vue";
import CourseAddForm from "@/components/view/course/CourseAddForm.vue";
import CourseEditForm from "@/components/view/course/CourseEditForm.vue";

import ClassesView from "@/components/view/classes/ClassesView.vue";
import ClassView from "@/components/view/classes/ClassView.vue";

import StudentsView from "@/components/view/student/StudentsView.vue";
import StudentAddForm from "@/components/view/student/StudentAddForm.vue";
import StudentEditForm from "@/components/view/student/StudentEditForm.vue";
import StudentView from "@/components/view/student/StudentView.vue";

import teacherView from "@/components/view/teacher/TeacherView.vue";
import TeacherAddView from "@/components/view/teacher/TeacherAddView.vue";
import TeacherEditView from "@/components/view/teacher/TeacherEditView.vue";
import TeachersView from "@/components/view/teacher/TeachersView.vue";

import BusesView from "@/components/view/bus/BusesView.vue";
import BusAddView from "@/components/view/bus/BusAddView.vue";
import BusEditView from "@/components/view/bus/BusEditView.vue";
import BusView from "@/components/view/bus/BusView.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginLayout,
    children: [
      {
        path: "",
        name: "login-page",
        component: LoginView,
      },
    ],
  },
  {
    path: "",
    component: DefaultLayout,
    children: [
      { path: "", component: HomeView, name: "home" },
      { path: "students", component: StudentsView, name: "students" },
      {
        path: "/students/:id",
        component: StudentView,
        name: "student-view",
        props: true,
      },
      {
        path: "students/:id/StudentEditForm",
        component: StudentEditForm,
        name: "StudentEditForm",
        props: true,
      },
      {
        path: "students/studentAddForm",
        component: StudentAddForm,
        name: "studentAddForm",
      },
      { path: "teachers", component: TeachersView, name: "teachers" },
      {
        path: "teachers/add",
        component: TeacherAddView,
        name: "teacherAddView",
      },
      {
        path: "/teachers/:id",
        name: "teacher-view",
        component: teacherView,
        props: true,
      },
      {
        path: "/teachers/:id/edit",
        name: "teacher-edit",
        component: TeacherEditView,
        props: true,
      },
      { path: "classes", component: ClassesView, name: "classes" },
      {
        path: "/classes/:id",
        component: ClassView,
        name: "class-view",
        props: true,
      },

      { path: "courses", component: CoursesView, name: "courses" },
      {
        path: "/courses/:id",
        name: "course-view",
        component: CourseView,
        props: true,
      },
      {
        path: "courses/add",
        component: CourseAddForm,
        name: "CourseAddForm",
      },
      {
        path: "/courses/:id/edit",
        name: "course-edit",
        component: CourseEditForm,
        props: true,
      },
      { path: "buses", component: BusesView, name: "buses" },
      {
        path: "/buses/:id",
        name: "bus-view",
        component: BusView,
        props: true,
      },
      {
        path: "buses/add",
        component: BusAddView,
        name: "bus-add",
      },
      {
        path: "/buses/:id/edit",
        name: "bus-edit",
        component: BusEditView,
        props: true,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
    name: "not-found",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse user data:", e);
    }
  }

  if (to.name === "login-page") {
    if (token) {
      next({ name: "home" });
    } else {
      next();
    }
    return;
  }

  if (!token) {
    next({ name: "login-page" });
    return;
  }

  if (!user) {
    if (token) {
      next();
      return;
    }
    next({ name: "login-page" });
    return;
  }

  const userRole = user.role;

  if (userRole === "teacher") {
    const allowedRoutes = ["home", "teachers", "teacher-view", "teacher-edit"];
    if (!allowedRoutes.includes(to.name)) {
      next({ name: "home" });
      return;
    }
  }

  next();
});
