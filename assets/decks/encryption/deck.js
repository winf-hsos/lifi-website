/* Zeichnungen fuer „who else is listening?" (Verschluesselung).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 * Alle Byte-Beispiele sind echt gerechnet (14.09.2026): der Buchstabe m mit
 * dem Schluessel aa, „meet at noon" mit „lifi", der BMP-Kopf des Papageis
 * mit dem Schluessel a7, drei Bildpunkte des Papageis mit 5a c3 96. Die
 * Zeiten fuer das Durchprobieren rechnen mit einer Milliarde Versuchen je
 * Sekunde, der Groessenordnung einer Grafikkarte. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };
const hex = (n) => n.toString(16).padStart(2, "0");
const printable = (b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "·");

/* Verweise auf andere Konzepte: nie ueber eine Decknummer, sondern ueber den
 * Konzeptnamen als Link auf die Seite. Blau verweist. */
const SEITE = (konzept) => `https://docs.lifi-project.de/concepts/${konzept}.html`;
const verweis = (konzept, label) => `<a href="${SEITE(konzept)}" target="_blank">${label}</a>`;

/* --- Teil 1: light is public ---------------------------------------------- */

/* Zwei Geraete, ein Lichtkegel, und ein drittes Geraet, dessen Sensor im
 * selben Kegel steht: Es misst dasselbe. Der dritte Sensor in Rot. */
window.drawThirdSensor = function () {
  const c = d.colors();
  const parts = [];
  parts.push(`<polygon points="470,230 1210,120 1210,340" fill="${c.yellow}" fill-opacity="0.12"/>`);
  parts.push(d.box(200, 150, 270, 160, "the sender", { border: c.light, color: c.light, size: 32 }));
  parts.push(`<circle cx="470" cy="230" r="14" fill="${c.yellow}"/>`);
  parts.push(d.box(1210, 150, 270, 160, "the receiver", { border: c.light, color: c.light, size: 32 }));
  parts.push(d.label(1345, 0, "reads r=1086 g=469 b=145", { size: 20, mono: true, color: c.light, anchor: "middle", centerY: 350 }));
  // Das dritte Geraet unter dem Kegel; sein Sensor (der Punkt) steht im Kegel
  parts.push(d.line(910, 285, 910, 340, { color: c.red, width: 3 }));
  parts.push(`<circle cx="910" cy="285" r="10" fill="${c.red}"/>`);
  parts.push(d.box(760, 340, 300, 100, "the neighbours' sensor", { border: c.red, color: c.red, size: 20 }));
  parts.push(d.label(910, 0, "reads r=1086 g=469 b=145", { size: 20, mono: true, color: c.red, anchor: "middle", centerY: 480 }));
  parts.push(d.label(840, 0, "light spreads. whatever your sensor sees, a sensor next to it sees too, and you cannot tell.",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 550 }));
  return put("fig-third-sensor", d.svg(1680, 580, ...parts));
};

/* Verschluesselung als IPO, zweimal, wie die Kompression in Deck 15; neu ist
 * der zweite Eingang von oben: der Schluessel, in Gelb. */
window.drawIpoKey = function () {
  const c = d.colors();
  const parts = [];
  const reihe = (y, input, proc, output) => {
    parts.push(d.ipo(y, input, proc, output, { monoBox: true }));
    parts.push(d.arrow(830, y - 70, 830, y - 6, { color: c.yellow, width: 3, head: 16 }));
    parts.push(d.label(830, 0, "the key", { size: 32, color: c.yellow, anchor: "middle", centerY: y - 100 }));
  };
  reihe(130, "the message", "encrypt()", "scrambled bytes");
  reihe(400, "scrambled bytes", "decrypt()", "the message");
  parts.push(d.label(840, 0, "the same key, known to two devices and to nobody else. that second input is the whole difference.",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 580 }));
  return put("fig-ipo-key", d.svg(1680, 610, ...parts));
};

/* --- Teil 2: one gate, one key --------------------------------------------- */

/* Das XOR-Gatter aus Deck 12 mit seiner Tafel und dem einen Satz, den man
 * fuer heute braucht. */
window.drawXorGate = function () {
  const c = d.colors();
  const parts = [];
  parts.push(`<g transform="translate(300,140) scale(4)">${d.gate("xor", 0, 0, false)}</g>`);
  parts.push(d.line(180, 180, 312, 180, { color: c.light, width: 3 }));
  parts.push(d.line(180, 260, 312, 260, { color: c.light, width: 3 }));
  parts.push(d.line(530, 220, 640, 220, { color: c.light, width: 3 }));
  parts.push(d.label(160, 0, "a", { size: 32, mono: true, color: c.light, anchor: "end", centerY: 180 }));
  parts.push(d.label(160, 0, "b", { size: 32, mono: true, color: c.light, anchor: "end", centerY: 260 }));
  parts.push(d.label(660, 0, "a xor b", { size: 32, mono: true, color: c.light, centerY: 220 }));
  parts.push(d.table(1000, 60, ["a", "b", "a xor b"], [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]], { cw: 160, rh: 54, size: 32 }));
  parts.push(d.label(180, 0, "a 1 in the key flips the bit.", { size: 32, color: c.white, centerY: 400 }));
  parts.push(d.label(180, 0, "a 0 leaves it.", { size: 32, color: c.white, centerY: 456 }));
  parts.push(verweis("logic-and-arithmetic", d.label(1000, 0, "logic and arithmetic: the toolbox, and the parity bit", { size: 20, color: c.blue, centerY: 400 })));
  return put("fig-xor-gate", d.svg(1680, 490, ...parts));
};

/* Eine Bitzeile: Beschriftung links, acht Bits in Vierergruppen, rechts der
 * Hexwert. `ones` faerbt die Einsen gelb (Schluessel), `flipped` die Stellen,
 * die der Schluessel gekippt hat. */
function bitReihe(parts, c, y, text, bits, o = {}) {
  const x0 = 640, cw = 36;
  parts.push(d.label(x0 - 60, 0, text, { size: 32, color: c.gray, anchor: "end", centerY: y }));
  [...bits].forEach((b, i) => {
    if (b === " ") return;
    let col = o.color || c.light;
    if (o.ones && b === "1") col = c.yellow;
    if (o.flipped && o.flipped[i]) col = c.yellow;
    parts.push(d.label(x0 + i * cw + cw / 2, 0, b, { size: 48, mono: true, color: col, anchor: "middle", centerY: y }));
  });
  parts.push(d.label(x0 + 10 * cw + 30, 0, o.hex, { size: 32, mono: true, color: o.hexColor || c.gray, centerY: y }));
}

// Der Buchstabe m (6d): eindeutig lesbar, anders als l oder i in der Textschrift.
const BYTE = "0110 1101", KEY = "1010 1010", SENT = "1100 0111";
const GEKIPPT = [...KEY].map((k) => k === "1");

/* XOR mit einem Schluesselbyte, in drei Schritten: das Byte, der Schluessel,
 * das Ergebnis mit den gekippten Stellen in Gelb. */
window.drawXorByte = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  bitReihe(parts, c, 90, "the byte for m", BYTE, { color: c.white, hex: "= 6d" });
  if (step >= 1) bitReihe(parts, c, 180, "the key", KEY, { ones: true, hex: "= aa", hexColor: c.yellow });
  if (step >= 2) {
    parts.push(d.line(580, 232, 1010, 232, { color: c.light, width: 2 }));
    bitReihe(parts, c, 290, "sent", SENT, { flipped: GEKIPPT, hex: "= c7" });
    parts.push(d.label(1120, 0, "where the key has a 1, the bit flipped", { size: 20, color: c.yellow, centerY: 290 }));
  }
  return put("fig-xor-byte", d.svg(1680, 350, ...parts));
};

/* Noch einmal XOR mit demselben Schluessel: die gekippten Stellen kippen
 * zurueck, das m steht wieder da. */
window.drawXorBack = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  bitReihe(parts, c, 90, "received", SENT, { color: c.white, hex: "= c7" });
  bitReihe(parts, c, 180, "the same key", KEY, { ones: true, hex: "= aa", hexColor: c.yellow });
  if (step >= 1) {
    parts.push(d.line(580, 232, 1010, 232, { color: c.light, width: 2 }));
    bitReihe(parts, c, 290, "back", BYTE, { flipped: GEKIPPT, hex: "= 6d" });
    parts.push(d.label(1120, 0, "the same positions, flipped back: the m again", { size: 20, color: c.yellow, centerY: 290 }));
  }
  return put("fig-xor-back", d.svg(1680, 350, ...parts));
};

/* Wie es in der Datei aussieht: „meet at noon" mit dem Schluessel „lifi",
 * drei Zeilen Bytes wie im Hex-Editor. */
const KLAR = "meet at noon", SCHLUESSEL = "lifi";

window.drawInFile = function () {
  const c = d.colors();
  const parts = [];
  const bytes = [...KLAR].map((z) => z.charCodeAt(0));
  const key = bytes.map((_, i) => SCHLUESSEL.charCodeAt(i % SCHLUESSEL.length));
  const sent = bytes.map((b, i) => b ^ key[i]);
  const reihe = (y, titel, arr, farbe, chars) => {
    parts.push(d.label(100, 0, titel, { size: 20, color: c.gray, centerY: y - 44 }));
    arr.forEach((b, k) => parts.push(d.label(100 + k * 64, 0, hex(b), { size: 32, mono: true, color: farbe, centerY: y })));
    parts.push(d.label(100 + 12 * 64 + 40, 0, chars, { size: 32, mono: true, color: c.gray, centerY: y }));
  };
  reihe(110, "plain: one byte per character", bytes, c.white, KLAR);
  reihe(250, "key: lifi, written under the message as often as needed", key, c.light, "lifilifilifi");
  reihe(390, "sent: plain xor key, byte for byte", sent, c.yellow, sent.map(printable).join(""));
  parts.push(d.label(100, 0, "12 bytes in, 12 bytes out. the same length, the same sending time, and not one byte anyone can read.",
                     { size: 20, color: c.gray, centerY: 480 }));
  return put("fig-in-file", d.svg(1680, 510, ...parts));
};

/* --- Teil 3: how long is long enough --------------------------------------- */

/* Ein Byte Schluessel: die ersten 16 Bytes des BMP-Kopfs, mit a7 verrechnet,
 * und die 256 Versuche, von denen genau einer „BM" ergibt. */
window.drawTries = function () {
  const c = d.colors();
  const parts = [];
  const kopf = [0x42, 0x4d, 0x36, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x00, 0x00, 0x00, 0x28, 0x00];
  const gelesen = kopf.map((b) => b ^ 0xa7);
  parts.push(d.label(100, 0, "what the neighbours read, the first 16 of 196 662 bytes", { size: 20, color: c.gray, centerY: 60 }));
  gelesen.forEach((b, k) => parts.push(d.label(100 + k * 52, 0, hex(b), { size: 32, mono: true, color: c.light, centerY: 110 })));
  parts.push(d.label(100, 0, "looks like noise. but one byte of key means 256 possible keys, so a program tries them all:",
                     { size: 20, color: c.gray, centerY: 175 }));
  const versuche = [[0x00, false], [0x01, false], [0x02, false], null, [0xa7, true], null, [0xff, false]];
  versuche.forEach((v, i) => {
    const y = 245 + i * 46;
    if (!v) { parts.push(d.label(120, 0, "⋮", { size: 32, mono: true, color: c.gray, centerY: y })); return; }
    const [k, ok] = v;
    const back = gelesen.slice(0, 6).map((b) => b ^ k);
    const col = ok ? c.yellow : c.light;
    parts.push(d.label(100, 0, `key ${hex(k)}`, { size: 32, mono: true, color: col, centerY: y }));
    parts.push(d.label(320, 0, back.map(hex).join(" ") + " …", { size: 32, mono: true, color: col, centerY: y }));
    parts.push(d.label(760, 0, ok ? "“BM”: the header of a bitmap. the parrot follows." : "not a file anyone knows",
                       { size: 20, color: ok ? c.yellow : c.gray, centerY: y, keepCase: true }));
  });
  parts.push(d.label(100, 0, "exactly one of the 256 gives a valid header. found in a blink.", { size: 20, color: c.gray, centerY: 590 }));
  return put("fig-tries", d.svg(1680, 620, ...parts));
};

/* Warum laenger besser ist: jedes Byte mal 256. Zeiten bei einer Milliarde
 * Versuchen je Sekunde. */
const SCHLUESSELLAENGEN = [
  ["1 byte", "256", "instant", false],
  ["2 bytes", "65 536", "instant", false],
  ["4 bytes", "4 294 967 296", "4 seconds", false],
  ["8 bytes", "18 446 744 073 709 551 616", "585 years", true],
  ["16 bytes, 128 bit", "3.4 · 10^{38}", "longer than the universe has existed", true],
];

window.drawKeyLength = function () {
  const c = d.colors();
  const parts = [];
  const kopf = (x, t, anchor) => parts.push(d.label(x, 0, t, { size: 20, color: c.gray, anchor, centerY: 60 }));
  kopf(100, "key length", "start");
  kopf(1080, "possible keys", "end");
  kopf(1140, "trying them all, a billion a second", "start");
  parts.push(d.line(100, 90, 1580, 90, { color: c.dark, width: 2 }));
  SCHLUESSELLAENGEN.forEach(([laenge, anzahl, zeit, stark], i) => {
    const y = 150 + i * 76;
    const col = stark ? c.yellow : c.light;
    parts.push(d.label(100, 0, laenge, { size: 32, color: c.white, centerY: y }));
    if (anzahl.includes("^")) parts.push(d.formula(1080, 0, anzahl, { size: 32, color: col, anchor: "end", centerY: y }));
    else parts.push(d.label(1080, 0, anzahl, { size: 32, mono: true, color: col, anchor: "end", centerY: y }));
    parts.push(d.label(1140, 0, zeit, { size: 32, color: col, centerY: y }));
  });
  parts.push(d.label(100, 0, "every byte of key multiplies the work by 256. sixteen bytes are not sixteen times harder than one, they are out of reach.",
                     { size: 20, color: c.gray, centerY: 560 }));
  return put("fig-key-length", d.svg(1680, 590, ...parts));
};

/* Ein Passwort ist ein Schluessel: dieselbe Rechnung, mit Zeichenvorrat und
 * Laenge. Zeiten wieder bei einer Milliarde Versuchen je Sekunde. */
const PASSWOERTER = [
  ["8 lowercase letters", "26^{8}", "2 · 10^{11}", "3.5 minutes", false],
  ["8 mixed: upper, lower, digits, symbols", "95^{8}", "7 · 10^{15}", "77 days", false],
  ["12 lowercase letters", "26^{12}", "1 · 10^{17}", "3 years", false],
  ["12 mixed", "95^{12}", "5 · 10^{23}", "17 million years", true],
];

window.drawPassword = function () {
  const c = d.colors();
  const parts = [];
  const kopf = (x, t, anchor) => parts.push(d.label(x, 0, t, { size: 20, color: c.gray, anchor, centerY: 60 }));
  kopf(100, "the password", "start");
  kopf(1000, "possible passwords", "end");
  kopf(1060, "trying them all", "start");
  parts.push(d.line(100, 90, 1580, 90, { color: c.dark, width: 2 }));
  PASSWOERTER.forEach(([was, potenz, anzahl, zeit, stark], i) => {
    const y = 150 + i * 76;
    const col = stark ? c.yellow : c.light;
    parts.push(d.label(100, 0, was, { size: 32, color: c.white, centerY: y }));
    parts.push(d.formula(760, 0, potenz, { size: 32, color: c.gray, anchor: "end", centerY: y }));
    parts.push(d.formula(1000, 0, anzahl, { size: 32, color: col, anchor: "end", centerY: y }));
    parts.push(d.label(1060, 0, zeit, { size: 32, color: col, centerY: y }));
  });
  const y = 150 + 4 * 76 + 20;
  parts.push(d.label(100, 0, "a word from a list: password123, summer2026, your cat's name", { size: 32, color: c.red, centerY: y }));
  parts.push(d.label(1060, 0, "under a second, at any length", { size: 32, color: c.red, centerY: y }));
  parts.push(d.label(100, 0, "attackers do not start at aaaaaaaa. they start with lists: leaked passwords, dictionary words, names, years. a list is tried in seconds.",
                     { size: 20, color: c.gray, centerY: y + 70 }));
  return put("fig-password", d.svg(1680, 555, ...parts));
};

/* Warum das Muster ueberlebt: drei Punkte des Hintergrunds, drei Punkte des
 * Gefieders, jeweils mit demselben Schluessel 5a c3 96 (echte Werte). */
window.drawWhyPattern = function () {
  const c = d.colors();
  const parts = [];
  const key = [0x5a, 0xc3, 0x96];
  const gruppe = (x, titel, punkte, fazit) => {
    parts.push(d.label(x, 0, titel, { size: 20, color: c.gray, centerY: 50 }));
    const zeile = (y, name, arr, col) => {
      parts.push(d.label(x, 0, name, { size: 20, color: c.gray, centerY: y }));
      arr.forEach((px, i) => px.forEach((v, j) => parts.push(d.label(x + 90 + i * 210 + j * 58, 0, hex(v), { size: 32, mono: true, color: col, centerY: y }))));
    };
    zeile(120, "in", punkte, c.white);
    zeile(190, "key", punkte.map(() => key), c.light);
    zeile(260, "out", punkte.map((px) => px.map((v, j) => v ^ key[j])), c.yellow);
    parts.push(d.label(x, 0, fazit, { size: 32, color: c.white, centerY: 350 }));
  };
  gruppe(100, "three points of the black background", [[0, 0, 0], [0, 0, 0], [0, 0, 0]], "same in, same key: same out");
  gruppe(900, "three points of the plumage", [[0xe0, 0x29, 0x13], [0xda, 0x0d, 0x0d], [0xd9, 0x08, 0x0b]], "different in: different out");
  parts.push(d.label(100, 0, "the background turns into one colour, the plumage stays varied. every byte is replaced, always the same way, and the picture keeps its shape.",
                     { size: 20, color: c.gray, centerY: 430 }));
  return put("fig-why-pattern", d.svg(1680, 460, ...parts));
};

/* Wie der Schluessel zum Partner kommt: drei Wege als Zeilen, die zwei ueber
 * die Strecke scheitern (roter Rahmen), der dritte traegt (gruener Rahmen). */
window.drawKeyPath = function () {
  const c = d.colors();
  const parts = [];
  const zeile = (y, weg, urteil, ok) => {
    const col = ok ? c.green : c.red;
    parts.push(d.box(100, y, 720, 100, weg, { border: col, color: c.white, size: 32, width: 3 }));
    parts.push(d.arrow(840, y + 50, 920, y + 50, { color: c.light, width: 3, head: 14 }));
    parts.push(d.label(940, 0, urteil, { size: 32, color: col, centerY: y + 50 }));
  };
  zeile(40, "send the key over the link, in the clear", "the neighbours read it, and everything after it", false);
  zeile(190, "send the key over the link, encrypted", "encrypted with which key?\nthe same question, one level down", false);
  zeile(340, "hand it over where nobody listens", "the same table, a slip of paper. done.", true);
  parts.push(d.label(100, 0, "in the course the second path is easy: you sit next to each other. between two computers that never met, it is the hard part of the whole field.",
                     { size: 20, color: c.gray, centerY: 510 }));
  return put("fig-key-path", d.svg(1680, 540, ...parts));
};

/* Ein Vorhaengeschloss, 2,2-fach vergroessert: Koerper, Buegel offen oder
 * geschlossen, und wahlweise das Geheimnis (gelber Kasten) im Koerper. */
function schloss(x, y, offen, col, c, geheimnis) {
  const s = 2.2;
  const body = `<rect x="0" y="40" width="70" height="56" rx="8" fill="${c.bg}" stroke="${col}" stroke-width="3"/>`;
  const buegel = offen
    ? `<path d="M30,32 v-8 a17,17 0 0 1 34,0 v16" fill="none" stroke="${col}" stroke-width="3"/><line x1="18" y1="40" x2="18" y2="28" stroke="${col}" stroke-width="3"/>`
    : `<path d="M18,40 v-16 a17,17 0 0 1 34,0 v16" fill="none" stroke="${col}" stroke-width="3"/>`;
  const inhalt = geheimnis
    ? `<rect x="17" y="52" width="36" height="32" rx="4" fill="${c.yellow}"/>`
    : `<circle cx="35" cy="68" r="5" fill="${col}"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${body}${buegel}${inhalt}</g>`;
}

/* Ein Schluessel als Symbol, gross: Ring, Bart, zwei Zaehne. */
function schluessel(x, y, col) {
  return `<circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${col}" stroke-width="4"/>` +
         `<line x1="${x + 18}" y1="${y}" x2="${x + 90}" y2="${y}" stroke="${col}" stroke-width="4"/>` +
         `<line x1="${x + 72}" y1="${y}" x2="${x + 72}" y2="${y + 16}" stroke="${col}" stroke-width="4"/>` +
         `<line x1="${x + 88}" y1="${y}" x2="${x + 88}" y2="${y + 16}" stroke="${col}" stroke-width="4"/>`;
}

/* Das offene Vorhaengeschloss, in drei Schritten, je Schritt eine Szene
 * zwischen Shop und Browser: das offene Schloss geht hin, kommt geschlossen
 * mit dem Geheimnis zurueck, der Shop oeffnet es mit dem Schluessel, der nie
 * unterwegs war. Die Szene wechselt, die Saetze darunter bleiben stehen. */
window.drawPadlock = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  parts.push(d.box(100, 130, 300, 130, "the shop", { border: c.light, color: c.light, size: 32 }));
  parts.push(d.box(1280, 130, 300, 130, "your browser", { border: c.light, color: c.light, size: 32 }));
  parts.push(d.line(400, 195, 1280, 195, { color: c.dark, width: 3 }));
  parts.push(`<circle cx="840" cy="195" r="10" fill="${c.red}"/>`);
  parts.push(d.label(840, 0, "the public line: the neighbours see everything that travels here", { size: 20, color: c.red, anchor: "middle", centerY: 250 }));
  // Der Schluessel des Shops: bleibt in allen drei Schritten beim Shop
  parts.push(schluessel(150, 60, c.yellow));
  parts.push(d.label(260, 0, "the shop's key. it never travels.", { size: 20, color: c.yellow, centerY: 60 }));
  if (step === 0) {
    parts.push(schloss(760, 8, true, c.light, c, false));
    parts.push(d.arrow(940, 130, 1240, 130, { color: c.light, width: 3, head: 14 }));
    parts.push(d.label(1090, 0, "an open padlock", { size: 20, color: c.light, anchor: "middle", centerY: 100 }));
  } else if (step === 1) {
    parts.push(schloss(760, 8, false, c.yellow, c, true));
    parts.push(d.arrow(740, 130, 440, 130, { color: c.yellow, width: 3, head: 14 }));
    parts.push(d.label(590, 0, "snapped shut, a fresh secret inside", { size: 20, color: c.yellow, anchor: "middle", centerY: 100 }));
  } else {
    parts.push(schloss(760, 8, true, c.yellow, c, true));
    parts.push(d.arrow(740, 130, 440, 130, { color: c.yellow, width: 3, head: 14 }));
    parts.push(d.label(590, 0, "back at the shop, opened with its key", { size: 20, color: c.yellow, anchor: "middle", centerY: 100 }));
    parts.push(d.label(1090, 0, "both know the secret now", { size: 20, color: c.yellow, anchor: "middle", centerY: 100 }));
  }
  const zeilen = [
    "1  the shop sends an open padlock. anyone may snap it shut; only the shop's key opens it.",
    "2  the browser puts a fresh secret in, snaps it shut, sends it back. nobody on the way can open it, not even the browser any more.",
    "3  the shop opens it. now both know the secret, the line saw a lock and never a key, and from here on they xor with the secret as before.",
  ];
  zeilen.forEach((z, i) => {
    if (i > step) return;
    parts.push(d.label(100, 0, z, { size: 20, color: i === step ? c.yellow : c.light, centerY: 330 + i * 46 }));
  });
  return put("fig-padlock", d.svg(1680, 433, ...parts));
};

/* --- Teil 4: what a key does not do ---------------------------------------- */

/* Gekippte Bits gehen durch: die Kette mit dem Blitz auf der Strecke, hinten
 * ein falscher Buchstabe, und nichts sagt es. Ein Bit im o kippt: aus 6f wird 67, ein g. */
window.drawFlipped = function () {
  const c = d.colors();
  const parts = [];
  const y = 120, mitte = y + 50;
  parts.push(d.label(60, 0, "meet at noon", { size: 32, mono: true, color: c.white, centerY: mitte }));
  parts.push(d.arrow(320, mitte, 400, mitte, { color: c.light, width: 3, head: 14 }));
  parts.push(d.box(410, y, 260, 100, "encrypt()", { border: c.light, color: c.light, size: 32, mono: true }));
  parts.push(d.arrow(680, mitte, 760, mitte, { color: c.light, width: 3, head: 14 }));
  parts.push(`<polyline points="705,110 735,152 718,152 748,200" fill="none" stroke="${c.red}" stroke-width="4"/>`);
  parts.push(d.label(720, 0, "one bit flips on the way", { size: 20, color: c.red, anchor: "middle", centerY: 70 }));
  parts.push(d.box(770, y, 260, 100, "decrypt()", { border: c.light, color: c.light, size: 32, mono: true }));
  parts.push(d.arrow(1040, mitte, 1120, mitte, { color: c.light, width: 3, head: 14 }));
  const cw = 19.2;
  parts.push(d.label(1130, 0, "meet at no", { size: 32, mono: true, color: c.white, centerY: mitte }));
  parts.push(d.label(1130 + 10 * cw, 0, "g", { size: 32, mono: true, color: c.red, centerY: mitte }));
  parts.push(d.label(1130 + 11 * cw, 0, "n", { size: 32, mono: true, color: c.white, centerY: mitte }));
  parts.push(d.label(60, 0, "the key flips the bits back that it flipped. the one bit the link flipped, it flips too: 6f becomes 67, an o becomes a g, and nothing says so.",
                     { size: 20, color: c.gray, centerY: 290 }));
  parts.push(d.label(60, 0, "a checksum over the sent bytes notices: mismatch, send that frame again.",
                     { size: 20, color: c.yellow, centerY: 340 }));
  // Die Kette ist rund 1 300 px breit: um 160 px nach rechts, damit sie mittig steht
  return put("fig-flipped", d.svg(1680, 380, `<g transform="translate(160,0)">${parts.join("")}</g>`));
};

/* Der Klassenrahmen: nur die Nutzlast ist verschluesselt, alles andere bleibt
 * offen, weil es seine Arbeit vor dem Entschluesseln tut. */
window.drawFrame = function () {
  const c = d.colors();
  const parts = [];
  const felder = [["preamble", 220, "must be found first"], ["type", 150, ""], ["length", 200, "says how much to read"],
                  ["payload", 520, "encrypted"], ["checksum", 260, "over the bytes actually sent"], ["end", 150, ""]];
  let x = 60;
  felder.forEach(([name, w, note]) => {
    const gelb = name === "payload";
    parts.push(d.box(x, 100, w, 110, name, { border: gelb ? c.yellow : c.light, color: gelb ? c.yellow : c.light, size: 32, width: gelb ? 4 : 2 }));
    parts.push(d.label(x + w / 2, 0, gelb ? "locked with the key" : "in the clear", { size: 20, color: gelb ? c.yellow : c.gray, anchor: "middle", centerY: 250 }));
    if (note) parts.push(d.label(x + w / 2, 0, note, { size: 20, color: c.gray, anchor: "middle", centerY: 290 }));
    x += w + 12;
  });
  parts.push(d.label(840, 0, "the frame does its job in the clear. only the content is locked, and the checksum is computed over the locked bytes.",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 370 }));
  return put("fig-frame", d.svg(1680, 400, ...parts));
};

/* Erst packen, dann verschluesseln: zwei Reihen mit den gemessenen Groessen.
 * Das Urteil traegt allein die Farbe des letzten Kastens. */
window.drawOrder = function () {
  const c = d.colors();
  const parts = [];
  const reihe = (y, op1, v1, op2, v2, ok) => {
    const mitte = y + 45;
    parts.push(d.label(60, 0, "raw 196 608", { size: 32, mono: true, color: c.white, centerY: mitte }));
    parts.push(d.arrow(320, mitte, 390, mitte, { color: c.light, width: 3, head: 14 }));
    parts.push(d.box(400, y, 220, 90, op1, { border: c.light, color: c.light, size: 32, mono: true }));
    parts.push(d.arrow(630, mitte, 700, mitte, { color: c.light, width: 3, head: 14 }));
    parts.push(d.label(720, 0, v1, { size: 32, mono: true, color: c.light, centerY: mitte }));
    parts.push(d.arrow(880, mitte, 950, mitte, { color: c.light, width: 3, head: 14 }));
    parts.push(d.box(960, y, 220, 90, op2, { border: c.light, color: c.light, size: 32, mono: true }));
    parts.push(d.arrow(1190, mitte, 1260, mitte, { color: c.light, width: 3, head: 14 }));
    const col = ok ? c.green : c.red;
    parts.push(d.box(1270, y, 300, 90, v2, { border: col, color: col, size: 32, mono: true, width: 4 }));
  };
  reihe(60, "zip()", "132 809", "encrypt()", "132 809", true);
  reihe(250, "encrypt()", "196 608", "zip()", "196 776", false);
  parts.push(d.label(60, 0, "encrypted bytes have no redundancy left: the packer finds nothing and adds its table. the wrong order costs 64 kilobytes.",
                     { size: 20, color: c.gray, centerY: 420 }));
  return put("fig-order", d.svg(1680, 450, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-third-sensor")) {
  window.drawThirdSensor();
  window.drawIpoKey();
  window.drawXorGate();
  window.drawXorByte();
  window.drawXorBack();
  window.drawInFile();
  window.drawTries();
  window.drawKeyLength();
  window.drawPassword();
  window.drawWhyPattern();
  window.drawKeyPath();
  window.drawPadlock();
  window.drawFlipped();
  window.drawFrame();
  window.drawOrder();
}

window.deck16 = {
  thirdSensor: window.drawThirdSensor,
  ipoKey: window.drawIpoKey,
  xorGate: window.drawXorGate,
  xorByte: window.drawXorByte,
  xorBack: window.drawXorBack,
  inFile: window.drawInFile,
  tries: window.drawTries,
  keyLength: window.drawKeyLength,
  password: window.drawPassword,
  whyPattern: window.drawWhyPattern,
  keyPath: window.drawKeyPath,
  padlock: window.drawPadlock,
  flipped: window.drawFlipped,
  frame: window.drawFrame,
  order: window.drawOrder,
};
