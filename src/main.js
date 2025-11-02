import { registerPlugins } from "@/plugins";
import App from "./App.vue";
import { createApp } from "vue";
import "unfonts.css";

// Initialize RTL before app mounts
const savedLang = localStorage.getItem("lang") || "en";
document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
document.documentElement.setAttribute("lang", savedLang);

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
