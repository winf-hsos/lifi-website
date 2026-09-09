/* Zeichnungen fuer „what light means" (Symbole und Information).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

function feld(x, y, w, h, fill, rx = 6) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
}

/* Die vier Farben, die die Leuchtdiode wirklich aussendet. Ausnahme von der
 * Regel „keine Hex-Werte im Deck": Hier stehen die Namen daneben, und die
 * Palette benennt Rollen, keine Farben (in der hellen Fassung waeren „green"
 * und „blue" zwei Blautoene). Diese vier muessen in jedem Theme gleich
 * aussehen, weil sie den Gegenstand zeigen und nicht die Bedeutung. */
const LICHT = { red: "#e03131", green: "#2f9e44", blue: "#1971c2", yellow: "#f2b705" };

/* --- 1. perfekter Empfang, perfekter Unsinn ------------------------------ */

window.drawNonsense = function (_slide, step = 0) {
  const c = d.colors();
  const farben = [["red", LICHT.red], ["green", LICHT.green],
                  ["blue", LICHT.blue], ["yellow", LICHT.yellow]];
  const sender = ["a", "b", "c", "d"];
  const empfaenger = ["b", "c", "d", "a"];
  const x0 = 120, breite = 520, zeile = 78, oben = 120;
  const parts = [];

  const tabelle = (x, titel, zuordnung, farbe) => {
    parts.push(d.label(x, oben - 40, titel, { size: 32, color: c.gray }));
    farben.forEach(([name, col], i) => {
      const y = oben + i * zeile;
      parts.push(feld(x, y, 44, 44, col));
      parts.push(d.label(x + 70, 0, name, { size: 32, color: c.light, centerY: y + 22 }));
      parts.push(d.label(x + 250, 0, "→", { size: 32, color: c.dark, centerY: y + 22 }));
      parts.push(d.label(x + 320, 0, zuordnung[i], { size: 32, color: farbe, mono: true, centerY: y + 22 }));
    });
  };

  tabelle(x0, "the sender's table", sender, c.white);
  if (step >= 1) tabelle(x0 + 900, "the receiver's table", empfaenger, c.red);
  else parts.push(d.label(x0 + 900, oben - 40, "the receiver's table", { size: 32, color: c.gray }));

  // die vier gesendeten Farben und das Ergebnis
  const y = oben + 4 * zeile + 70;
  parts.push(d.label(x0, 0, "sent:", { size: 32, color: c.gray, centerY: y + 22 }));
  ["red", "green", "blue", "red"].forEach((name, i) => {
    const col = farben.find(([n]) => n === name)[1];
    parts.push(feld(x0 + 130 + i * 64, y, 44, 44, col));
  });
  parts.push(d.label(x0 + 420, 0, "→  abca", { size: 32, color: c.white, mono: true, centerY: y + 22 }));
  if (step >= 1) {
    parts.push(d.label(x0 + 900, 0, "read as:", { size: 32, color: c.gray, centerY: y + 22 }));
    parts.push(d.label(x0 + 1120, 0, "bcdb", { size: 32, color: c.red, mono: true, centerY: y + 22 }));
  }
  return put("fig-nonsense", d.svg(1680, y + 120, ...parts));
};

/* --- 2. das Kartenraten, halbiert ---------------------------------------- */

window.drawHalving = function (_slide, step = 0) {
  const c = d.colors();
  const zahlen = [32, 16, 8, 4, 2, 1];
  // sechs Kaesten muessen in die Breite passen: 6*170 + 5*80 = 1420, mittig auf 1680
  const x0 = 130, w = 170, luecke = 80, y = 150, h = 130;
  const wires = [], boxes = [], labels = [];
  const sichtbar = step >= 1 ? 5 : 0;

  for (let i = 0; i <= sichtbar; i += 1) {
    const x = x0 + i * (w + luecke);
    const jetzt = i === sichtbar;
    boxes.push(d.box(x, y, w, h, String(zahlen[i]), {
      size: 48, mono: true, border: jetzt ? c.white : c.dark, color: jetzt ? c.white : c.light,
    }));
    if (i > 0) {
      wires.push(d.arrow(x - luecke, y + h / 2, x, y + h / 2, { color: c.gray, width: 3 }));
      labels.push(d.label(x - luecke / 2, y - 30, "?", { size: 32, color: c.yellow, anchor: "middle" }));
    }
  }
  labels.push(d.label(x0, y - 60, "possibilities left", { size: 20, color: c.gray }));
  if (step >= 2) {
    labels.push(d.label(840, y + h + 90, "each question halves what is left",
                        { size: 32, color: c.gray, anchor: "middle" }));
  }
  return put("fig-halving", d.svg(1680, y + h + 140, ...d.layers(wires, boxes, labels)));
};

/* --- 3. die halbierende gegen die schiefe Frage -------------------------- */

window.drawQuestions = function () {
  const c = d.colors();
  const spalten = [
    { x: 90, frage: '"is it red?"', farbe: c.green,
      zeilen: [["yes", "16 left"], ["no", "16 left"]], fuss: "always exactly one halving" },
    { x: 900, frage: '"is it the ace of spades?"', farbe: c.red,
      zeilen: [["yes", "0 left, solved"], ["no", "31 left"]], fuss: "almost always the second line" },
  ];
  const parts = [];
  spalten.forEach(({ x, frage, farbe, zeilen, fuss }) => {
    parts.push(d.label(x, 60, frage, { size: 32, color: farbe, mono: true }));
    parts.push(d.line(x, 90, x + 690, 90, { color: c.dark, width: 2 }));
    zeilen.forEach(([antwort, rest], i) => {
      const y = 160 + i * 80;
      parts.push(d.label(x, y, antwort, { size: 32, color: c.light, mono: true }));
      parts.push(d.label(x + 180, y, "→", { size: 32, color: c.dark }));
      parts.push(d.label(x + 260, y, rest, { size: 32, color: c.white }));
    });
    parts.push(d.label(x, 370, fuss, { size: 32, color: c.gray }));
  });
  parts.push(d.line(830, 30, 830, 410, { color: c.dark, width: 2 }));
  return put("fig-questions", d.svg(1680, 450, ...parts));
};

/* --- 4. was eine Frage im Schnitt wert ist ------------------------------- */

window.drawWorth = function () {
  const c = d.colors();
  const spalten = [80, 620, 880, 1130, 1420];
  const kopf = ["question", "answer", "chance", "you learn", "on average"];
  const zeilen = [
    ['"is it red?"', "yes", "1/2", "1 bit", "1 bit", c.green],
    ["", "no", "1/2", "1 bit", "", c.green],
    ['"is it the ace of spades?"', "yes", "1/32", "5 bit", "0.2 bit", c.red],
    ["", "no", "31/32", "0.05 bit", "", c.red],
  ];
  const parts = [];
  kopf.forEach((t, j) => parts.push(d.label(spalten[j], 60, t, { size: 20, color: c.gray })));
  parts.push(d.line(60, 90, 1620, 90, { color: c.dark, width: 2 }));
  zeilen.forEach((zeile, i) => {
    const y = 160 + i * 80;
    for (let j = 0; j < 5; j += 1) {
      const wert = zeile[j];
      if (!wert) continue;
      const farbe = j === 4 ? zeile[5] : (j === 0 ? zeile[5] : c.light);
      parts.push(d.label(spalten[j], y, wert, { size: 32, color: farbe, mono: j > 0 }));
    }
    if (i === 1) parts.push(d.line(60, y + 40, 1620, y + 40, { color: c.dark, width: 2 }));
  });
  parts.push(d.label(80, 520, "a rare answer tells you a lot. an expected answer tells you little.",
                     { size: 32, color: c.gray }));
  return put("fig-worth", d.svg(1680, 570, ...parts));
};

/* --- 4b. der Erwartungswert, allgemein ----------------------------------- */

window.drawExpected = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.label(90, 70, "in words", { size: 20, color: c.gray }),
    d.label(90, 130, "how likely an answer is  ×  what that answer is worth,  added up",
            { size: 32, color: c.light }),
    d.label(90, 250, "in symbols", { size: 20, color: c.gray }),
    d.formula(90, 320, "E = Σ p_i · log_2(1/p_i)", { size: 48, color: c.white }),
    d.formula(90, 420, "p_i", { size: 32, color: c.yellow }),
    d.label(560, 420, "how likely that answer is", { size: 32, color: c.gray }),
    d.formula(90, 480, "log_2(1/p_i)", { size: 32, color: c.yellow }),
    d.label(560, 480, "what that answer is worth, in bits", { size: 32, color: c.gray }),
  ];
  if (step >= 1) {
    parts.push(d.label(90, 600, "the two questions from before", { size: 20, color: c.gray }));
    parts.push(d.formula(90, 670, "0.5 · 1 + 0.5 · 1 = 1 bit", { size: 32, color: c.green }));
    parts.push(d.formula(90, 730, "0.03 · 5 + 0.97 · 0.05 = 0.2 bit", { size: 32, color: c.red }));
  }
  return put("fig-expected", d.svg(1680, 780, ...parts));
};

/* --- 5. ein Bit, und die beiden Formeln ---------------------------------- */

window.drawBit = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.box(200, 60, 260, 160, "0", { size: 80, mono: true, border: c.dark, color: c.light }),
    d.box(520, 60, 260, 160, "1", { size: 80, mono: true, border: c.yellow, color: c.yellow }),
    d.label(200, 280, "one bit = one decision between two possibilities",
            { size: 32, color: c.white }),
  ];
  if (step >= 1) {
    parts.push(d.formula(200, 430, "H = log_2(N)", { size: 48, color: c.white }));
    parts.push(d.label(660, 430, "uncertainty: how many halvings are still missing",
                       { size: 32, color: c.gray }));
    parts.push(d.formula(200, 530, "I = H_1 - H_2", { size: 48, color: c.white }));
    parts.push(d.label(660, 530, "information: what an answer removed",
                       { size: 32, color: c.gray }));
    parts.push(d.label(200, 620, "32 cards are not the uncertainty. the 5 is.",
                       { size: 32, color: c.yellow }));
  }
  return put("fig-bit", d.svg(1680, 670, ...parts));
};

/* --- 6. was ein groesseres Alphabet einbringt ---------------------------- */

window.drawAlphabetBits = function (_slide, step = 0) {
  const c = d.colors();
  const zeilen = [
    { farben: 2, bits: 1, laenge: 1.0 },
    { farben: 4, bits: 2, laenge: 0.5 },
    { farben: 8, bits: 3, laenge: 1 / 3 },
    { farben: 16, bits: 4, laenge: 0.25 },
  ];
  const parts = [
    d.label(80, 60, "colours", { size: 20, color: c.gray }),
    d.label(330, 60, "bits per symbol", { size: 20, color: c.gray }),
  ];
  if (step >= 1) parts.push(d.label(700, 60, "time for the same file, at the same symbol rate", { size: 20, color: c.gray }));
  parts.push(d.line(60, 90, 1620, 90, { color: c.dark, width: 2 }));

  zeilen.forEach((z, i) => {
    const y = 150 + i * 110;
    parts.push(d.label(80, 0, String(z.farben), { size: 32, color: c.white, mono: true, centerY: y }));
    parts.push(d.formula(330, 0, `log_2(${z.farben}) = ${z.bits}`, { size: 32, color: c.light, centerY: y }));
    if (step >= 1) {
      const voll = 820;
      parts.push(feld(700, y - 26, voll * z.laenge, 52, i === 0 ? c.gray : c.blue, 4));
      parts.push(d.label(700 + voll * z.laenge + 24, 0, `${Math.round(100 * z.laenge)} %`,
                         { size: 32, color: c.gray, mono: true, centerY: y }));
    }
  });
  return put("fig-alphabet-bits", d.svg(1680, 640, ...parts));
};

/* --- 7. zwei Symbole genuegen -------------------------------------------- */

window.drawGroups = function () {
  const c = d.colors();
  const muster = ["10110", "00001", "11111", "01010"];
  const parts = [
    d.label(90, 60, "two symbols, five flashes per character", { size: 32, color: c.gray }),
  ];
  muster.forEach((bits, r) => {
    const y = 120 + r * 96;
    bits.split("").forEach((b, i) => {
      const an = b === "1";
      parts.push(feld(90 + i * 96, y, 72, 72, an ? c.yellow : c.dark, 8));
    });
    parts.push(d.label(600, 0, bits, { size: 32, color: c.light, mono: true, centerY: y + 36 }));
  });
  parts.push(d.formula(860, 0, "2^5 = 32", { size: 80, color: c.white, centerY: 260 }));
  parts.push(d.label(860, 400, "32 combinations: room for a whole alphabet",
                     { size: 32, color: c.gray }));
  return put("fig-groups", d.svg(1680, 540, ...parts));
};

/* --- 8. wenn Symbole nicht gleich wahrscheinlich sind -------------------- */

window.drawMorse = function () {
  const c = d.colors();
  const zeilen = [
    ["e", ".", "most common letter", c.yellow],
    ["t", "-", "", c.light],
    ["q", "- - . -", "rare letter", c.gray],
  ];
  const parts = [];
  zeilen.forEach(([buchstabe, code, notiz, farbe], i) => {
    const y = 100 + i * 150;
    parts.push(d.label(140, 0, buchstabe, { size: 80, color: farbe, mono: true, centerY: y }));
    // der Code als Punkte und Striche, damit die Laenge sichtbar ist
    let x = 380;
    code.split(" ").forEach((z) => {
      if (z === ".") { parts.push(feld(x, y - 14, 28, 28, farbe, 14)); x += 60; }
      else { parts.push(feld(x, y - 14, 88, 28, farbe, 6)); x += 120; }
    });
    if (notiz) parts.push(d.label(900, 0, notiz, { size: 32, color: c.gray, centerY: y }));
  });
  parts.push(d.label(140, 520, "in real text, symbols are not equally likely",
                     { size: 32, color: c.gray }));
  return put("fig-morse", d.svg(1680, 570, ...parts));
};

/* --- 9. der Haken --------------------------------------------------------- */

window.drawCatch = function () {
  const c = d.colors();
  const parts = [
    d.box(90, 60, 700, 380, "", { border: c.green, rounded: true, fill: "none" }),
    d.box(890, 60, 700, 380, "", { border: c.red, rounded: true, fill: "none" }),
    d.label(140, 140, "the payoff", { size: 48, color: c.green }),
    d.label(940, 140, "the price", { size: 48, color: c.red }),
  ];
  [["more bits per symbol", "the same file needs fewer symbols", "and arrives sooner"],
   ["the colours move closer together", "noise reaches across the gap", "and symbols are read wrong"]]
    .forEach((zeilen, spalte) => {
      zeilen.forEach((t, i) => {
        parts.push(d.label(140 + spalte * 800, 240 + i * 60, t, { size: 32, color: c.light }));
      });
    });
  return put("fig-catch", d.svg(1680, 480, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-questions")) {
  window.drawQuestions();
  window.drawWorth();
  window.drawGroups();
  window.drawMorse();
  window.drawCatch();
}

window.deck06 = {
  nonsense: window.drawNonsense,
  halving: window.drawHalving,
  questions: window.drawQuestions,
  worth: window.drawWorth,
  expected: window.drawExpected,
  bit: window.drawBit,
  alphabetBits: window.drawAlphabetBits,
  groups: window.drawGroups,
  morse: window.drawMorse,
  catch: window.drawCatch,
};
