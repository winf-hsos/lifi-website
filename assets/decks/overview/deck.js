/* Zeichnungen fuer „overview" (Deck 00): die Karte des Moduls und das Geraet.
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Die Karte ist eine Funktion mit Optionen, damit sie im Semester wiederkehrt:
 *   drawMap({ step: 4 })                            der Aufbau in fuenf Schritten
 *   drawMap({ project: true })                      mit dem Projektstreifen darunter
 *   drawMap({ highlight: [...], caption: "…" })     eine Auswahl hervorgehoben, der Rest gedimmt
 *
 * Familien, Konzepte und Farben spiegeln concept-families.toml im Projektstamm
 * (dort die Quelle). Die Farben kommen nicht als Hex hierher, sondern ueber das
 * Theme: style.toml fuehrt sie als [colors.families], theme.py schreibt daraus
 * --families-<name>, und d.color("families-<name>") liest sie. Das ist die eine
 * bewusste Ausnahme von der Regel, dass Farbe auf Folien Bedeutung aus der
 * Achterpalette traegt: Hier IST die Farbe die Struktur, wie in der alten
 * Excalidraw-Karte. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

const LABELS = {
  "problem-decomposition": "cutting problems",
  "input-processing-output": "input, processing, output",
  "algorithms-and-programs": "algorithms and programs",
  "measurement-and-experiments": "measuring and experimenting",
  "abstraction-and-layers": "abstraction and layers",
  "analog-and-digital": "analog and digital",
  "symbols-and-information": "symbols and information",
  "number-systems": "number systems",
  "code-systems": "code systems",
  "memory": "memory",
  "files": "files",
  "signal-and-noise": "signal and noise",
  "sampling-and-synchronization": "sampling and sync",
  "protocols": "protocols",
  "errors-and-redundancy": "errors and redundancy",
  "throughput-and-limits": "throughput and limits",
  "logic-and-arithmetic": "logic and arithmetic",
  "compression": "compression",
  "encryption": "encryption",
};

const SOLVING = ["problem-decomposition", "input-processing-output", "algorithms-and-programs",
                 "measurement-and-experiments", "abstraction-and-layers"];

const FAMILIES = [
  { key: "represent", verb: "making bits", question: "how do computers\nrepresent information?",
    concepts: ["analog-and-digital", "symbols-and-information", "number-systems", "code-systems"] },
  { key: "store", verb: "storing bits", question: "how do computers\nstore information?",
    concepts: ["memory", "files"] },
  { key: "transfer", verb: "sending bits", question: "how do computers\ntransfer information?",
    concepts: ["signal-and-noise", "sampling-and-synchronization", "protocols", "errors-and-redundancy", "throughput-and-limits"] },
  { key: "process", verb: "processing bits", question: "how do computers\nprocess information?",
    concepts: ["logic-and-arithmetic", "compression", "encryption"] },
];

/* Welche Konzepte eine Challenge braucht; die Zuordnung der Konzeptseiten
 * („where you need it") in derselben Lesart. */
const CHALLENGES = [
  { name: "the spark", question: "can you bring your device to life?",
    concepts: ["input-processing-output", "algorithms-and-programs", "problem-decomposition"] },
  { name: "the alphabet", question: "how many signals can your receiver tell apart?",
    concepts: ["analog-and-digital", "symbols-and-information", "signal-and-noise", "measurement-and-experiments"] },
  { name: "the word", question: "can you send a whole word, and how fast?",
    concepts: ["code-systems", "number-systems", "sampling-and-synchronization", "protocols", "abstraction-and-layers"] },
  { name: "the listener", question: "can the receiver find the start on its own?",
    concepts: ["protocols"] },
  { name: "the packet", question: "can you send a real file, correct and fast?",
    concepts: ["logic-and-arithmetic", "errors-and-redundancy", "memory", "files", "compression", "throughput-and-limits", "encryption"] },
];

const fam = (key) => d.color(`families-${key}`);

/* Ein Kasten in Familienfarbe, Breite aus dem Text (Codeschrift 20 px: 12 px je Zeichen). */
const chipWidth = (text) => text.length * 12 + 28;
function chip(x, y, text, fill, c, dim) {
  const s = d.box(x, y, chipWidth(text), 40, text, { fill, border: null, color: c.white, size: 20, mono: true, rx: 4 });
  return dim ? `<g opacity="0.22">${s}</g>` : s;
}

/* --- Die Karte ------------------------------------------------------------ */

window.drawMap = function (o = {}) {
  const c = d.colors();
  const step = o.step === undefined ? 4 : o.step;
  const hl = o.highlight ? new Set(o.highlight) : null;
  const dim = (key) => hl !== null && !hl.has(key);
  const parts = [];
  const W = 1680, mid = W / 2;

  // Die grosse Frage, immer an derselben Stelle
  parts.push(d.label(mid, 0, "how can we solve complex problems with computers?", { size: 48, color: c.white, anchor: "middle", centerY: 130 }));

  // Schritt 4: die Arbeitsweisen darueber, grau, eine Reihe
  if (step >= 4) {
    const gap = 16, total = SOLVING.reduce((a, k) => a + chipWidth(LABELS[k]), 0) + gap * (SOLVING.length - 1);
    let x = mid - total / 2;
    SOLVING.forEach((k) => { parts.push(chip(x, 16, LABELS[k], fam("solving"), c, dim(k))); x += chipWidth(LABELS[k]) + gap; });
  }

  const cols = [210, 630, 1050, 1470];
  FAMILIES.forEach((f, i) => {
    const cx = cols[i];
    // Schritt 1: Pfeil und Frage
    if (step >= 1) {
      parts.push(d.arrow(mid + (i - 1.5) * 120, 172, cx, 232, { color: c.light }));
      parts.push(d.label(cx, 0, f.question, { size: 32, color: c.white, anchor: "middle", centerY: 285 }));
    }
    // Schritt 2: das Verb
    if (step >= 2) {
      const w = chipWidth(f.verb);
      parts.push(chip(cx - w / 2, 350, f.verb, fam(f.key), c, false));
    }
    // Schritt 3: die Konzepte
    if (step >= 3) {
      f.concepts.forEach((k, j) => {
        const w = chipWidth(LABELS[k]);
        parts.push(chip(cx - w / 2, 420 + j * 50, LABELS[k], fam(f.key), c, dim(k)));
      });
    }
  });

  // Unten: der Projektstreifen oder eine Bildunterschrift
  if (o.project) {
    const y = 700;
    parts.push(d.box(480, y, 720, 84, "", { border: c.gray, fill: "none", rx: 12 }));
    parts.push(d.label(mid, 0, "the lifi project", { size: 20, color: c.gray, anchor: "middle", centerY: y - 16 }));
    parts.push(d.box(510, y + 20, 90, 44, "file", { border: c.white, size: 20, mono: true, rx: 4 }));
    parts.push(d.arrow(600, y + 42, 650, y + 42, { color: c.white }));
    parts.push(d.box(650, y + 16, 100, 52, "led", { fill: c.white, border: null, color: c.bg, size: 20, mono: true, rx: 4 }));
    ["represent", "store", "process", "transfer"].forEach((k, j) => {
      parts.push(`<rect x="${790 + j * 58}" y="${y + 35}" width="44" height="14" rx="2" fill="${fam(k)}"/>`);
    });
    parts.push(d.arrow(1030, y + 42, 1080, y + 42, { color: c.white }));
    parts.push(d.box(1080, y + 16, 110, 52, "sensor", { fill: c.white, border: null, color: c.bg, size: 20, mono: true, rx: 4 }));
    parts.push(d.label(mid, 0, "one project, four questions: the file is stored, its bytes represent a picture, a checksum processes them, the light transfers them.",
                       { size: 20, color: c.gray, anchor: "middle", centerY: 812 }));
  } else if (o.caption) {
    parts.push(d.label(mid, 0, o.caption, { size: 48, color: c.yellow, anchor: "middle", centerY: 740 }));
  }
  return put("fig-map", d.svg(W, 840, ...parts));
};

/* Aufbau in fuenf Schritten (Folie „the map") */
window.mapSteps = function (_slide, step = 0) {
  const svg = window.drawMap({ step });
  const el = $("fig-map-steps"); if (el) el.innerHTML = svg;
  return svg;
};

/* Je Schritt eine Challenge (Folie „where each challenge sits on the map") */
window.mapChallenges = function (_slide, step = 0) {
  const ch = CHALLENGES[Math.min(step, CHALLENGES.length - 1)];
  const svg = window.drawMap({ highlight: ch.concepts, caption: `challenge ${step}: ${ch.name}` });
  const el = $("fig-map-challenges"); if (el) el.innerHTML = svg;
  return svg;
};

/* --- Das Geraet ------------------------------------------------------------ */

/* Zwei Geraete von oben: Lampe und Auge auf der Vorderseite, ein Steg dazwischen.
 * Das Gegenueber steht gedreht, deshalb schaut sein Auge auf meine Lampe. Licht
 * in Gelb (Strom), der Rueckweg gestrichelt und grau, weil er erst im Finale
 * benutzt wird. */
window.drawDevice = function () {
  const c = d.colors();
  const parts = [];
  const geraet = (x, spiegel) => {
    const front = spiegel ? x : x + 400;                 // die Vorderseite zeigt zum Gegenueber
    const innen = spiegel ? x + 60 : x + 220;            // Spalte fuer Lampe und Auge
    parts.push(d.box(x, 160, 400, 300, "", { border: c.white, rx: 12 }));
    parts.push(d.label(x + 200, 0, spiegel ? "your partner's device" : "your device", { size: 20, color: c.gray, anchor: "middle", centerY: 130 }));
    // Lampe oben, Auge unten (beim Gegenueber umgekehrt, weil es gedreht steht)
    const oben = spiegel ? "sensor" : "led", unten = spiegel ? "led" : "sensor";
    parts.push(d.box(innen, 190, 120, 100, oben, { fill: c.white, border: null, color: c.bg, size: 20, mono: true, rx: 6 }));
    parts.push(d.box(innen, 330, 120, 100, unten, { fill: c.white, border: null, color: c.bg, size: 20, mono: true, rx: 6 }));
    // der Steg: ein Stueck Wand, das aus der Vorderseite ragt
    parts.push(d.line(spiegel ? front - 40 : front - 190, 310, spiegel ? front + 190 : front + 40, 310, { color: c.light, width: 6 }));
    parts.push(d.label(spiegel ? front + 200 : front - 200, 0, "wall", { size: 20, color: c.gray, anchor: spiegel ? "start" : "end", centerY: 310 }));
    // usb zum laptop
    parts.push(d.line(x + 200, 460, x + 200, 520, { color: c.gray }));
    parts.push(d.label(x + 200, 0, "usb, to your laptop", { size: 20, color: c.gray, anchor: "middle", centerY: 545 }));
  };
  geraet(240, false);
  geraet(1040, true);
  // Licht hin (gelb) und der Rueckweg (gestrichelt, grau)
  parts.push(d.arrow(650, 240, 1030, 240, { color: c.yellow, width: 4 }));
  parts.push(d.label(840, 0, "light", { size: 32, color: c.yellow, anchor: "middle", centerY: 205 }));
  parts.push(d.arrow(1030, 380, 650, 380, { color: c.dark, width: 3 }));
  parts.push(d.label(840, 0, "the way back, from challenge 4 on", { size: 20, color: c.gray, anchor: "middle", centerY: 415 }));
  return put("fig-device", d.svg(1680, 580, ...parts));
};

/* --- Die vier Fragen, je ein Satz --------------------------------------------- */

const ONE_LINERS = {
  represent: "to a computer, your photo is a list of numbers, and the numbers are states of something physical.",
  store: "the photo has to sit somewhere before it is sent, and somewhere after it arrives.",
  transfer: "the receiver does not know when a letter begins. the light it sees is never the light that was sent.",
  process: "somebody has to turn the numbers back into a picture, and check whether they arrived correctly.",
};

window.drawFour = function () {
  const c = d.colors();
  const parts = [];
  FAMILIES.forEach((f, i) => {
    const y = 70 + i * 130;
    parts.push(d.label(260, 0, f.key, { size: 32, mono: true, color: fam(f.key), anchor: "end", centerY: y }));
    parts.push(d.label(320, 0, ONE_LINERS[f.key], { size: 32, color: c.white, centerY: y }));
  });
  return put("fig-four", d.svg(1680, 480, ...parts));
};

/* --- Die fuenf Challenges als Tafel ------------------------------------------- */

window.drawChallenges = function () {
  const c = d.colors();
  const parts = [];
  CHALLENGES.forEach((ch, i) => {
    const y = 60 + i * 110;
    parts.push(d.label(120, 0, String(i), { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: y }));
    parts.push(d.label(200, 0, ch.name, { size: 32, color: c.white, centerY: y }));
    parts.push(d.label(520, 0, ch.question, { size: 32, color: c.light, centerY: y }));
  });
  return put("fig-challenges", d.svg(1680, 540, ...parts));
};

/* --- Drei Dinge, die jede Challenge hervorbringt ------------------------------ */

window.drawProduces = function () {
  const c = d.colors();
  const parts = [];
  const spalten = [
    ["measurement logs", "what did you change,\nwhat did you keep the same,\nand what came out?"],
    ["a description of your solution", "enough for another team\nto rebuild it. from challenge 3 on,\na full protocol specification."],
    ["a log of mistakes", "where the assistant suggested\nsomething, and a measurement\nproved it wrong."],
  ];
  spalten.forEach(([titel, text], i) => {
    const x = 40 + i * 540, w = 520;
    parts.push(d.box(x, 40, w, 360, "", { border: c.gray, rx: 12 }));
    parts.push(d.label(x + w / 2, 0, titel, { size: 32, color: i === 2 ? c.yellow : c.white, anchor: "middle", centerY: 100 }));
    parts.push(d.label(x + w / 2, 0, text, { size: 32, color: c.light, anchor: "middle", centerY: 250 }));
  });
  return put("fig-produces", d.svg(1680, 440, ...parts));
};

/* --- Start --------------------------------------------------------------------- */

if ($("fig-device")) {
  window.drawDevice();
  window.drawMap({ project: true });
  window.drawFour();
  window.drawChallenges();
  window.drawProduces();
}

window.deck00 = {
  map: window.drawMap,
  device: window.drawDevice,
  four: window.drawFour,
  challenges: window.drawChallenges,
  produces: window.drawProduces,
  LABELS, FAMILIES, SOLVING, CHALLENGES,
};
