/* Zeichnungen und Tabellen fuer Deck 12 (stagekit-Fassung). Jede Funktion
 * schreibt in ihr Element; Farben kommen ueber draw.js aus theme.css.
 * Regeln: Zeichenflaeche 1680 x 800 (mit Punchline 1680 x 700), nur die vier
 * Groessen des Themes (20, 32, 48, 80), Leitungen immer VOR den Gattern
 * (d.layers(wires, gates, labels)), alles Zaehlbare in der Code-Schrift,
 * Beschriftungen in Zeichnungen in 32, Werte in 48, Punchlines als
 * <div class="punch"> auf der Folie, nie in der Zeichnung. */
"use strict";

const d = window.draw;
const bits = (v, w = 8) => v.toString(2).padStart(w, "0");
const spaced = (s) => s.split("").join(" ");
const PIXEL = 178, PLUS = 40;
const $ = (id) => document.getElementById(id);
const G = (type, x, y, on, k = 2.6) => `<g transform="translate(${x},${y}) scale(${k})">${d.gate(type, 0, 0, on)}</g>`;
// Gatter bei Scale k: Breite 56k, Hoehe 40k, Eingaenge bei y+10k / y+30k, Ausgang bei x+56k, y+20k

const FN = { and: (a, b) => a & b, or: (a, b) => a | b, xor: (a, b) => a ^ b, not: (a) => 1 - a,
             nand: (a, b) => 1 - (a & b), nor: (a, b) => 1 - (a | b), xnor: (a, b) => 1 - (a ^ b) };

// --- gate cards: symbol, name, truth table --------------------------------------
function gateCard(type) {
  const k = 2.6, gw = 56 * k, gh = 40 * k, gx = 100, gy = 18;
  const one = type === "not";
  const wires = one ? [d.wire([[gx - 70, gy + gh / 2], [gx, gy + gh / 2]], false)]
    : [d.wire([[gx - 70, gy + 10 * k], [gx, gy + 10 * k]], false), d.wire([[gx - 70, gy + 30 * k], [gx, gy + 30 * k]], false)];
  wires.push(d.wire([[gx + gw, gy + gh / 2], [gx + gw + 70, gy + gh / 2]], false));
  const sym = d.svg(360, 140, ...d.layers(wires, [G(type, gx, gy, false, k)]));
  const rows = (one ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]]).map((r) => ({ in: r, out: [FN[type](r[0], r[1] ?? 0)] }));
  const table = d.truthTable(one ? ["a"] : ["a", "b"], ["out"], rows).replace('class="tt"', 'class="tt large"');
  return `<div class="gatecard"><div class="gsym">${sym}</div><div class="gname">${type}</div>${table}</div>`;
}
function fillCards() {
  $("cards-basic").innerHTML = ["and", "or", "xor"].map(gateCard).join("");
  $("cards-not").innerHTML = `<div></div>${gateCard("not")}<div></div>`;
  $("cards-inverted").innerHTML = ["nand", "nor", "xnor"].map(gateCard).join("");
}

// --- nand: one gate is enough (three constructions, no table) -----------------------
function drawNand() {
  const c = d.colors();
  const wires = [], gates = [], labels = [];
  const k = 2.0, gw = 56 * k, gh = 40 * k, mid = gh / 2;
  const lab = (x, y, t, anchor = "end") => d.label(x, y + 7, t, { size: 20, color: c.light, anchor, mono: true });
  const X = 330, TX = 240, CX = 1100;
  const row = (y, title, body, caption) => {
    labels.push(d.label(TX, y + mid + 14, title, { size: 48, color: c.white, anchor: "end", mono: true }));
    body(X, y);
    labels.push(d.label(CX, y + mid + 11, caption, { size: 32, color: c.gray }));
  };
  row(20, "not", (x, y) => { const gx = x + 110;
    wires.push(d.wire([[x + 30, y + mid], [x + 65, y + mid], [x + 65, y + 10 * k], [gx, y + 10 * k]], false), d.wire([[x + 65, y + mid], [x + 65, y + 30 * k], [gx, y + 30 * k]], false), d.dot(x + 65, y + mid, false), d.wire([[gx + gw, y + mid], [gx + gw + 50, y + mid]], false));
    gates.push(G("nand", gx, y, false, k));
    labels.push(lab(x + 15, y + mid, "a"), lab(gx + gw + 65, y + mid, "not a", "start")); }, "the same bit into both inputs");
  row(230, "and", (x, y) => { const gx = x + 110, g2 = gx + gw + 80;
    wires.push(d.wire([[x + 30, y + 10 * k], [gx, y + 10 * k]], false), d.wire([[x + 30, y + 30 * k], [gx, y + 30 * k]], false),
      d.wire([[gx + gw, y + mid], [g2 - 40, y + mid], [g2 - 40, y + 10 * k], [g2, y + 10 * k]], false), d.wire([[g2 - 40, y + mid], [g2 - 40, y + 30 * k], [g2, y + 30 * k]], false), d.dot(g2 - 40, y + mid, false), d.wire([[g2 + gw, y + mid], [g2 + gw + 50, y + mid]], false));
    gates.push(G("nand", gx, y, false, k), G("nand", g2, y, false, k));
    labels.push(lab(x + 15, y + 10 * k, "a"), lab(x + 15, y + 30 * k, "b"), lab(g2 + gw + 65, y + mid, "a and b", "start")); }, "nand, then flipped again");
  row(470, "or", (x, y) => { const gx = x + 110, g1y = y - 75, g2y = y + 75, g3x = gx + gw + 80;
    wires.push(d.wire([[x + 30, g1y + mid], [x + 65, g1y + mid], [x + 65, g1y + 10 * k], [gx, g1y + 10 * k]], false), d.wire([[x + 65, g1y + mid], [x + 65, g1y + 30 * k], [gx, g1y + 30 * k]], false), d.dot(x + 65, g1y + mid, false),
      d.wire([[gx + gw, g1y + mid], [g3x - 40, g1y + mid], [g3x - 40, y + 10 * k], [g3x, y + 10 * k]], false),
      d.wire([[x + 30, g2y + mid], [x + 65, g2y + mid], [x + 65, g2y + 10 * k], [gx, g2y + 10 * k]], false), d.wire([[x + 65, g2y + mid], [x + 65, g2y + 30 * k], [gx, g2y + 30 * k]], false), d.dot(x + 65, g2y + mid, false),
      d.wire([[gx + gw, g2y + mid], [g3x - 40, g2y + mid], [g3x - 40, y + 30 * k], [g3x, y + 30 * k]], false), d.wire([[g3x + gw, y + mid], [g3x + gw + 50, y + mid]], false));
    gates.push(G("nand", gx, g1y, false, k), G("nand", gx, g2y, false, k), G("nand", g3x, y, false, k));
    labels.push(lab(x + 15, g1y + mid, "a"), lab(x + 15, g2y + mid, "b"), lab(g3x + gw + 65, y + mid, "a or b", "start")); }, "both flipped first, then nand");
  $("fig-nand").innerHTML = d.svg(1680, 660, ...d.layers(wires, gates, labels));
}

// --- flip-flop in four steps ---------------------------------------------------
function latchNets(s, r, prev) {
  let q = prev.q, qn = prev.qn;
  for (let i = 0; i < 20; i++) { const nq = 1 - ((r | qn) & 1); const nqn = 1 - ((q | s) & 1); if (nq === q && nqn === qn) break; q = nq; qn = nqn; }
  return { q, qn };
}
window.drawLatch = function (slide, step) {
  const seq = [{ s: 0, r: 0 }, { s: 1, r: 0 }, { s: 0, r: 0 }, { s: 0, r: 1 }];
  let st = { q: 0, qn: 1 };
  for (let i = 0; i <= Math.min(step, 3); i++) st = latchNets(seq[i].s, seq[i].r, st);
  const { s, r } = seq[Math.min(step, 3)];
  const c = d.colors();
  const on = (v) => v === 1;
  const k = 3, gw = 56 * k, gh = 40 * k, gx = 640, y1 = 60, y2 = 420;
  const wires = [
    d.wire([[300, y1 + 10 * k], [gx, y1 + 10 * k]], on(r)), d.wire([[300, y2 + 30 * k], [gx, y2 + 30 * k]], on(s)),
    d.wire([[gx + gw, y1 + gh / 2], [1250, y1 + gh / 2]], on(st.q)),
    d.wire([[gx + gw + 120, y1 + gh / 2], [gx + gw + 120, y1 + gh + 40], [gx - 120, y2 - 40], [gx - 120, y2 + 10 * k], [gx, y2 + 10 * k]], on(st.q)), d.dot(gx + gw + 120, y1 + gh / 2, on(st.q)),
    d.wire([[gx + gw, y2 + gh / 2], [1250, y2 + gh / 2]], on(st.qn)),
    d.wire([[gx + gw + 120, y2 + gh / 2], [gx + gw + 120, y2 - 40], [gx - 120, y1 + gh + 40], [gx - 120, y1 + 30 * k], [gx, y1 + 30 * k]], on(st.qn)), d.dot(gx + gw + 120, y2 + gh / 2, on(st.qn)),
  ];
  const gates = [
    `<g transform="translate(260,${y1 + 10 * k}) scale(2)">${d.toggle(0, 0, on(r), "reset")}</g>`,
    `<g transform="translate(260,${y2 + 30 * k}) scale(2)">${d.toggle(0, 0, on(s), "set")}</g>`,
    G("nor", gx, y1, on(st.q), k), G("nor", gx, y2, on(st.qn), k),
    `<g transform="translate(1290,${y1 + gh / 2}) scale(1.8)">${d.lamp(0, 0, on(st.q), "")}</g>`,
    `<g transform="translate(1290,${y2 + gh / 2}) scale(1.8)">${d.lamp(0, 0, on(st.qn), "")}</g>`,
  ];
  const labels = [d.label(1345, y1 + gh / 2 + 12, "q (the bit)", { size: 32, color: c.white, mono: true }), d.label(1345, y2 + gh / 2 + 12, "not q", { size: 32, color: c.gray, mono: true })];
  const svg = d.svg(1680, 620, ...d.layers(wires, gates, labels));
  if (!$("fig-latch")) return svg;
  $("fig-latch").innerHTML = svg;
  $("latch-caption").textContent = ["set = 0, reset = 0: nothing happens yet. q is 0.",
    "set = 1: the lower nor gives 0, the upper gets two zeros and gives 1. q = 1.",
    "set back to 0: q stays 1. the loop holds it. the circuit remembers.",
    "reset = 1: q drops to 0 and stays there. set, hold, clear."][Math.min(step, 3)];
  return svg;
};

// --- memory: a register, then rows with addresses -----------------------------
function drawMemory() {
  const c = d.colors();
  const parts = [];
  const byte = 65;
  parts.push(d.label(40, 30, "a register: eight flip-flops, one byte", { size: 32, color: c.gray }));
  for (let i = 7; i >= 0; i--) {
    const x = 40 + (7 - i) * 120, v = (byte >> i) & 1;
    parts.push(d.box(x, 60, 96, 72, "ff", { border: v ? c.yellow : c.light, color: c.gray, size: 32, mono: true, width: 3 }));
    parts.push(d.label(x + 48, 185, String(v), { size: 32, color: v ? c.yellow : c.light, anchor: "middle", mono: true }));
  }
  parts.push(d.label(1010, 185, "= 65 = 'a'", { size: 32, color: c.light, mono: true }));
  parts.push(d.label(40, 290, "RAM: millions of rows, each with an address", { size: 32, color: c.gray, keepCase: true }));
  const rows = [["0000", "01000001"], ["0001", "01101001"], ["0002", "00100000"], ["····", "········"], ["FFFF", "10110010"]];
  rows.forEach((r, j) => {
    const y = 320 + j * 56;
    parts.push(d.label(40, y + 35, r[0], { size: 32, color: c.blue, mono: true, keepCase: true }));
    parts.push(d.box(180, y, 560, 46, spaced(r[1]), { border: c.dark, color: j === 0 ? c.white : j === 3 ? c.dark : c.light, size: 32, mono: true, rx: 6 }));
  });
  parts.push(d.arrow(800, 343, 900, 343, { color: c.blue, width: 3 }), d.label(920, 354, "address lines choose a row", { size: 32, color: c.gray }));
  parts.push(d.arrow(900, 403, 800, 403, { color: c.light, width: 3 }), d.label(920, 414, "data lines read or write it", { size: 32, color: c.gray }));
  $("fig-memory").innerHTML = d.svg(1680, 620, ...parts);
}

// --- 1 + 1: the table with sum and carry ------------------------------------------
function fillAddTable() {
  $("arrow-add").innerHTML = derivesArrow();
  const rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ in: [a, b], out: [(a + b) & 1, (a + b) >> 1] }));
  $("tt-add").outerHTML = d.truthTable(["a", "b"], ["sum", "carry"], rows).replace('<table class="tt"', '<table class="tt large" id="tt-add" data-step="2"');
}

// ein liegendes, langgezogenes Dreieck: "daraus ergibt sich"
function derivesArrow() {
  return d.svg(110, 220, `<polygon points="0,0 110,110 0,220" fill="${d.colors().dark}"/>`);
}

// --- half adder: circuit left, the table with the highlighted column right ---------
window.drawHalfAdder = function (slide, step) {
  const c = d.colors();
  const withCarry = step >= 1;
  const k = 3, gw = 56 * k, gh = 40 * k, gx = 420, y1 = 40, y2 = 340;
  const wires = [
    d.wire([[110, y1 + gh / 2], [250, y1 + gh / 2], [250, y1 + 10 * k], [gx, y1 + 10 * k]], false), d.wire([[250, y1 + gh / 2], [250, y2 + 10 * k], [gx, y2 + 10 * k]], false), d.dot(250, y1 + gh / 2, false),
    d.wire([[110, y2 + gh / 2], [330, y2 + gh / 2], [330, y1 + 30 * k], [gx, y1 + 30 * k]], false), d.wire([[330, y2 + gh / 2], [330, y2 + 30 * k], [gx, y2 + 30 * k]], false), d.dot(330, y2 + gh / 2, false),
    d.wire([[gx + gw, y1 + gh / 2], [gx + gw + 80, y1 + gh / 2]], false), d.wire([[gx + gw, y2 + gh / 2], [gx + gw + 80, y2 + gh / 2]], false),
  ];
  const gates = [G("xor", gx, y1, false, k)];
  const labels = [
    d.label(90, y1 + gh / 2 + 12, "a", { size: 32, color: c.light, anchor: "end", mono: true }), d.label(90, y2 + gh / 2 + 12, "b", { size: 32, color: c.light, anchor: "end", mono: true }),
    d.label(gx + gw + 100, y1 + gh / 2 + 12, "sum", { size: 32, color: c.white, mono: true }),
    d.label(gx + gw + 100, y2 + gh / 2 + 12, "carry", { size: 32, color: withCarry ? c.white : c.gray, mono: true }),
  ];
  if (withCarry) gates.push(G("and", gx, y2, false, k));
  else gates.push(d.box(gx, y2, gw, gh, "?", { border: c.dark, dashed: true, color: c.dark, size: 48, mono: true }));
  const svg = d.svg(900, 520, ...d.layers(wires, gates, labels));
  if (!$("fig-half")) return svg;
  $("fig-half").innerHTML = svg;
  const rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ in: [a, b], out: [(a + b) & 1, (a + b) >> 1] }));
  let t = d.truthTable(["a", "b"], ["sum", "carry"], rows).replace('<table class="tt"', '<table class="tt large" id="tt-half"');
  const col = withCarry ? 3 : 2;      // 0-basiert: a, b, sum, carry
  t = t.replace(/<tr[^>]*>(.*?)<\/tr>/g, (m, inner) => {
    let i = 0;
    return m.replace(inner, inner.replace(/<(t[hd])( class="[^"]*")?>/g, (cell, tag, cls) => {
      const idx = i++;
      return idx === col ? `<${tag} class="hl${cls ? " " + cls.slice(8, -1) : ""}">` : cell;
    }));
  });
  $("tt-half").outerHTML = t;
  $("arrow-half").innerHTML = derivesArrow();
  return svg;
};

// --- byte adder: eight full adders, 178 + 40 --------------------------------------
function drawByteAdder() {
  const c = d.colors();
  const a = PIXEL, b = PLUS;
  const wires = [], boxes = [], labels = [];
  let carry = 0;
  const cols = [];
  for (let i = 0; i < 8; i++) { const ai = (a >> i) & 1, bi = (b >> i) & 1, t = ai + bi + carry; cols.push({ i, ai, bi, cin: carry, sum: t & 1, cout: t >> 1 }); carry = t >> 1; }
  const boxW = 130, gap = 44, x0 = 80, top = 130;
  for (let j = 0; j < 8; j++) {
    const col = cols[7 - j], x = x0 + j * (boxW + gap);
    labels.push(d.label(x + 38, 40, String(col.ai), { size: 48, color: col.ai ? c.yellow : c.light, anchor: "middle", mono: true }));
    labels.push(d.label(x + 92, 40, String(col.bi), { size: 48, color: col.bi ? c.yellow : c.light, anchor: "middle", mono: true }));
    wires.push(d.wire([[x + 38, 60], [x + 38, top]], !!col.ai), d.wire([[x + 92, 60], [x + 92, top]], !!col.bi));
    boxes.push(d.box(x, top, boxW, 92, "full\nadder", { border: c.light, color: c.light, size: 20, mono: true, width: 3, fill: c.bg }));
    wires.push(d.wire([[x, top + 46], [x - gap, top + 46]], !!col.cout));
    labels.push(d.label(x - gap / 2, top + 34, String(col.cout), { size: 20, color: col.cout ? c.yellow : c.dark, anchor: "middle", mono: true }));
    wires.push(d.wire([[x + 65, top + 92], [x + 65, top + 165]], !!col.sum));
    labels.push(d.label(x + 65, top + 215, String(col.sum), { size: 48, color: col.sum ? c.yellow : c.light, anchor: "middle", mono: true }));
  }
  const xr = x0 + 8 * (boxW + gap) - gap;            // rechter Rand des letzten Blocks
  wires.push(d.wire([[xr + 60, top + 46], [xr, top + 46]], false));
  labels.push(d.label(xr + 75, top + 57, "c = 0", { size: 32, color: c.gray, mono: true }));
  labels.push(d.label(x0 - gap - 12, top + 57, String(carry), { size: 20, color: c.dark, anchor: "end", mono: true }));
  labels.push(d.label(30, 34, "a b", { size: 32, color: c.gray, mono: true }), d.label(30, top + 209, "sum", { size: 32, color: c.gray, mono: true }));
  // Stellen exakt untereinander: Bits rechtsbuendig an einer Kante, "=" fest, Dezimal rechtsbuendig
  const rowY = [470, 530, 610], vals = [[bits(a), a, c.light], [bits(b), b, c.light], [bits(a + b), a + b, c.yellow]];
  vals.forEach(([bs, dec, col], i) => {
    labels.push(d.label(960, rowY[i], spaced(bs), { size: 48, color: col, anchor: "end", mono: true }));
    labels.push(d.label(1000, rowY[i], "=", { size: 48, color: c.gray, mono: true }));
    labels.push(d.label(1150, rowY[i], String(dec), { size: 48, color: col, anchor: "end", mono: true }));
  });
  labels.push(d.line(520, 555, 1160, 555, { color: c.light, width: 3 }));
  const svg = d.svg(1680, 640, ...d.layers(wires, boxes, labels));
  if ($("fig-byte")) $("fig-byte").innerHTML = svg;
  return svg;
}

// --- a written addition as a table: label, bits, decimal, rule before the result -----
function sumTable(rows) {
  return rows.map(([lab, b, dec, cls]) => `<tr class="${cls || ""}"><td class="lab">${lab}</td><td class="bits">${b}</td><td class="dec">${dec ?? ""}</td></tr>`).join("");
}
/* Uebertraege als Zeile ueber den Bits, Spalte fuer Spalte: Spalte c (0 = die
 * neunte, 1 = Bit 7 ... 8 = Bit 0) steht in den Bitzeilen (" " + spaced) beim
 * Zeichen 2c - 1; die neunte beim Zeichen 0. */
function carriesRow(x, y) {
  let cc = 0; const out = new Array(9).fill(" ");
  for (let i = 0; i < 8; i++) { const s = ((x >> i) & 1) + ((y >> i) & 1) + cc; cc = s > 1 ? 1 : 0; out[8 - (i + 1)] = cc ? "1" : " "; }
  const chars = new Array(17).fill(" ");
  chars[0] = out[0];
  for (let c = 1; c <= 8; c++) chars[2 * c - 1] = out[c];
  return chars.join("");
}

// --- pixel grid from the parrot, and the arithmetic -------------------------------
function pixelValues() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
      const ctx = cv.getContext("2d"); ctx.drawImage(img, 0, 0);
      const vals = [];
      for (let r = 0; r < 8; r++) { const row = []; for (let col = 0; col < 8; col++) { const p = ctx.getImageData(36 + col, 84 + r, 1, 1).data; row.push(Math.round(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2])); } vals.push(row); }
      resolve(vals);
    };
    img.onerror = () => resolve(null);
    img.src = "img/parrot.png";
  });
}

function pixGrid(vals, best, opts) {
  // opts.numbers: Werte einblenden (data-step), opts.plus: Wert addieren (mit Grenze 255)
  return vals.map((row, r) => row.map((v, cIdx) => {
    const val = Math.min(255, v + (opts.plus || 0));
    const dark = val < 128;
    const hi = best && r === best[0] && cIdx === best[1];
    const num = opts.numbers ? `<span${opts.step ? ` data-step="${opts.step}"` : ""} style="color:${dark ? "var(--gray-light)" : "#000"}">${val}</span>` : "";
    const mark = hi ? `<i class="hi"${opts.step ? ` data-step="${opts.step}"` : ""}></i>` : "";
    return `<div style="background: rgb(${val},${val},${val})">${num}${mark}</div>`;
  }).join("")).join("");
}

function fillPixels(vals) {
  if (!vals) { vals = [[178, 180, 190, 200, 210, 215, 220, 225], [170, 175, 185, 195, 205, 212, 218, 222], [160, 168, 178, 190, 200, 208, 214, 220], [150, 158, 170, 182, 194, 204, 210, 216], [140, 148, 160, 172, 186, 198, 206, 212], [130, 138, 150, 164, 178, 192, 202, 208], [120, 128, 140, 156, 170, 186, 198, 204], [110, 118, 130, 148, 164, 180, 194, 200]]; }
  let best = [0, 0], bestDiff = 999;
  vals.forEach((row, r) => row.forEach((v, cIdx) => { const diff = Math.abs(v - PIXEL); if (diff < bestDiff) { bestDiff = diff; best = [r, cIdx]; } }));
  const example = vals[best[0]][best[1]];
  $("pix-img").innerHTML = pixGrid(vals, best, { numbers: true, step: 1 });
  $("pix-before").innerHTML = pixGrid(vals, best, { numbers: true });
  $("pix-after").innerHTML = pixGrid(vals, best, { numbers: true, plus: PLUS });
  $("ex-val").textContent = String(example);
  const sp = (v) => " " + spaced(bits(v));                 // neun Spalten: Platz fuer den neunten Uebertrag
  // die Raster kommen nach dem ersten Anzeigen: Schritte neu anwenden
  if (window.stagekit) window.stagekit.showFrame(window.stagekit.frame);
  $("sum-one").innerHTML = sumTable([
    ["old", sp(example), example],
    ["+ 40", sp(PLUS), PLUS],
    ["", carriesRow(example, PLUS), "", "carries"],
    ["new", sp(example + PLUS), example + PLUS, "result"],
  ]);
}

// --- parity chain: the running xor, left to right ------------------------------------
function drawParity(caption = true) {
  const c = d.colors();
  const b = bits(PIXEL);
  const wires = [], gates = [], labels = [];
  const k = 2.2, gw = 56 * k, gh = 40 * k, pitch = 174, x0 = 150, yBit = 80, yG = 240;
  const yIn = yG + 30 * k;                    // unterer Eingang: das laufende Ergebnis
  let acc = 0;
  labels.push(d.label(x0 - 20, yBit + 16, "bits", { size: 32, color: c.gray, anchor: "end" }));
  labels.push(d.label(x0 - 20, yG + gh + 70, "so far", { size: 32, color: c.gray, anchor: "end" }));
  for (let i = 0; i < 8; i++) {
    const bit = Number(b[i]), gx = x0 + i * pitch, cx = gx + gw / 2;
    labels.push(d.label(cx, yBit + 16, b[i], { size: 48, color: bit ? c.yellow : c.light, anchor: "middle", mono: true }));
    wires.push(d.wire([[cx, yBit + 30], [cx, yG - 30], [gx - 10, yG - 30], [gx - 10, yG + 10 * k], [gx, yG + 10 * k]], !!bit));
    if (i === 0) {
      wires.push(d.wire([[gx - 60, yIn], [gx, yIn]], false));
      labels.push(d.label(gx - 70, yIn + 11, "0", { size: 32, color: c.gray, anchor: "end", mono: true }));
    } else {
      wires.push(d.wire([[gx - pitch + gw, yIn], [gx, yIn]], !!acc));
    }
    acc ^= bit;
    gates.push(G("xor", gx, yG, !!acc, k));
    labels.push(d.label(cx, yG + gh + 70, String(acc), { size: 48, color: acc ? c.yellow : c.light, anchor: "middle", mono: true }));
  }
  const last = x0 + 7 * pitch + gw;
  wires.push(d.wire([[last, yIn], [last + 60, yIn]], !!acc));
  gates.push(`<g transform="translate(${last + 90},${yIn}) scale(1.8)">${d.lamp(0, 0, !!acc, "")}</g>`);
  labels.push(d.label(last + 90, yIn + 75, "check", { size: 32, color: c.gray, anchor: "middle", mono: true }));
  if (caption) labels.push(d.label(840, 540, "each xor takes the result so far and the next bit. four ones: even, check bit 0.", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(1680, caption ? 580 : 450, ...d.layers(wires, gates, labels));
  if ($("fig-parity")) $("fig-parity").innerHTML = svg;
  return svg;
}

// --- xor with a key -----------------------------------------------------------------
function fillXor() {
  const msg = "01101001", key = "11001010";
  const secret = bits(parseInt(msg, 2) ^ parseInt(key, 2));
  const back = bits(parseInt(secret, 2) ^ parseInt(key, 2));
  $("xor-table").innerHTML = sumTable([
    ["message", spaced(msg), ""],
    ["xor key", spaced(key), ""],
    ["secret", `<span class="y">${spaced(secret)}</span>`, "", "result"],
  ]) + `<tr><td colspan="3" style="height: 40px"></td></tr>` + sumTable([
    ["secret", spaced(secret), ""],
    ["xor key", spaced(key), ""],
    ["message", `<span class="y">${spaced(back)}</span>`, "", "result"],
  ]).replace(/<tr class="([^"]*)">/g, '<tr class="$1" data-step="1">');
}

// --- start ------------------------------------------------------------------------
// Auf der Folie zeichnen; ohne Folie (figures.js fuer die Website) nur bereitstellen.
if ($("cards-basic")) {
  fillCards(); drawNand(); drawMemory(); fillAddTable(); drawByteAdder(); drawParity(); fillXor();
  pixelValues().then(fillPixels);
}
window.deck12 = { latch: drawLatch, half: drawHalfAdder, byte: drawByteAdder, parity: drawParity, pixelValues, bits, spaced, carriesRow, G, FN, PIXEL, PLUS };
