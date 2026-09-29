/* core/professor/board.js — montagem do app do professor (orquestra os módulos) */
import { initTheme, mountThemeToggle } from "../theme.js";
import { mountFloatingKeypad } from "../../components/keypad.js";
import "../sw-register.js";
import "./plot.js";
import "./scale.js";
import "./tools.js";
import { addFormula } from "./formulas.js";
import "./unitCircle.js";
import "./panel.js";
import "./modoAula.js";

initTheme();
mountThemeToggle(document.getElementById("theme-btn"));
mountFloatingKeypad();

addFormula("y=2^x"); addFormula("y=(1/2)^x");
