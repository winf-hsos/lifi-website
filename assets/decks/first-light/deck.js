/* Zeichnungen fuer „first light" (Sitzung 1, Einrichtung und erstes Programm).
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
  { name: "you",                 mono: false, role: "decide what should happen, and write code" },
  { name: "OpenCode",            mono: false, keep: true, role: "your assistant helps you write and understand it" },
  { name: "your Python program", mono: false, keep: true, role: "the code you write together, in", code: "my-code" },
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

/* „its memory": das Kontextfenster als Rahmen. Neues kommt von rechts herein (Pfeil
 * „new"), der neueste Baustein steht ganz rechts und hat einen gelben Rahmen (aktuell).
 * Im Schritt 2 ist mehr da, als in den Rahmen passt: Die Reihe rueckt nach links, und
 * was links herausfaellt, wird dunkelgrau und steht ueber „compacted".
 * Rahmen x = 440 bis 1500, rechts davon der Eingangspfeil. */
const CONTEXT = [["you", 130], ["file", 180], ["answer", 180], ["output", 180], ["you", 130], ["answer", 180], ["file", 180]];
const CONTEXT_SHOWN = [3, 5, 7];

window.drawContext = function (step = 2) {
  const c = d.colors();
  const FX = 440, FW = 1060, FY = 70, FH = 170, GAP = 12, PAD = 20, BY = FY + 45, BH = 80;
  const items = CONTEXT.slice(0, CONTEXT_SHOWN[Math.min(step, 2)]);
  // Von hinten auffuellen, was in den Rahmen passt; der Rest liegt links davor,
  // mit einem breiteren Abstand, damit kein Baustein auf der Rahmenlinie sitzt.
  let k = items.length, used = 0;
  while (k > 0 && used + items[k - 1][1] + (k < items.length ? GAP : 0) <= FW - 2 * PAD) { used += items[k - 1][1] + (k < items.length ? GAP : 0); k--; }
  const frame = [], boxes = [], labels = [];
  frame.push(d.box(FX, FY, FW, FH, "", { border: c.light, rx: 14, width: 3 }));
  labels.push(d.label(FX, FY - 22, "context window", { size: 32, color: c.gray }));
  // Eingang rechts: Neues kommt von hier
  frame.push(d.arrow(1680, FY + FH / 2, FX + FW + 8, FY + FH / 2, { color: c.yellow }));
  labels.push(d.label(1595, FY + FH / 2 - 24, "new", { size: 32, color: c.yellow, anchor: "middle" }));
  // rechtsbuendig: der neueste Baustein steht am Eingang
  let x = FX + FW - PAD - used;
  items.slice(k).forEach(([name, w], i) => {
    const col = k + i === items.length - 1 ? c.yellow : c.white;
    boxes.push(d.box(x, BY, w, BH, name, { border: col, color: col, size: 32, rx: 8 }));
    x += w + GAP;
  });
  let right = FX - 40, left = right;
  items.slice(0, k).reverse().forEach(([name, w]) => {
    left = right - w;
    boxes.push(d.box(left, BY, w, BH, name, { border: c.dark, color: c.dark, size: 32, rx: 8 }));
    right = left - GAP;
  });
  if (k) labels.push(d.label((left + FX - 40) / 2, FY + FH + 60, "compacted", { size: 32, color: c.gray, anchor: "middle" }));
  return d.svg(1680, 340, ...d.layers(frame, boxes, labels));
};

window.contextSteps = function (_slide, step = 0) {
  const svg = window.drawContext(step);
  const el = $("fig-context"); if (el) el.innerHTML = svg;
  return svg;
};

/* „what if someone types five?": je Aufbauschritt die Zeilen der Fehlermeldung
 * gelb, um die es gerade geht (data-hl = Schritt). */
window.errorSteps = function (slide, step = 0) {
  if (!slide) return;
  slide.querySelectorAll("#traceback > div").forEach((l) => l.classList.toggle("hl", Number(l.dataset.hl) === step));
};

// Bootstrap Icons "cloud" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_CLOUD = '<path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>';

/* „the program and the model": von oben nach unten. Oben das Modell auf einem Server
 * (Wolke, denn Wolken sind oben), in der Mitte OpenCode mit dem echten Logo, darunter
 * eure Dateien und das Terminal, zusammen so breit wie OpenCode. Zwischen Modell und
 * OpenCode zwei senkrechte Pfeile: hinauf, was OpenCode schickt, herab der naechste
 * Schritt. Aufbau: 0 OpenCode, 1 Modell, 2 hinauf, 3 herab, 4 OpenCode fuehrt aus.
 * Das jeweils neue Element ist gelb (aktuell), die schon gezeigten weiss. */
window.drawModel = function (step = 4) {
  const c = d.colors();
  const col = (s) => (s === step ? c.yellow : c.white);
  const X = 560, W = 560, GAP = 20, HW = (W - GAP) / 2;
  const MY = 70, MH = 100, OY = 300, OH = 110, FY = 480, FH = 80;
  const wires = [], boxes = [], labels = [];
  boxes.push(d.box(X, OY, W, OH, "", { border: c.white, rx: 12 }));
  labels.push('<image href="img/brand/opencode-wordmark-dark.svg" x="' + (X + 110) + '" y="' + (OY + 32) + '" width="340" height="61"/>');
  labels.push(d.label(X - 40, 0, "on your laptop", { size: 32, color: c.gray, anchor: "end", centerY: OY + OH / 2 }));
  const act = step >= 4;
  const fc = act ? col(4) : c.dark, tc = act ? col(4) : c.gray;
  boxes.push(d.box(X, FY, HW, FH, "your files", { border: fc, color: tc, size: 32, rx: 10 }));
  boxes.push(d.box(X + HW + GAP, FY, HW, FH, "terminal", { border: fc, color: tc, size: 32, rx: 10 }));
  if (act) {
    wires.push(d.arrow(X + HW / 2, OY + OH, X + HW / 2, FY, { color: col(4) }));
    wires.push(d.arrow(X + HW + GAP + HW / 2, OY + OH, X + HW + GAP + HW / 2, FY, { color: col(4) }));
    labels.push(d.label(X - 40, 0, "carries it out, after asking you", { size: 32, color: col(4), anchor: "end", centerY: FY + FH / 2 }));
  }
  if (step >= 1) {
    boxes.push(d.box(X, MY, W, MH, "language model", { border: col(1), color: col(1), size: 32, rx: 12 }));
    labels.push(d.icon(X + W + 40, MY + 26, 48, ICON_CLOUD, { color: col(1) }));
    labels.push(d.label(X + W + 104, 0, "a server, somewhere else", { size: 32, color: col(1), centerY: MY + MH / 2 }));
  }
  const up = X + 200, down = X + W - 200;
  if (step >= 2) {
    wires.push(d.arrow(up, OY, up, MY + MH, { color: col(2) }));
    labels.push(d.label(up - 30, 0, "your task, your files, results", { size: 32, color: col(2), anchor: "end", centerY: (OY + MY + MH) / 2 }));
  }
  if (step >= 3) {
    wires.push(d.arrow(down, MY + MH, down, OY, { color: col(3) }));
    labels.push(d.label(down + 30, 0, "the next step: read, write, run", { size: 32, color: col(3), centerY: (OY + MY + MH) / 2 }));
  }
  return d.svg(1680, 580, ...d.layers(wires, boxes, labels));
};

window.modelSteps = function (_slide, step = 0) {
  // ab Schritt 5 ist nichts in der Zeichnung mehr neu: alles weiss
  const svg = window.drawModel(step);
  const el = $("fig-model"); if (el) el.innerHTML = svg;
  return svg;
};

/* „the agent loop": eure Aufgabe kommt links herein, rechts geht das Ergebnis an euch
 * zurueck; dazwischen denken, handeln, pruefen. Von „check" fuehrt eine Leitung unten
 * herum zurueck zu „think" („not yet"), nur waagerecht und senkrecht. Graue Zeile
 * ueber jedem Kasten: was dort geschieht. Aufbau: 0 Aufgabe und think, 1 act,
 * 2 check, 3 Rueckweg, 4 fertig. Neu ist gelb, schon gezeigt weiss. Die aeusseren
 * Kaesten halten 4 Einheiten Abstand zum Rand der viewBox, sonst schneidet sie den Strich. */
window.drawLoop = function (step = 4) {
  const c = d.colors();
  const col = (s) => (s === step ? c.yellow : c.white);
  const Y = 170, H = 110, M = Y + H / 2;
  const B = [
    { x: 4,    w: 236, name: "your task",   sub: "",                    s: 0 },
    { x: 360,  w: 260, name: "think",       sub: "what is next?",       s: 0 },
    { x: 740,  w: 260, name: "act",         sub: "read · write · run",  s: 1 },
    { x: 1120, w: 260, name: "check",       sub: "look at the result",  s: 2 },
    { x: 1500, w: 176, name: "done",        sub: "back to you",         s: 4 },
  ];
  const wires = [], boxes = [], labels = [];
  B.forEach((b, i) => {
    if (b.s > step) return;
    boxes.push(d.box(b.x, Y, b.w, H, b.name, { border: col(b.s), color: col(b.s), size: 48, rx: 12 }));
    if (b.sub) labels.push(d.label(b.x + b.w / 2, Y - 30, b.sub, { size: 32, color: c.gray, anchor: "middle" }));
    if (i > 0) wires.push(d.arrow(B[i - 1].x + B[i - 1].w, M, b.x, M, { color: col(b.s) }));
  });
  if (step >= 3) {
    const x1 = 1250, x0 = 490, yb = Y + H + 110;
    wires.push(d.line(x1, Y + H, x1, yb, { color: col(3) }));
    wires.push(d.line(x1, yb, x0, yb, { color: col(3) }));
    wires.push(d.arrow(x0, yb, x0, Y + H, { color: col(3) }));
    labels.push(d.label((x0 + x1) / 2, yb + 50, "not yet? again.", { size: 32, color: col(3), anchor: "middle" }));
  }
  return d.svg(1680, 460, ...d.layers(wires, boxes, labels));
};

window.loopSteps = function (_slide, step = 0) {
  const svg = window.drawLoop(Math.min(step, 4));
  const el = $("fig-loop"); if (el) el.innerHTML = svg;
  return svg;
};
