import HomeView from "@/components/view/HomeView.vue";
import { createWebHistory, createRouter } from "vue-router";
import NotFoundView from "@/components/view/NotFoundView.vue";
import LoginLayout from "@/components/layout/LoginLayout.vue";
import LoginView from "@/components/view/LoginView.vue";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";
import AboutView from "@/components/view/AboutView.vue";
import CoursesView from "@/components/view/CoursesView.vue";

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
      { path: "about", component: AboutView, name: "about" },
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
