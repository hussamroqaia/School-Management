import { configure } from "vee-validate";
import { localize, setLocale } from "@vee-validate/i18n";
import en from "@vee-validate/i18n/dist/locale/en.json";
import ar from "@vee-validate/i18n/dist/locale/ar.json";

export function setupVeeValidate(locale = "ar") {
  configure({
    generateMessage: localize({ en, ar }),
    validateOnBlur: true,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: true,
  });
  setLocale(locale);
}
