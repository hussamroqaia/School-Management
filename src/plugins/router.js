import { createWebHistory, createRouter } from "vue-router";

import HomeView from "@/components/view/HomeView.vue";
import NotFoundView from "@/components/view/NotFoundView.vue";
import DefaultLayout from "@/components/layout/DefaultLayout.vue";

import LoginLayout from "@/components/layout/LoginLayout.vue";
import LoginView from "@/components/view/LoginView.vue";

import ComplaintsView from "@/components/view/complaint/ComplaintsView.vue";
import ComplaintView from "@/components/view/complaint/ComplaintView.vue";
import AddEmployeeView from "@/components/view/AddEmployeeView.vue";
import EmployeesView from "@/components/view/EmployeesView.vue";
import MonitoringComplaintsView from "@/components/view/MonitoringComplaintsView.vue";
import GovernmentsView from "@/components/view/GovernmentsView.vue";

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
      { path: "complaints", component: ComplaintsView, name: "complaints" },
      {
        path: "/complaints/:id",
        component: ComplaintView,
        name: "complaint-view",
        props: true,
      },
      {
        path: "add-employee",
        component: AddEmployeeView,
        name: "add-employee",
      },
      {
        path: "employees",
        component: EmployeesView,
        name: "employees",
      },
      {
        path: "monitoring-complaints",
        component: MonitoringComplaintsView,
        name: "monitoring-complaints",
      },
      {
        path: "governments",
        component: GovernmentsView,
        name: "governments",
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
    const allowedRoutes = ["home"];
    if (!allowedRoutes.includes(to.name)) {
      next({ name: "home" });
      return;
    }
  }

  next();
});
