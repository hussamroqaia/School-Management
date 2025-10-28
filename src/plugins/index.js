import vuetify from "./vuetify";
import { router } from "./router";
import { createPinia } from "pinia";
import i18n from "./i18n";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { setupVeeValidate } from "./vee-validate";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});
setupVeeValidate("en");

export function registerPlugins(app) {
  const pinia = createPinia();
  app.use(vuetify);
  app.use(router);
  app.use(pinia);
  app.use(i18n);
}
