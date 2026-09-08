/* Zeichnungen fuer Deck 02 „what is a program?" (stagekit-Fassung).
 * Regeln: Zeichenbreite 1680, Hoehe auf den Inhalt zugeschnitten, nur die vier
 * Groessen des Themes (20, 32, 48, 80), Codeschrift fuer alles, was der Rechner
 * liest, Leitungen vor den Kaesten (d.layers), Punchlines auf der Folie.
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur, wenn es die Folie
 * gibt: so kann tools/figures.py dieselben Zeichnungen fuer die Website
 * rendern (siehe figures.js). */
"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const W = 1680;

function card(x, y, w, h, text, o = {}) {
  const c = d.colors();
  return d.box(x, y, w, h, text, { size: 32, rx: 10, width: 3, fill: c.bg, ...o });
}

/* Eine Codezeile setzen. SVG-Text verschluckt fuehrende Leerzeichen, deshalb
 * wird die Einrueckung als x-Versatz gezeichnet: ein Zeichen der Codeschrift
 * ist rund 0,6 em breit. */
function codeLine(x, y, line, o = {}) {
  const size = o.size || 32;
  const tiefe = line.length - line.trimStart().length;
  return d.label(x + tiefe * size * 0.6, y, line.trimStart(), { ...o, size, mono: true });
}

// ein Kasten mit Code darin, linksbuendig gesetzt statt zentriert
function codeBox(x, y, w, h, text, o = {}) {
  const c = d.colors();
  const size = o.size || 32, lines = String(text).split("\n");
  const parts = [d.box(x, y, w, h, "", { border: o.border || c.light, fill: c.bg, rx: 10, width: 3 })];
  const y0 = y + h / 2 + size * 0.35 - (lines.length - 1) * size * 1.35 / 2;
  lines.forEach((line, i) => {
    parts.push(codeLine(x + 28, y0 + i * size * 1.35, line, { size, color: o.color || c.white }));
  });
  return parts;
}

/* --- die liste bei der arbeit: drei zeilen, drei sichtbare wirkungen --------
 * Erst alle Leitungen, dann die Kaesten, dann die Beschriftungen: Ein Strich
 * darf nie auf dem Rahmen liegen, in den er fuehrt. */
function drawList() {
  const c = d.colors();
  const wires = [], boxes = [], labels = [];
  const rows = [
    { code: "led.set_color(255, 0, 0)", effect: "turns red", lamp: "#e8384f" },
    { code: "wait(1)", effect: "stays red,\none second passes", lamp: null },
    { code: "led.set_color(0, 0, 255)", effect: "turns blue", lamp: "#1e9be9" },
  ];
  const x = 120, boxW = 700, boxH = 110, gap = 60;
  rows.forEach((row, i) => {
    const y = 30 + i * (boxH + gap), mid = y + boxH / 2;
    wires.push(d.line(x + boxW - 20, mid, x + boxW + 150, mid, { color: c.dark, width: 2 }));
    boxes.push(...codeBox(x, y, boxW, boxH, row.code));
    boxes.push(`<circle cx="${x + boxW + 200}" cy="${mid}" r="34" fill="${row.lamp || "#e8384f"}"${row.lamp ? "" : ' opacity="0.35"'}/>`);
    labels.push(d.label(x + boxW + 260, mid + 11, row.effect, { size: 32, color: c.gray, lineHeight: 1.3 }));
  });
  const svg = d.svg(W, 3 * (boxH + gap) + 20, ...d.layers(wires, boxes, labels));
  if ($("fig-list")) $("fig-list").innerHTML = svg;
  return svg;
}

/* --- anatomie einer zeile: welches ding, was tun, mit welchen werten -------- */
window.drawAnatomy = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const size = 48, x = 200, y = 120;
  // die Zeile in drei Stuecken, damit jedes einzeln hervorgehoben werden kann
  const teile = [
    { text: "led", note: "which thing" },
    { text: ".set_color", note: "what to do with it" },
    { text: "(255, 0, 0)", note: "with which values" },
  ];
  // Zeichenbreite der Codeschrift: 0.6 em je Zeichen, reicht fuer die Ausrichtung
  const cw = size * 0.6;
  let cursor = x;
  const stellen = teile.map((t) => { const at = cursor; cursor += t.text.length * cw; return at; });
  teile.forEach((t, i) => {
    const aktiv = step >= i + 1;
    parts.push(d.label(stellen[i], y, t.text, { size, color: aktiv ? c.yellow : c.white, mono: true }));
  });
  teile.forEach((t, i) => {
    if (step < i + 1) return;
    const bx = stellen[i], bw = t.text.length * cw;
    const ny = 200 + i * 90;
    parts.push(d.line(bx + bw / 2, y + 20, bx + bw / 2, ny - 30, { color: c.dark, width: 2 }));
    parts.push(d.label(bx + bw / 2, ny, t.note, { size: 32, color: c.gray, anchor: "middle" }));
  });
  const svg = d.svg(W, 480, ...parts);
  if ($("fig-anatomy")) $("fig-anatomy").innerHTML = svg;
  return svg;
};

/* --- mit und ohne pause: zwei programme, zwei zeitleisten ------------------- */
function zeitleiste(parts, x, y, w, segmente) {
  const c = d.colors();
  let cursor = x;
  segmente.forEach((s) => {
    const sw = w * s.anteil;
    parts.push(`<rect x="${cursor}" y="${y}" width="${Math.max(3, sw)}" height="54" fill="${s.farbe}"/>`);
    cursor += sw;
  });
  parts.push(d.line(x, y + 54, x + w, y + 54, { color: c.dark, width: 2 }));
}
function drawPause() {
  const c = d.colors();
  const parts = [];
  const boxW = 700, boxH = 190, left = 100, right = 880, y = 70;
  parts.push(d.label(left, y - 24, "with a pause", { size: 32, color: c.gray }));
  parts.push(d.label(right, y - 24, "without a pause", { size: 32, color: c.gray }));
  parts.push(...codeBox(left, y, boxW, boxH, "led.set_color(255, 0, 0)\nwait(1)\nled.set_color(0, 0, 255)"));
  parts.push(...codeBox(right, y, boxW, boxH, "led.set_color(255, 0, 0)\nled.set_color(0, 0, 255)"));
  zeitleiste(parts, left, y + boxH + 60, boxW, [{ anteil: 0.5, farbe: "#e8384f" }, { anteil: 0.5, farbe: "#1e9be9" }]);
  zeitleiste(parts, right, y + boxH + 60, boxW, [{ anteil: 0.004, farbe: "#e8384f" }, { anteil: 0.996, farbe: "#1e9be9" }]);
  parts.push(d.label(left, y + boxH + 160, "red for one second, then blue.", { size: 32, color: c.gray }));
  parts.push(d.label(right, y + boxH + 160, "red for a millisecond: you never see it.", { size: 32, color: c.red }));
  const svg = d.svg(W, y + boxH + 200, ...parts);
  if ($("fig-pause")) $("fig-pause").innerHTML = svg;
  return svg;
}

/* --- dieselben zeilen, andere reihenfolge ---------------------------------- */
function drawOrder() {
  const c = d.colors();
  const parts = [];
  const boxW = 700, boxH = 190, left = 100, right = 880, y = 70;
  parts.push(d.label(left, y - 24, "pause in the middle", { size: 32, color: c.gray }));
  parts.push(d.label(right, y - 24, "pause at the end", { size: 32, color: c.gray }));
  parts.push(...codeBox(left, y, boxW, boxH, "led.set_color(255, 0, 0)\nwait(1)\nled.set_color(0, 0, 255)"));
  parts.push(...codeBox(right, y, boxW, boxH, "led.set_color(255, 0, 0)\nled.set_color(0, 0, 255)\nwait(1)"));
  zeitleiste(parts, left, y + boxH + 60, boxW, [{ anteil: 0.5, farbe: "#e8384f" }, { anteil: 0.5, farbe: "#1e9be9" }]);
  zeitleiste(parts, right, y + boxH + 60, boxW, [{ anteil: 0.004, farbe: "#e8384f" }, { anteil: 0.996, farbe: "#1e9be9" }]);
  parts.push(d.label(left, y + boxH + 160, "one second of red, then blue.", { size: 32, color: c.gray }));
  parts.push(d.label(right, y + boxH + 160, "one millisecond of red, then a second of blue.", { size: 32, color: c.red }));
  const svg = d.svg(W, y + boxH + 200, ...parts);
  if ($("fig-order")) $("fig-order").innerHTML = svg;
  return svg;
}

/* --- die schleife, ausgerollt gegen die zeit -------------------------------
 * Nur die rechte Haelfte: Der Code steht als .code-Block auf der Folie, damit
 * die Einrueckung erhalten bleibt (SVG-Text kennt keine fuehrenden Leerzeichen). */
function drawLoop() {
  const c = d.colors();
  const parts = [];
  const rw = 760, rx = 20, y = 40;
  const farben = ["#e8384f", "#3aa757", "#1e9be9", "#f2c832"];
  const namen = ["red", "green", "blue", "yellow"];
  const seg = rw / 4;
  farben.forEach((f, i) => {
    const x = rx + i * seg;
    parts.push(d.label(x + seg / 2, y, "pass " + (i + 1), { size: 20, color: c.gray, anchor: "middle", mono: true }));
    parts.push(`<rect x="${x}" y="${y + 20}" width="${seg - 8}" height="70" rx="6" fill="${f}"/>`);
    parts.push(d.label(x + seg / 2, y + 130, namen[i], { size: 32, color: c.gray, anchor: "middle", mono: true }));
    parts.push(d.label(x + seg / 2, y + 175, "1 s", { size: 20, color: c.gray, anchor: "middle", mono: true }));
  });
  parts.push(d.line(rx, y + 210, rx + rw - 8, y + 210, { color: c.dark, width: 2 }));
  parts.push(d.label(rx + (rw - 8) / 2, y + 255, "four passes, four seconds", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(rw + 40, y + 290, ...parts);
  if ($("fig-loop")) $("fig-loop").innerHTML = svg;
  return svg;
}

/* --- was kostet das: zwei richtige verfahren, ein unterschied -------------- */
function drawCost() {
  const c = d.colors();
  const parts = [];
  const x = 140, cw = 520, y = 40, rowH = 110;
  const kopf = [["", ""], ["100 numbers", ""], ["1000 numbers", ""]];
  parts.push(d.label(x + cw, y, "100 numbers", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.label(x + cw + 460, y, "1000 numbers", { size: 32, color: c.gray, anchor: "middle" }));
  const zeilen = [
    { name: "ask every number", a: "99", b: "999", farbe: c.light },
    { name: "halve the range", a: "7", b: "10", farbe: c.yellow },
  ];
  zeilen.forEach((z, i) => {
    const yy = y + 70 + i * rowH;
    parts.push(d.label(x, yy, z.name, { size: 48, color: z.farbe }));
    parts.push(d.label(x + cw, yy, z.a, { size: 48, color: z.farbe, anchor: "middle", mono: true }));
    parts.push(d.label(x + cw + 460, yy, z.b, { size: 48, color: z.farbe, anchor: "middle", mono: true }));
  });
  parts.push(d.line(x, y + 30, x + cw + 560, y + 30, { color: c.dark, width: 2 }));
  parts.push(d.label(x, y + 70 + 2 * rowH + 20, "both find the number. one of them is unusable at scale.",
    { size: 32, color: c.gray }));
  const svg = d.svg(W, y + 70 + 2 * rowH + 70, ...parts);
  if ($("fig-cost")) $("fig-cost").innerHTML = svg;
  return svg;
}

/* --- die fehlermeldung, zeile fuer zeile gelesen --------------------------- */
window.drawError = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const x = 140, y = 40, size = 32, lh = 52;
  const zeilen = [
    'traceback (most recent call last):',
    '  file "blink.py", line 7, in <module>',
    "    led.set_color(255, 0, 0)",
    "attributeerror: no attribute 'set_colour'",
  ];
  zeilen.forEach((z, i) => {
    parts.push(codeLine(x, y + i * lh, z, { size, color: i === 3 ? c.white : c.light }));
  });
  const noten = [
    { i: 1, text: "which file, and which line" },
    { i: 2, text: "what stands there" },
    { i: 3, text: "what does not exist: set_colour with a u" },
  ];
  noten.forEach((n, k) => {
    if (step < k + 1) return;
    const yy = y + n.i * lh;
    parts.push(d.line(1000, yy - 10, 1080, yy - 10, { color: c.yellow, width: 2 }));
    parts.push(d.label(1100, yy, n.text, { size: 32, color: c.yellow }));
  });
  const svg = d.svg(W, y + 4 * lh + 60, ...parts);
  if ($("fig-error")) $("fig-error").innerHTML = svg;
  return svg;
};

/* --- zwei arten zu fragen -------------------------------------------------- */
window.drawAsk = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const boxW = 1400, x = (W - boxW) / 2, y = 20, boxH = 110;
  parts.push(...codeBox(x, y, boxW, boxH, "write me a program for the led.",
    { border: step >= 1 ? c.dark : c.light, color: step >= 1 ? c.dark : c.white }));
  parts.push(d.label(x, y + boxH + 50, "this gets you code.", { size: 32, color: step >= 1 ? c.dark : c.gray }));
  if (step >= 1) {
    const y2 = y + boxH + 130;
    parts.push(...codeBox(x, y2, boxW, 170,
      "the led should be red for three seconds, then blue.\nexplain each line before you write it.", { border: c.green }));
    parts.push(d.label(x, y2 + 170 + 50, "this gets you understanding.", { size: 32, color: c.gray }));
  }
  const svg = d.svg(W, 560, ...parts);
  if ($("fig-ask")) $("fig-ask").innerHTML = svg;
  return svg;
};

// --- start -------------------------------------------------------------------
if ($("fig-list")) {
  drawList(); drawPause(); drawOrder(); drawLoop(); drawCost();
}
window.deck02 = { list: drawList, anatomy: window.drawAnatomy, pause: drawPause, order: drawOrder,
                  loop: drawLoop, cost: drawCost, error: window.drawError, ask: window.drawAsk };
