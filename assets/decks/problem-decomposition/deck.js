/* Zeichnungen fuer Deck 01 „cutting problems" (stagekit-Fassung).
 * Regeln: Zeichenflaeche 1680 x 700 (mit Punchline 1680 x 620), nur die vier
 * Groessen des Themes (20, 32, 48, 80), Beschriftungen in 32, Werte in 48,
 * Punchlines als <div class="punch"> auf der Folie, nie in der Zeichnung.
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur, wenn es die Folie
 * gibt: so kann tools/figures.py dieselben Zeichnungen fuer die Website
 * rendern (siehe figures.js). */
"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const W = 1680;                              // Zeichenbreite; die Hoehe schneidet jede
// Zeichnung auf ihren Inhalt zu, damit sie in der Flaeche mittig steht statt oben zu kleben.

/* Ein Kasten mit zentriertem Text, ueberall gleich. Die Fuellung ist der
 * Folienhintergrund, nicht "none": So deckt der Kasten die Leitung ab, die in
 * ihn hineinfuehrt, und keine Linie liegt auf seinem Rand. Kaesten werden
 * deshalb immer NACH den Leitungen gezeichnet. */
function card(x, y, w, h, text, o = {}) {
  const c = d.colors();
  return d.box(x, y, w, h, text, { size: 32, rounded: true, rx: 10, width: 3, fill: c.bg, ...o });
}

// gruener Haken und rotes Kreuz als Zeichen, nicht als Buchstabe
function tick(x, y, col) {
  const c = d.colors();
  return `<path d="M${x - 16},${y} l12,14 l24,-30" fill="none" stroke="${col || c.green}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function cross(x, y) {
  const c = d.colors();
  return `<path d="M${x - 14},${y - 14} l28,28 M${x + 14},${y - 14} l-28,28" fill="none" stroke="${c.red}" stroke-width="5" stroke-linecap="round"/>`;
}

/* ---- ein Baum: oben das Problem, darunter die Teile ------------------------
 * Wird zweimal gebraucht (Party, Zerlegung), deshalb eine Funktion. */
function tree(root, leaves, opts = {}) {
  const c = d.colors();
  const show = opts.show === undefined ? true : opts.show;
  // getrennte Ebenen: erst alle Leitungen, dann alle Kaesten, dann die Labels.
  // Sonst liegt ein Strich auf dem Rand des Kastens, in den er hineinfuehrt.
  const wires = [], boxes = [], labels = [];
  const rootW = opts.rootW || 700, rootH = 110, rootX = (W - rootW) / 2, rootY = 10;
  boxes.push(card(rootX, rootY, rootW, rootH, root, { border: c.white, color: c.white, size: opts.rootSize || 32 }));

  const n = leaves.length, boxW = opts.boxW || 260, gap = (W - 80 - n * boxW) / (n - 1);
  const boxY = 300, boxH = 160, midY = 230;
  if (show) {
    const first = 40 + boxW / 2, last = 40 + (n - 1) * (boxW + gap) + boxW / 2;
    wires.push(d.line(W / 2, rootY + rootH, W / 2, midY, { color: c.dark, width: 2 }));
    wires.push(d.line(first, midY, last, midY, { color: c.dark, width: 2 }));
    leaves.forEach((leaf, i) => {
      const x = 40 + i * (boxW + gap), cx = x + boxW / 2;
      wires.push(d.line(cx, midY, cx, boxY, { color: c.dark, width: 2 }));
      boxes.push(card(x, boxY, boxW, boxH, leaf.text, { border: c.light, color: c.light }));
      if (leaf.note) {
        labels.push(d.label(cx, boxY + boxH + 60, leaf.note, { size: 32, color: c.yellow, anchor: "middle" }));
      }
    });
  }
  return d.svg(W, boxY + boxH + (opts.notes ? 90 : 20), ...d.layers(wires, boxes, labels));
}

// --- die party: das kennt ihr schon -----------------------------------------
window.drawParty = function (slide, step) {
  const leaves = ["drinks", "food", "music", "guests", "cleanup"].map((t) => ({ text: t }));
  const svg = tree("party, saturday, 30 guests", leaves, { show: step >= 1, rootSize: 48 });
  if ($("fig-party")) $("fig-party").innerHTML = svg;
  return svg;
};

// --- das problem des semesters, geschnitten ---------------------------------
window.drawCut = function (slide, step) {
  const leaves = [
    { text: "tell colours\napart", note: "challenge 1" },
    { text: "turn letters\ninto colours", note: "challenge 2" },
    { text: "find start\nand end", note: "challenge 3" },
    { text: "move a\nwhole file", note: "challenge 4" },
  ].map((l) => ({ text: l.text, note: step >= 2 ? l.note : "" }));
  const svg = tree("transfer a file with light", leaves, { show: step >= 1, boxW: 320, rootSize: 48, notes: true });
  if ($("fig-cut")) $("fig-cut").innerHTML = svg;
  return svg;
};

// --- die karte des moduls ----------------------------------------------------
/* Oben die grosse Frage des Moduls, darunter die Faehigkeiten, mit denen wir sie
 * angehen, und darunter die vier Fragen ueber Information. Alle vier stehen
 * gleichrangig: Das Projekt beruehrt jede von ihnen, wenn auch nicht gleich stark. */
function drawMap() {
  const c = d.colors();
  const parts = [];
  const qy = 70;
  parts.push(d.label(W / 2, qy, "how can we solve complex problems\nwith computers?",
    { size: 48, color: c.white, anchor: "middle", lineHeight: 1.25 }));
  parts.push(d.label(W / 2, qy + 130, "the skills for it:  cutting problems · input, processing, output · measuring · thinking in layers",
    { size: 32, color: c.gray, anchor: "middle" }));

  const cols = [
    { q: "how do computers\nrepresent information?", ex: "colours into symbols,\nletters into bits" },
    { q: "how do computers\nstore information?", ex: "a file is bytes;\nwhat holds them?" },
    { q: "how do computers\ntransfer information?", ex: "signal and noise,\ntiming, protocols" },
    { q: "how do computers\nprocess information?", ex: "checksums, filters,\nencryption" },
  ];
  const boxW = 370, gap = (W - 80 - 4 * boxW) / 3, boxY = 350, boxH = 160;
  const midY = 280;                      // Sammelhoehe, deutlich unter dem Text
  const first = 40 + boxW / 2, last = 40 + 3 * (boxW + gap) + boxW / 2;
  parts.push(d.line(W / 2, qy + 165, W / 2, midY, { color: c.dark, width: 2 }));
  parts.push(d.line(first, midY, last, midY, { color: c.dark, width: 2 }));
  cols.forEach((col, i) => {
    const x = 40 + i * (boxW + gap), cx = x + boxW / 2;
    parts.push(d.line(cx, midY, cx, boxY, { color: c.dark, width: 2 }));
  });
  cols.forEach((col, i) => {
    const x = 40 + i * (boxW + gap), cx = x + boxW / 2;
    parts.push(card(x, boxY, boxW, boxH, col.q, { border: c.light, color: c.light, lineHeight: 1.25 }));
    parts.push(d.label(cx, boxY + boxH + 56, col.ex, { size: 32, color: c.gray, anchor: "middle", lineHeight: 1.25 }));
  });
  const svg = d.svg(W, boxY + boxH + 100, ...parts);
  if ($("fig-map")) $("fig-map").innerHTML = svg;
  return svg;
}

/* --- halbieren: der suchbereich schrumpft mit jeder frage --------------------
 * Eine Zeile je Frage; alle Zeilen stehen von Anfang an, nur die Balken
 * kommen dazu. Die gesuchte 73 markiert eine rote Senkrechte. */
const HALVE = [
  { lo: 1, hi: 100, q: "1 to 100" },
  { lo: 51, hi: 100, q: "bigger than 50?  yes" },
  { lo: 51, hi: 75, q: "bigger than 75?  no" },
  { lo: 64, hi: 75, q: "bigger than 63?  yes" },
  { lo: 70, hi: 75, q: "bigger than 69?  yes" },
  { lo: 73, hi: 75, q: "bigger than 72?  yes" },
  { lo: 73, hi: 74, q: "bigger than 74?  no" },
  { lo: 73, hi: 73, q: "is it 73?  yes" },
];
window.drawHalve = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const x0 = 200, x1 = 1180, target = 73;
  const at = (v) => x0 + ((v - 1) / 100) * (x1 - x0);
  const rowH = 66, y0 = 40, barH = 30;
  HALVE.forEach((row, i) => {
    const y = y0 + i * rowH;
    if (i > step) return;                       // Zeile erscheint mit ihrem Schritt
    const count = row.hi - row.lo + 1;
    parts.push(d.label(x0 - 30, y + barH - 6, String(count), { size: 32, color: i === step ? c.white : c.gray, anchor: "end", mono: true }));
    parts.push(`<rect x="${at(row.lo)}" y="${y}" width="${Math.max(3, at(row.hi + 1) - at(row.lo))}" height="${barH}" rx="4" fill="${i === step ? c.blue : c.dark}"/>`);
    parts.push(d.label(x1 + 40, y + barH - 6, row.q, { size: 32, color: i === step ? c.white : c.gray, mono: true }));
  });
  // die gesuchte Zahl: eine duenne rote Senkrechte durch alle Zeilen
  const tx = at(target) + (at(target + 1) - at(target)) / 2;
  parts.push(d.line(tx, y0 - 14, tx, y0 + HALVE.length * rowH - 30, { color: c.red, width: 2 }));
  parts.push(d.label(tx, y0 - 24, "73", { size: 20, color: c.red, anchor: "middle", mono: true }));
  const svg = d.svg(W, y0 + HALVE.length * rowH - 10, ...parts);
  if ($("fig-halve")) $("fig-halve").innerHTML = svg;
  if ($("halve-caption")) {
    $("halve-caption").textContent = step >= 7 ? "seven questions are enough, whatever the number." : "";
  }
  return svg;
};

/* --- fehlersuche: in der mitte der kette testen ------------------------------ */
function chain(parts, y, title, items, testAfter, dim) {
  const c = d.colors();
  const n = items.length, boxW = 250, gap = 60, total = n * boxW + (n - 1) * gap;
  const x0 = (W - total) / 2;
  const wires = [], boxes = [], labels = [];
  labels.push(d.label(x0, y - 40, title, { size: 32, color: c.gray }));
  items.forEach((t, i) => {
    const x = x0 + i * (boxW + gap);
    const out = dim && i < testAfter;          // ausgeschlossene Haelfte
    if (i < n - 1) {
      wires.push(d.line(x + boxW, y + 45, x + boxW + gap, y + 45, { color: out ? c.dark : c.light, width: 2 }));
    }
    boxes.push(card(x, y, boxW, 90, t, { border: out ? c.dark : c.light, color: out ? c.dark : c.light }));
  });
  if (testAfter !== null) {
    // der Test sitzt in der Mitte der Kette, sein Pfeil endet ueber den Kaesten
    const tx = x0 + testAfter * (boxW + gap) - gap / 2;
    wires.push(d.arrow(tx, y - 70, tx, y - 6, { color: c.red, width: 3 }));
    labels.push(d.label(tx, y - 84, "test here", { size: 32, color: c.red, anchor: "middle" }));
  }
  parts.push(...d.layers(wires, boxes, labels));
}
window.drawDebug = function (slide, step) {
  const parts = [];
  chain(parts, 110, "wifi dead at home", ["laptop", "wifi", "router", "provider", "internet"],
        step >= 1 ? 2 : null, step >= 1);
  if (step >= 2) {
    chain(parts, 400, "nothing arrives in the project", ["sender", "led", "air", "sensor", "receiver"], 2, true);
  }
  const svg = d.svg(W, 520, ...parts);
  if ($("fig-debug")) $("fig-debug").innerHTML = svg;
  return svg;
};

/* --- die treppe: erst die kleinere fassung ---------------------------------- */
function drawStairs() {
  const c = d.colors();
  const parts = [];
  const steps = [
    { t: "light\non/off", n: "challenge 0" },
    { t: "multiple\ncolours", n: "challenge 1" },
    { t: "a letter", n: "challenge 2" },
    { t: "a word", n: "challenge 3" },
    { t: "a whole\nfile", n: "challenge 4" },
  ];
  const boxW = 260, gap = 60, x0 = 100, base = 560;
  steps.forEach((s, i) => {
    const x = x0 + i * (boxW + gap), h = 130 + i * 80, y = base - h;
    const here = i === 0;
    parts.push(card(x, y, boxW, h, s.t, {
      border: here ? c.blue : c.light, color: here ? c.bg : c.light, fill: here ? c.blue : c.bg,
    }));
    parts.push(d.label(x + boxW / 2, base + 46, s.n, { size: 32, color: here ? c.blue : c.gray, anchor: "middle" }));
  });
  parts.push(d.label(x0 + boxW / 2, base - 130 - 30, "you are here", { size: 32, color: c.blue, anchor: "middle" }));
  const svg = d.svg(W, base + 80, ...parts);
  if ($("fig-stairs")) $("fig-stairs").innerHTML = svg;
  return svg;
}

/* --- zwei kaesten im vergleich, der rechte mit dem test ---------------------- */
function twoBoxes(left, right, step, opts = {}) {
  const c = d.colors();
  const parts = [];
  const boxW = 700, boxH = 250, y = 70, gap = 120;
  const x0 = (W - 2 * boxW - gap) / 2, x1 = x0 + boxW + gap;
  const won = step >= 1;
  parts.push(d.label(x0 + boxW / 2, y - 40, opts.leftHead || "", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.label(x1 + boxW / 2, y - 40, opts.rightHead || "", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(card(x0, y, boxW, boxH, left, {
    border: won ? c.dark : c.light, color: won ? c.dark : c.light, size: opts.size || 48,
    mono: opts.mono, lineHeight: 1.3,
  }));
  parts.push(card(x1, y, boxW, boxH, right, {
    border: won ? c.green : c.light, color: won ? c.white : c.light, size: opts.size || 48,
    mono: opts.mono, lineHeight: 1.3,
  }));
  // der Haken steht unter dem Kasten, wie auf der Absprachen-Folie, und nie im Text
  if (won) parts.push(tick(x1 + boxW / 2, y + boxH + 70));
  return d.svg(W, y + boxH + 110, ...parts);
}
window.drawExam = function (slide, step) {
  const svg = twoBoxes("i need to learn maths.", "i can pass the 2023 exam\nin 90 minutes.", step);
  if ($("fig-exam")) $("fig-exam").innerHTML = svg;
  return svg;
};
window.drawProject = function (slide, step) {
  const svg = twoBoxes("the led works.", "red or blue?\nright 50 times in a row.", step);
  if ($("fig-project")) $("fig-project").innerHTML = svg;
  return svg;
};
window.drawMachine = function (slide, step) {
  const svg = twoBoxes("build me the\nfile transfer.",
    "read the sensor ten times\nand return the average.\ntest: covered, it stays under 10.\nred led on, it goes over 100.", step,
    { leftHead: "one big wish", rightHead: "one small piece, with its test", size: 32, mono: true });
  if ($("fig-machine")) $("fig-machine").innerHTML = svg;
  return svg;
};

/* --- absprachen: klare grenze gegen ueberlappung -----------------------------
 * Links zwei Kaesten, die sich eine Kante teilen; rechts dieselbe Arbeit, aber
 * die beiden Zustaendigkeiten ueberlappen. Die Ueberlappung ist die Aussage,
 * deshalb ist sie rot hinterlegt und traegt die Frage, die dann offen bleibt. */
function drawAgree() {
  const c = d.colors();
  const parts = [];
  const boxW = 340, boxH = 210, y = 40;

  // links: eine gemeinsame Kante, jeder weiss, was seins ist
  const lx = 110;
  parts.push(card(lx, y, boxW, boxH, "you:\nstarters", { border: c.light, color: c.light }));
  parts.push(card(lx + boxW, y, boxW, boxH, "me:\ndessert", { border: c.light, color: c.light }));
  parts.push(d.line(lx + boxW, y, lx + boxW, y + boxH, { color: c.green, width: 3, dashed: true }));
  parts.push(tick(lx + boxW, y + boxH + 80));
  parts.push(d.label(lx + boxW, y + boxH + 150, "works: the border is clear", { size: 32, color: c.gray, anchor: "middle" }));

  // rechts: zwei Kaesten, die sich ueberlappen; der Ueberschnitt ist die Aussage
  const rx = 940, rw = 380, ov = 180;
  const bx = rx + rw - ov;                       // linke Kante des zweiten Kastens
  parts.push(card(rx, y, rw, boxH, "", { border: c.light }));
  parts.push(card(bx, y, rw, boxH, "", { border: c.light }));
  // der Ueberschnitt kommt ueber die Kaesten: ihre Fuellung wuerde ihn sonst zudecken
  parts.push(`<rect x="${bx}" y="${y}" width="${ov}" height="${boxH}" fill="${c.red}" opacity="0.16"/>`);
  parts.push(d.line(bx, y, bx, y + boxH, { color: c.red, width: 3 }));
  parts.push(d.line(bx + ov, y, bx + ov, y + boxH, { color: c.red, width: 3 }));
  parts.push(d.label(rx + (rw - ov) / 2, y + boxH / 2 - 6, "you:\nthe food", { size: 32, color: c.light, anchor: "middle", lineHeight: 1.3 }));
  parts.push(d.label(bx + ov + (rw - ov) / 2, y + boxH / 2 - 6, "me:\nthe food", { size: 32, color: c.light, anchor: "middle", lineHeight: 1.3 }));
  parts.push(d.label(bx + ov / 2, y + boxH / 2 + 12, "?", { size: 48, color: c.red, anchor: "middle" }));
  const rc = bx + ov / 2;
  parts.push(cross(rc, y + boxH + 80));
  parts.push(d.label(rc, y + boxH + 150, "chaos: who buys the bread?", { size: 32, color: c.gray, anchor: "middle" }));

  const svg = d.svg(W, y + boxH + 190, ...parts);
  if ($("fig-agree")) $("fig-agree").innerHTML = svg;
  return svg;
}

// --- start -------------------------------------------------------------------
// Auf der Folie zeichnen; ohne Folie (figures.js fuer die Website) nur bereitstellen.
if ($("fig-map")) {
  drawMap(); drawStairs(); drawAgree();
}
window.deck01 = { party: window.drawParty, cut: window.drawCut, map: drawMap, halve: window.drawHalve,
                  debug: window.drawDebug, stairs: drawStairs, agree: drawAgree,
                  exam: window.drawExam, project: window.drawProject, machine: window.drawMachine };
