/* core/home.js — tema da landing (extraído de index.html) */
import { initTheme, mountThemeToggle } from "./theme.js";
import "./sw-register.js";
initTheme();
mountThemeToggle(document.getElementById("tg"));
