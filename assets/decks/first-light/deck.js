/* Zeichnungen fuer „from box to light" (Sitzung 1, Einrichtung).
 *
 * Eine Zeichnung: die Kette von der Idee bis zum Licht, sechs Glieder von oben
 * nach unten, aufgebaut in sechs Schritten. Das jeweils neue Glied hat einen
 * gelben Rahmen (gelb heisst „aktuell"), die schon gezeigten einen weissen.
 * Rechts neben jedem Glied in Grau, was es tut. Codeschrift fuer das, was der
 * Rechner liest: den Modulnamen und den Ordner. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);

const CHAIN = [
  { name: "you",                 mono: false, role: "decide what should happen" },
  { name: "OpenCode",            mono: false, keep: true, role: "your assistant writes and explains the program" },
  { name: "your Python program", mono: false, keep: true, role: "the code, in your folder", code: "my-code" },
  { name: "lifi_hardware",       mono: true,  role: "the module that speaks the device's language" },
  { name: "Brick Daemon",        mono: false, keep: true, role: "keeps the USB connection open", roleKeep: true },
  { name: "the device",          mono: false, role: "lamp and eye, on your table" },
];

/* Geometrie: Kaesten 560 x 96, Abstand 36; der Pfeil laeuft von Unterkante zu
 * Oberkante auf der Mittelachse (x = 480). Sechs Kaesten: 6 * 96 + 5 * 36 = 756,
 * dazu oben und unten je 12 Rand: viewBox-Hoehe 780. Die Beschriftung sitzt mit
 * centerY auf der Kastenmitte. */
window.drawChain = function (step = CHAIN.length - 1) {
  const c = d.colors();
  const X = 200, W = 560, H = 96, GAP = 36, TOP = 12;
  const wires = [], boxes = [], labels = [];
  CHAIN.forEach((g, i) => {
    if (i > step) return;
    const y = TOP + i * (H + GAP);
    if (i > 0) wires.push(d.arrow(X + W / 2, y - GAP, X + W / 2, y, { color: c.gray }));
    const now = i === step;
    boxes.push(d.box(X, y, W, H, g.name, { border: now ? c.yellow : c.white, color: now ? c.yellow : c.white, size: 32, mono: g.mono, keepCase: !!g.keep, rx: 10 }));
    // Ein Ordnername steht in Codeschrift, mitten im Satz: als tspan im selben <text>.
    let role = d.label(X + W + 60, 0, g.role, { size: 32, color: c.light, centerY: y + H / 2, keepCase: !!g.roleKeep });
    if (g.code) role = role.replace("</text>", ` <tspan font-family="Roboto Mono, monospace" class="keep-case">${g.code}</tspan></text>`);
    labels.push(role);
  });
  return d.svg(1680, 780, ...d.layers(wires, boxes, labels));
};

window.chainSteps = function (_slide, step = 0) {
  const svg = window.drawChain(step);
  const el = $("fig-chain"); if (el) el.innerHTML = svg;
  return svg;
};

/* „your device": je Aufbauschritt genau eine Markierung im Foto. */
window.deviceMarks = function (slide, step = 0) {
  if (!slide) return;
  slide.querySelectorAll(".spot").forEach((m, i) => m.classList.toggle("on", i === step));
};
