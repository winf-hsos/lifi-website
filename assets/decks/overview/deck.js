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
  "memory-and-storage": "memory and storage",
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
    concepts: ["memory-and-storage"] },
  { key: "transfer", verb: "transferring bits", question: "how do computers\ntransfer information?",
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
    concepts: ["logic-and-arithmetic", "errors-and-redundancy", "memory-and-storage", "compression", "throughput-and-limits", "encryption"] },
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
  parts.push(d.label(mid, 0, "how do computers solve complex problems?", { size: 48, color: c.white, anchor: "middle", centerY: 130 }));

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

/* Zwei Geraete von oben. Lampe (led) und Auge (sensor) sitzen aussen an der
 * Vorderwand des Kastens, nicht darin. Das Gegenueber steht gedreht, deshalb
 * liegt seine Lampe unten und sein Auge oben, und jede Lampe schaut auf ein Auge.
 * Das Licht laeuft als kleine Pakete hinueber, oben hin, unten zurueck.
 * Begruendete Ausnahme von der Regel „Farbe nur aus dem Theme": Die Pakete sind
 * Licht in echten Farben wie im Experiment; Beschriftungen und Pfeile bleiben
 * deshalb grau und weiss, nichts anderes traegt hier Farbe.
 * Geometrie: Kaesten 300 x 320 bei x = 40 und x = 740, Vorderwaende bei x = 340
 * und x = 740; Bauteile 36 x 72 mittig auf der Wand, Mitten bei y = 210 und 370.
 * Die unterste Beschriftung sitzt bei y = 520, die viewBox endet bei 540. */
const PACKETS = ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,255,0)", "rgb(255,0,0)"];

window.drawDevice = function () {
  const c = d.colors();
  const wires = [], shapes = [], labels = [];
  const Y = 130, W = 300, H = 320, L = 40, R = 740, TOP = 210, BOT = 370;
  [[L, "your device"], [R, "your partner's device"]].forEach(([x, name]) => {
    shapes.push(d.box(x, Y, W, H, "", { border: c.white, rx: 12 }));
    labels.push(d.label(x + W / 2, 0, name, { size: 20, color: c.gray, anchor: "middle", centerY: Y - 30 }));
    wires.push(d.line(x + W / 2, Y + H, x + W / 2, Y + H + 44, { color: c.gray }));
    labels.push(d.label(x + W / 2, 0, "usb, to your laptop", { size: 20, color: c.gray, anchor: "middle", centerY: Y + H + 70 }));
  });
  const bauteil = (wx, cy) => shapes.push(d.box(wx - 18, cy - 36, 36, 72, "", { fill: c.white, border: null, rx: 4 }));
  bauteil(L + W, TOP); bauteil(L + W, BOT); bauteil(R, TOP); bauteil(R, BOT);
  labels.push(d.label(L + W - 40, 0, "led", { size: 20, mono: true, color: c.light, anchor: "end", centerY: TOP }));
  labels.push(d.label(L + W - 40, 0, "sensor", { size: 20, mono: true, color: c.light, anchor: "end", centerY: BOT }));
  labels.push(d.label(R + 40, 0, "sensor", { size: 20, mono: true, color: c.light, centerY: TOP }));
  labels.push(d.label(R + 40, 0, "led", { size: 20, mono: true, color: c.light, centerY: BOT }));
  // die beiden Richtungen: Pfeil hinter den Paketen, fuenf Pakete je Richtung
  wires.push(d.arrow(372, TOP, 708, TOP, { color: c.gray }));
  wires.push(d.arrow(708, BOT, 372, BOT, { color: c.gray }));
  PACKETS.forEach((col, i) => {
    shapes.push(`<rect x="${414 + i * 56}" y="${TOP - 14}" width="28" height="28" rx="3" fill="${col}"/>`);
    shapes.push(`<rect x="${414 + i * 56}" y="${BOT - 14}" width="28" height="28" rx="3" fill="${PACKETS[(i + 2) % PACKETS.length]}"/>`);
  });
  labels.push(d.label(540, 0, "light", { size: 20, color: c.gray, anchor: "middle", centerY: TOP - 44 }));
  return put("fig-device", d.svg(1080, 540, ...d.layers(wires, shapes, labels)));
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

/* --- Experiment „you are the receiver" ----------------------------------------
 *
 * Der Beamer ist die Lampe: Die Flaeche .lamp leuchtet nacheinander in den
 * Farben einer Runde, der Saal schreibt mit. Gestartet wird mit dem Knopf in
 * der Lampe oder der Taste S; die Aufloesung ist Schritt 1 der Folie.
 * Runde 1 ist leicht, die Runden 2 bis 5 stehen je fuer eine Challenge und in
 * derselben Reihenfolge wie die Zeilen auf „what went wrong?".
 *
 * Begruendete Ausnahme von der Regel „Farbe nur aus dem Theme": Hier sind die
 * Farben keine Rollen, sondern das gesendete Licht selbst. Das Alphabet ist
 * Rot, Gruen, Blau, Gelb; Weiss, Tuerkis, Magenta und Orange gehoeren nicht
 * dazu (Runde 4); dazu acht Blautoene, die sich nur in der Helligkeit
 * unterscheiden (Runde 2). Deshalb stehen sie als Farbwerte hier und nirgends sonst. */

const FLASH = { r: "rgb(255,0,0)", g: "rgb(0,255,0)", b: "rgb(0,0,255)", y: "rgb(255,255,0)",
                w: "rgb(255,255,255)", c: "rgb(0,255,255)", m: "rgb(255,0,255)", o: "rgb(255,140,0)" };
const BLUES = [22, 28, 34, 40, 46, 52, 58, 64].map((l) => `hsl(225 100% ${l}%)`);
const sp = (s) => (s ? s.split(" ") : []);

/* on/off in Millisekunden; off = 0 heisst: kein Schwarz dazwischen.
 * mark: Stellen, die die Aufloesung gelb zeigt. short: Stellen mit eigener
 * (kurzer) Dauer. before/after: Farben ausserhalb des Alphabets. */
const ROUNDS = {
  1: { seq: sp("g r y b r y g b"), on: 1500, off: 400, countdown: true },
  2: { seq: sp("3 7 1 5 8 2 6 4"), on: 2000, off: 500, countdown: true, blues: true },
  // keine zwei gleichen Farben hintereinander ausser der gewollten doppelten
  3: { seq: sp("r y g g b r y b g r b y"), on: 450, off: 0, countdown: true, mark: [2, 3] },
  4: { before: sp("w c m o c w m"), seq: sp("g b r y g r"), after: sp("m w o c w"), on: 700, off: 0, countdown: false },
  // die fuenfte Farbe blitzt nur 70 ms: kaum jemand sieht sie
  5: { seq: sp("y g r b g y b r"), on: 1500, off: 400, countdown: true, short: { 4: 70 }, mark: [4] },
};

const colourOf = (round, s) => (round.blues ? BLUES[Number(s) - 1] : FLASH[s]);

/* Die Aufloesung je Runde (Schritt 1) und die Legenden des Alphabets. */
function fillRounds() {
  Object.entries(ROUNDS).forEach(([n, r]) => {
    const el = $(`sent-${n}`);
    if (!el) return;
    const dots = (list) => (list && list.length ? `<span class="noise">${list.map(() => "·").join(" ")}</span>` : "");
    const seq = r.seq.map((s, i) => ((r.mark || []).includes(i) ? `<span class="mark">${s}</span>` : s)).join(" ");
    el.innerHTML = [dots(r.before), seq, dots(r.after)].filter(Boolean).join(" ");
  });
  document.querySelectorAll(".legend[data-alphabet]").forEach((lg) => {
    const items = lg.dataset.alphabet === "blues"
      ? BLUES.map((col, i) => [col, String(i + 1)])
      : ["r", "g", "b", "y"].map((k) => [FLASH[k], k]);
    lg.innerHTML = `<span class="lbl">alphabet</span>` +
      items.map(([col, k]) => `<span class="item"><span class="sw" style="background: ${col}"></span>${k}</span>`).join("");
  });
}

let running = null;          // Kennung des laufenden Durchgangs; ein neuer bricht den alten ab

function lampOff(lamp) { lamp.style.background = ""; lamp.textContent = ""; }

function runRound(slide) {
  const round = ROUNDS[slide.dataset.round];
  const lamp = slide.querySelector(".lamp");
  if (!round || !lamp) return;
  const steps = [];
  if (round.countdown) ["3", "2", "1"].forEach((t) => steps.push({ text: t, ms: 800 }));
  steps.push({ ms: 500 });
  const flash = (s, ms) => { steps.push({ colour: colourOf(round, s), ms }); if (round.off) steps.push({ ms: round.off }); };
  (round.before || []).forEach((s) => flash(s, round.on));
  round.seq.forEach((s, i) => flash(s, (round.short && round.short[i]) || round.on));
  (round.after || []).forEach((s) => flash(s, round.on));
  const token = {}; running = token;
  let i = 0;
  const tick = () => {
    if (running !== token) return;
    if (i >= steps.length) { lampOff(lamp); running = null; return; }
    const s = steps[i++];
    lamp.style.background = s.colour || "";
    lamp.textContent = s.text || "";
    setTimeout(tick, s.ms);
  };
  tick();
}

/* Beim Anzeigen einer Rundenfolie: laufenden Durchgang abbrechen, Lampe aus. */
window.flashShow = function (slide) {
  running = null;
  const lamp = slide && slide.querySelector(".lamp");
  if (lamp) lampOff(lamp);
};

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".startbtn");
  if (btn) { ev.stopPropagation(); runRound(btn.closest(".slide")); btn.blur(); }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "s" && ev.key !== "S") return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const cur = document.querySelector(".slide.current[data-round]");
  if (cur) runRound(cur);
});


/* --- KI verstehen: ein Stapel ------------------------------------------------------
 * Drei Schichten von oben nach unten: AI, software, computer (AI in Originalschreibung). Aufbau in vier Schritten:
 * erst ai, dann darunter die Software, dann der Computer, zuletzt die Folgerung. Die
 * jeweils neue Schicht hat einen gelben Rahmen (aktuell), rechts steht in einem Satz,
 * was sie ist. Kaesten 520 x 130 bei x = 200, Abstand 40; Saetze mittig zum Kasten. */
const STACK = [
  ["AI", "is software: a program, like any other."],
  ["software", "runs on a computer."],
  ["computer", "turns numbers into numbers, billions of times a second."],
];

window.drawStack = function (step = 3) {
  const c = d.colors();
  const parts = [];
  const X = 200, W = 520, H = 130, GAP = 40, TOP = 20;
  STACK.forEach(([name, text], i) => {
    if (i > step) return;
    const y = TOP + i * (H + GAP), now = i === step;
    parts.push(d.box(X, y, W, H, name, { border: now ? c.yellow : c.white, color: now ? c.yellow : c.white, size: 48, rx: 14, keepCase: name === "AI" }));
    parts.push(d.label(X + W + 60, 0, text, { size: 32, color: now ? c.white : c.light, centerY: y + H / 2 }));
  });
  if (step >= 3) {
    const y = TOP + 3 * (H + GAP) + 20;
    parts.push(d.label(X, 0, "to understand AI, you first understand the computer and its software.", { size: 32, color: c.yellow, centerY: y + 20, keepCase: true }));
  }
  return d.svg(1680, 580, ...parts);
};

window.stackSteps = function (_slide, step = 0) {
  const svg = window.drawStack(step);
  const el = $("fig-stack"); if (el) el.innerHTML = svg;
  return svg;
};

/* --- Was danach kommt: dieses Modul als Grundlage des Folgemoduls ----------------------
 * Zwei Kaesten 700 x 330, links dieses Modul in Gelb (aktuell), rechts das Folgemodul. */
window.drawNext = function () {
  const c = d.colors();
  const parts = [];
  const kasten = (x, titel, zeit, text, farbe) => {
    parts.push(d.box(x, 40, 700, 280, "", { border: farbe, rx: 16 }));
    parts.push(d.label(x + 350, 0, titel, { size: 32, color: farbe, anchor: "middle", centerY: 110, keepCase: /AI/.test(titel) }));
    parts.push(d.label(x + 350, 0, zeit, { size: 20, color: c.gray, anchor: "middle", centerY: 155 }));
    parts.push(d.label(x + 350, 0, text, { size: 32, color: c.light, anchor: "middle", centerY: 240, keepCase: /AI/.test(text) }));
  };
  kasten(40, "digitization and programming", "this module", "the computer and its software", c.yellow);
  parts.push(d.arrow(760, 180, 920, 180, { color: c.white, width: 3 }));
  kasten(940, "problem solving with AI", "the follow-up module", "AI itself, built on top", c.white);
  return put("fig-next", d.svg(1680, 360, ...parts));
};

// Bootstrap Icons "image" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_IMAGE = '<path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>';
// Bootstrap Icons "file-binary" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_FILE_BINARY = '<path d="M5.526 13.09c.976 0 1.524-.79 1.524-2.205 0-1.412-.548-2.203-1.524-2.203-.978 0-1.526.79-1.526 2.203 0 1.415.548 2.206 1.526 2.206zm-.832-2.205c0-1.05.29-1.612.832-1.612.358 0 .607.247.733.721L4.7 11.137a7 7 0 0 1-.006-.252m.832 1.614c-.36 0-.606-.246-.732-.718l1.556-1.145q.005.12.005.249c0 1.052-.29 1.614-.829 1.614m5.329.501v-.595H9.73V8.772h-.69l-1.19.786v.688L8.986 9.5h.05v2.906h-1.18V13h3z"/><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/>';
// Bootstrap Icons "box-seam" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_BOX_SEAM = '<path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.426L5.596 5 8 5.961 14.154 3.5zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>';
// Bootstrap Icons "lightbulb" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_LIGHTBULB = '<path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1"/>';
// Bootstrap Icons "check2-circle" 1.11.3 (MIT, (c) The Bootstrap Authors)
const ICON_CHECK2_CIRCLE = '<path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/><path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>';

/* --- Die Reise eines Fotos -------------------------------------------------------------
 * Das Projekt auf die Konzepte abgebildet, aber nicht als zweite Karte, sondern als Weg:
 * sechs Stationen, die ein Foto von einem Laptop zum anderen nimmt, und an jeder die
 * Konzepte als Chips in ihrer Familienfarbe (wie auf der Karte). Aufbau Station fuer
 * Station; die neue Station ist weiss, die schon gezeigten grau. Zeilen im Abstand 96,
 * Symbol 48 bei x = 40, Satz bei x = 130, Chips ab x = 900, Mitte der Zeile bei y + 24.
 * Die drei Farbquadrate der Station „colours" sind echte Farben (Licht), keine Rollen. */
const JOURNEY = [
  ["image", "a photo on your laptop", [["memory-and-storage", "store"]]],
  ["bytes", "becomes bytes", [["number-systems", "represent"], ["code-systems", "represent"]]],
  ["frame", "is packed into a frame with a checksum", [["protocols", "transfer"], ["errors-and-redundancy", "transfer"], ["compression", "process"], ["encryption", "process"]]],
  ["colours", "bytes become colours", [["symbols-and-information", "represent"], ["analog-and-digital", "represent"]]],
  ["light", "travels as light", [["signal-and-noise", "transfer"], ["sampling-and-synchronization", "transfer"], ["throughput-and-limits", "transfer"]]],
  ["check", "arrives, is checked, becomes a photo again", [["logic-and-arithmetic", "process"]]],
];
const JOURNEY_ICONS = { image: ICON_IMAGE, bytes: ICON_FILE_BINARY, frame: ICON_BOX_SEAM, light: ICON_LIGHTBULB, check: ICON_CHECK2_CIRCLE };

window.drawJourney = function (step = JOURNEY.length - 1) {
  const c = d.colors();
  const parts = [];
  JOURNEY.forEach(([kind, text, chips], i) => {
    if (i > step) return;
    const y = 10 + i * 96, mid = y + 24, now = i === step;
    const tone = now ? c.white : c.light;
    if (kind === "colours") {
      ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"].forEach((col, j) =>
        parts.push(`<rect x="${40 + j * 17}" y="${mid - 7}" width="14" height="14" rx="2" fill="${col}"/>`));
    } else {
      parts.push(d.icon(40, y, 48, JOURNEY_ICONS[kind], { color: tone }));
    }
    parts.push(d.label(130, 0, text, { size: 32, color: tone, centerY: mid }));
    let x = 900;
    chips.forEach(([k, f]) => { parts.push(chip(x, mid - 20, LABELS[k], fam(f), c, false)); x += chipWidth(LABELS[k]) + 12; });
    if (i < step || (i === step && i < JOURNEY.length - 1)) {
      // eine duenne Linie nach unten zur naechsten Station: der Weg des Fotos
      if (i < JOURNEY.length - 1 && i < step) parts.push(d.line(64, y + 56, 64, y + 88, { color: c.dark }));
    }
  });
  return d.svg(1680, 600, ...parts);
};

window.journeySteps = function (_slide, step = 0) {
  const svg = window.drawJourney(step);
  const el = $("fig-journey"); if (el) el.innerHTML = svg;
  return svg;
};

/* --- Start --------------------------------------------------------------------- */

fillRounds();

if ($("fig-device")) {
  window.drawDevice();
  window.drawNext();
  window.drawMap({ project: true });
  window.drawFour();
  window.drawChallenges();
}

window.deck00 = {
  map: window.drawMap,
  device: window.drawDevice,
  four: window.drawFour,
  challenges: window.drawChallenges,
  LABELS, FAMILIES, SOLVING, CHALLENGES,
};
