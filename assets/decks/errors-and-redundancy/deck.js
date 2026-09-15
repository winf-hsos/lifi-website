/* Zeichnungen fuer „one bit went wrong" (Fehler und Redundanz).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Alle Zahlen sind am 15.09.2026 gerechnet, am Papagei aus
 * lifi-concept-demos/assets/photos/parrot.png (256 x 256):
 *   ein gekipptes Bit im rohen BMP  -> ein Farbwert falsch, (240,45,38) zu (240,45,166)
 *   dasselbe Bit im PNG            -> die Datei laesst sich nicht mehr oeffnen
 *   sha-256 des rohen Papageis und desselben mit einem gekippten Bit
 *   wahrscheinlichkeiten bei 0,1 % fehlerrate je bit
 *   sendezeiten bei 10 bit/s fuer 2 kb */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Verweise auf andere Konzepte: nie ueber eine Decknummer, sondern ueber den
 * Konzeptnamen als Link auf die Seite. Blau verweist. */
const SEITE = (konzept) => `https://docs.lifi-project.de/concepts/${konzept}.html`;
const verweis = (konzept, label) => `<a href="${SEITE(konzept)}" target="_blank">${label}</a>`;

/* --- Teil 1: it will go wrong ---------------------------------------------- */

/* Der echte QR-Code der Eroeffnung. Er zeigt auf https://docs.lifi-project.de/,
 * ist als version 4-H gesetzt (33 x 33 = 1089 module, 100 codewoerter: 36 fuer
 * die daten, 64 fuer die fehlerkorrektur) und hat ein loch von 172 modulen.
 * Am 15.09.2026 mit opencv geprueft: original, verkleinert auf 400 und 260 px,
 * unscharf, um +7 und -12 grad gedreht und als jpeg qualitaet 45 lesbar. */
const QR = { module: 1089, weg: 172, daten: 36, schutz: 64, ziel: "docs.lifi-project.de" };

window.drawQr = function () {
  const c = d.colors();
  const parts = [];
  parts.push(`<image href="img/qr-torn.png" x="60" y="10" width="620" height="620"/>`);
  const x0 = 840, x1 = 1600;
  const zeile = (i, text, wert, farbe) => {
    const y = 130 + i * 100;
    parts.push(d.label(x0, 0, text, { size: 32, color: c.white, centerY: y }));
    parts.push(d.label(x1, 0, wert, { size: 32, mono: true, color: farbe, anchor: "end", centerY: y }));
  };
  zeile(0, "squares in the code", "1 089", c.light);
  zeile(1, "squares torn out", "172", c.red);
  zeile(2, "bytes of data", "36", c.light);
  zeile(3, "bytes of protection", "64", c.yellow);
  parts.push(d.line(x0, 500, x1, 500, { color: c.dark }));
  parts.push(d.label(x0, 0, "and it still reads", { size: 20, color: c.gray, centerY: 550 }));
  parts.push(d.label(x0, 0, QR.ziel, { size: 32, mono: true, color: c.blue, centerY: 600 }));
  return put("fig-qr", d.svg(1680, 640, ...parts));
};

/* Fehler sind Statistik: dieselbe Strecke, drei Laengen, und die
 * Wahrscheinlichkeit eines sauberen Laufs faellt ins Bodenlose. */
const SAUBER = [
  ["10 characters", "80 bits", 0.923, "92.3 %", "light"],
  ["the same, 100 times", "8 000 bits", 0.0003, "0.03 %", "yellow"],
  ["the payload of the final", "16 384 bits", 0.000000076, "0.0000076 %", "red"],
];

window.drawInevitable = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 640, breite = 640, h = 64;
  parts.push(d.label(100, 0, "a link that gets 999 bits out of 1000 right", { size: 20, color: c.gray, centerY: 60 }));
  SAUBER.forEach(([was, bits, anteil, text, farbe], i) => {
    const y = 130 + i * 120;
    const col = { light: c.light, yellow: c.yellow, red: c.red }[farbe];
    parts.push(d.label(x0 - 40, 0, was, { size: 32, color: c.white, anchor: "end", centerY: y }));
    parts.push(d.label(x0 - 40, 0, bits, { size: 20, mono: true, color: c.gray, anchor: "end", centerY: y + 38 }));
    parts.push(`<rect x="${x0}" y="${y - h / 2}" width="${breite}" height="${h}" rx="4" fill="${c.dark}" fill-opacity="0.4"/>`);
    const w = Math.max(3, anteil * breite);
    parts.push(`<rect x="${x0}" y="${y - h / 2}" width="${w.toFixed(1)}" height="${h}" rx="4" fill="${col}" fill-opacity="0.9"/>`);
    parts.push(d.label(x0 + breite + 40, 0, text, { size: 32, mono: true, color: col, centerY: y }));
  });
  parts.push(d.label(100, 0, "the chance that everything arrives untouched. nothing is broken here: this is multiplication.",
                     { size: 20, color: c.gray, centerY: 450 }));
  return put("fig-inevitable", d.svg(1680, 480, ...parts));
};

/* Die Pruefsumme als IPO, zweimal: rechnen und pruefen. Der zweite Kasten
 * liefert keine Nachricht, sondern eine Antwort. */
window.drawIpoCheck = function () {
  const c = d.colors();
  const parts = [];
  parts.push(d.ipo(70, "the bytes", "checksum()", "a few bits", { monoBox: true }));
  parts.push(d.ipo(300, "the bytes\n+ those bits", "check()", "yes, or no", { monoBox: true }));
  parts.push(d.label(840, 0, "the second box never repairs anything. it answers one question.",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 500 }));
  return put("fig-ipo-check", d.svg(1680, 530, ...parts));
};

/* --- Teil 2: how you notice ------------------------------------------------ */

/* Eine Bitzeile mit Beschriftung links und Anmerkung rechts. `mark` faerbt
 * einzelne Stellen rot (gekippt), `count` schreibt die Zahl der Einsen. */
function bits(parts, c, y, text, muster, o = {}) {
  const x0 = 620, cw = 38;
  parts.push(d.label(x0 - 60, 0, text, { size: 32, color: c.gray, anchor: "end", centerY: y }));
  let i = 0;
  [...muster].forEach((b) => {
    if (b === " ") { i += 1; return; }
    const stelle = i;
    const col = (o.mark || []).includes(stelle) ? c.red : (o.color || c.light);
    parts.push(d.label(x0 + i * cw + cw / 2, 0, b, { size: 48, mono: true, color: col, anchor: "middle", centerY: y }));
    i += 1;
  });
  if (o.extra) parts.push(d.label(x0 + 10 * cw + 40, 0, o.extra, { size: 32, mono: true, color: o.extraColor || c.gray, centerY: y }));
}

const BYTE = "1011 0010";           // vier Einsen, gerade Paritaet also 0

/* Das Paritaetsbit in drei Schritten: das Byte, das Prüfbit, ein gekipptes Bit. */
window.drawParity = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  bits(parts, c, 90, "the byte", BYTE, { color: c.white, extra: "four ones" });
  if (step >= 1) {
    bits(parts, c, 190, "sent as nine bits", BYTE + " 0", { color: c.white, extra: "still four: even", extraColor: c.yellow });
    parts.push(d.label(620 + 9 * 38 + 19, 0, "↑", { size: 32, color: c.yellow, anchor: "middle", centerY: 240 }));
    parts.push(d.label(620 + 9 * 38 + 19, 0, "the parity bit", { size: 20, color: c.yellow, anchor: "middle", centerY: 275 }));
  }
  if (step >= 2) {
    bits(parts, c, 360, "one bit flips", "1010 0010 0", { color: c.white, mark: [2], extra: "three: odd", extraColor: c.red });
    parts.push(d.label(100, 0, "the receiver counts the ones, finds an odd number, and knows: this byte is broken.",
                       { size: 20, color: c.red, centerY: 440 }));
  }
  return put("fig-parity", d.svg(1680, 470, ...parts));
};

/* Wo ein Bit nicht reicht: zwei gekippte Stellen, und die Paritaet schweigt. */
window.drawParityGap = function () {
  const c = d.colors();
  const parts = [];
  bits(parts, c, 90, "sent", BYTE + " 0", { color: c.white, extra: "four ones: even", extraColor: c.gray });
  bits(parts, c, 200, "two bits flip", "1010 0110 0", { color: c.white, mark: [2, 5], extra: "four ones: even", extraColor: c.red });
  parts.push(d.label(100, 0, "the count is right again. the check says nothing, and the byte is wrong.",
                     { size: 32, color: c.white, centerY: 300 }));
  parts.push(d.label(100, 0, "parity catches every odd number of flips and misses every even one. that is what one extra bit buys.",
                     { size: 20, color: c.gray, centerY: 370 }));
  return put("fig-parity-gap", d.svg(1680, 400, ...parts));
};

/* Von einem Bit zur Pruefsumme: der Rahmen, und was mehr Pruefbits bringen. */
window.drawChecksum = function () {
  const c = d.colors();
  const parts = [];
  const felder = [["preamble", 190], ["type", 130], ["length", 160], ["payload", 380], ["checksum", 230], ["end", 130]];
  let x = 100;
  felder.forEach(([name, w]) => {
    const gelb = name === "checksum";
    parts.push(d.box(x, 60, w, 90, name, { border: gelb ? c.yellow : c.dark, color: gelb ? c.yellow : c.light, size: 20, width: gelb ? 4 : 2 }));
    x += w + 10;
  });
  parts.push(d.label(100, 0, "computed from every byte of the frame, by a rule both sides agreed on",
                     { size: 20, color: c.gray, centerY: 190 }));
  const stufen = [["8 bits", 520, "1 damaged frame in 256 slips through", c.light],
                  ["16 bits", 700, "1 in 65 536", c.light],
                  ["32 bits", 880, "1 in 4 294 967 296", c.yellow]];
  stufen.forEach(([wie, breite, text, col], i) => {
    const y = 280 + i * 90;
    parts.push(d.label(100, 0, wie, { size: 32, mono: true, color: col, centerY: y }));
    parts.push(`<rect x="300" y="${y - 26}" width="${breite}" height="52" rx="4" fill="${col}" fill-opacity="${col === c.yellow ? 0.9 : 0.35}"/>`);
    parts.push(d.label(300 + breite + 40, 0, text, { size: 32, color: col, centerY: y }));
  });
  parts.push(d.label(100, 0, "crc-32, the 32-bit version, is what png and zip carry. more check bits do not catch more errors: they let fewer slip past.",
                     { size: 20, color: c.gray, centerY: 540 }));
  return put("fig-checksum", d.svg(1680, 570, ...parts));
};

/* --- Der Hash, zwei Folien ------------------------------------------------- */

const HASHES = {
  a: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
  noon: "50a8d1d0939b05a7fb60b34d4fb18805a1ced867736de235c7095a03bd7d1c25",
  parrot: "c96f9a5adeeda470bd66eb13c0a78607097890ae957b6f911407e73d6055f94f",
  flip: "c793da57f7f8bf7fc090e0ce574684f5b196aee88e9130c25b6da140e797c13f",
};

/* Ein Hash als Fingerabdruck: drei Eingaben sehr verschiedener Groesse, und
 * heraus kommt jedes Mal dieselbe kurze Zahl von 64 Zeichen. */
window.drawHashWhat = function () {
  const c = d.colors();
  const parts = [];
  const zeile = (y, was, groesse, hash) => {
    parts.push(d.label(100, 0, was, { size: 32, color: c.white, centerY: y }));
    parts.push(d.label(100, 0, groesse, { size: 20, mono: true, color: c.gray, centerY: y + 38 }));
    parts.push(d.arrow(520, y, 620, y, { color: c.light, width: 3, head: 14 }));
    parts.push(d.label(660, 0, hash.slice(0, 32), { size: 20, mono: true, color: c.yellow, centerY: y - 14 }));
    parts.push(d.label(660, 0, hash.slice(32), { size: 20, mono: true, color: c.yellow, centerY: y + 18 }));
  };
  zeile(120, "the letter a", "1 byte", HASHES.a);
  zeile(260, "meet at noon", "12 bytes", HASHES.noon);
  zeile(400, "the parrot, raw", "196 662 bytes", HASHES.parrot);
  parts.push(d.label(660, 0, "always 64 characters. always.", { size: 32, color: c.white, centerY: 510 }));
  parts.push(d.label(100, 0, "a hash is a fingerprint of the bytes: a fixed rule squeezes any amount of data into one short number.",
                     { size: 20, color: c.gray, centerY: 580 }));
  return put("fig-hash-what", d.svg(1680, 610, ...parts));
};

/* Der Lawineneffekt: derselbe Papagei mit einem gekippten Bit, und vom Hash
 * bleibt nichts uebrig. Gleiche Zeichen grau, verschiedene gelb. */
window.drawHashFlip = function () {
  const c = d.colors();
  const parts = [];
  const cw = 22, x0 = 460;
  const zeile = (y, text, hash, andere) => {
    if (text) parts.push(d.label(x0 - 50, 0, text, { size: 32, color: c.gray, anchor: "end", centerY: y }));
    [...hash].forEach((z, i) => {
      const gleich = hash[i] === andere[i];
      parts.push(d.label(x0 + i * cw + cw / 2, 0, z, { size: 32, mono: true, color: gleich ? c.gray : c.yellow, anchor: "middle", centerY: y }));
    });
  };
  const a = HASHES.parrot, b = HASHES.flip;
  zeile(100, "the parrot", a.slice(0, 32), b.slice(0, 32));
  zeile(150, "", a.slice(32), b.slice(32));
  zeile(270, "one bit flipped", b.slice(0, 32), a.slice(0, 32));
  zeile(320, "", b.slice(32), a.slice(32));
  const gleich = [...a].filter((z, i) => z === b[i]).length;
  parts.push(d.label(100, 0, `${gleich} of 64 characters still match, and that is pure chance: with 16 possible characters, four would match between any two files.`,
                     { size: 20, color: c.gray, centerY: 420 }));
  parts.push(d.label(100, 0, "one bit in 1 573 296, and nothing of the fingerprint survives.", { size: 32, color: c.white, centerY: 490 }));
  return put("fig-hash-flip", d.svg(1680, 520, ...parts));
};

/* Drei Pruefungen, drei Aufgaben: Byte, Rahmen, Datei. */
window.drawLevels = function () {
  const c = d.colors();
  const parts = [];
  const zeile = (y, was, deckt, sagt, col) => {
    parts.push(d.label(100, 0, was, { size: 32, color: col, centerY: y }));
    parts.push(d.label(620, 0, deckt, { size: 20, mono: true, color: c.gray, centerY: y }));
    parts.push(d.label(1000, 0, sagt, { size: 20, color: c.light, centerY: y }));
  };
  parts.push(d.label(100, 0, "the check", { size: 20, color: c.gray, centerY: 60 }));
  parts.push(d.label(620, 0, "covers", { size: 20, color: c.gray, centerY: 60 }));
  parts.push(d.label(1000, 0, "and tells you", { size: 20, color: c.gray, centerY: 60 }));
  parts.push(d.line(100, 90, 1580, 90, { color: c.dark, width: 2 }));
  zeile(150, "parity bit", "one byte", "an odd number of bits flipped", c.light);
  zeile(240, "checksum", "one frame", "this frame is broken: send it again", c.light);
  zeile(330, "hash", "the whole file", "these 2 kb are exactly those 2 kb", c.yellow);
  parts.push(d.label(100, 0, "in the final the hash decides. the frame checksums are what get you there without sending everything twice.",
                     { size: 20, color: c.gray, centerY: 420 }));
  return put("fig-levels", d.svg(1680, 450, ...parts));
};

/* Ein gekipptes Bit im rohen Bild: die Datei oeffnet sich, ein Farbwert ist
 * falsch, und ohne Zoom findet das niemand. */
window.drawOneBitRaw = function (_slide, _step, mitBild = true) {
  const c = d.colors();
  const parts = [];
  if (mitBild) {
    parts.push(`<image href="img/parrot-flip.png" x="100" y="60" width="420" height="420"/>`);
    parts.push(`<image href="img/zoom-raw.png" x="700" y="60" width="260" height="260"/>`);
    parts.push(`<image href="img/zoom-flip.png" x="1000" y="60" width="260" height="260"/>`);
  }
  parts.push(d.label(310, 0, "the file after one flipped bit", { size: 20, color: c.gray, anchor: "middle", centerY: 510 }));
  parts.push(d.label(830, 0, "as sent", { size: 20, color: c.gray, anchor: "middle", centerY: 350 }));
  parts.push(d.label(1130, 0, "as received", { size: 20, color: c.yellow, anchor: "middle", centerY: 350 }));
  parts.push(d.label(700, 0, "zoomed to 16 × 16 points", { size: 20, color: c.gray, centerY: 400 }));
  parts.push(d.label(700, 0, "(240, 45, 38)  →  (240, 45, 166)", { size: 32, mono: true, color: c.yellow, centerY: 460 }));
  parts.push(d.label(700, 0, "one colour value of 196 608 is wrong. the file opens. nobody sees it.",
                     { size: 20, color: c.gray, centerY: 510 }));
  return put("fig-one-bit-raw", d.svg(1680, 540, ...parts));
};

/* Dasselbe Bit im gepackten Bild: die Datei oeffnet sich gar nicht mehr. */
window.drawOneBitPacked = function (_slide, _step, mitBild = true) {
  const c = d.colors();
  const parts = [];
  if (mitBild) {
    parts.push(`<image href="img/parrot.png" x="100" y="60" width="380" height="380"/>`);
    parts.push(d.label(290, 0, "raw: opens, one wrong point", { size: 20, color: c.gray, anchor: "middle", centerY: 470 }));
  }
  // Ohne Foto (Website) ruecken Kasten und Zeilen nach links, sonst bleibt dort eine Luecke
  const x = mitBild ? 700 : 100, w = 700, y = 60, h = 380;
  parts.push(d.box(x, y, w, h, "", { border: c.red, width: 4 }));
  parts.push(d.label(x + w / 2, 0, "unrecognized data stream", { size: 32, mono: true, color: c.red, anchor: "middle", centerY: y + h / 2 - 28 }));
  parts.push(d.label(x + w / 2, 0, "contents when reading image file", { size: 32, mono: true, color: c.red, anchor: "middle", centerY: y + h / 2 + 28 }));
  parts.push(d.label(x + w / 2, 0, "png: does not open at all", { size: 20, color: c.red, anchor: "middle", centerY: 470 }));
  parts.push(d.label(x, 0, "crc-32 stored    a831c3c1", { size: 20, mono: true, color: c.gray, centerY: 530 }));
  parts.push(d.label(x, 0, "crc-32 computed  cb5ebce6", { size: 20, mono: true, color: c.yellow, centerY: 565 }));
  parts.push(d.label(x, 0, "packed data has no air left: every byte hangs on the ones before it. png notices by itself and refuses.",
                     { size: 20, color: c.gray, centerY: 610 }));
  // Ohne Foto ist die Zeichnung schmaler: sonst steht sie auf der Website in viel Leerraum
  return put("fig-one-bit-packed", d.svg(mitBild ? 1680 : 1180, 640, ...parts));
};

/* --- Teil 3: what it costs ------------------------------------------------- */

const KOSTEN = [
  ["nothing at all", 16384, "27.3 min", "", "light"],
  ["a checksum per frame", 16640, "27.7 min", "+1.6 %", "yellow"],
  ["a parity bit per byte", 18432, "30.7 min", "+12.5 %", "light"],
  ["every bit three times", 49152, "81.9 min", "+200 %", "red"],
];

window.drawCost = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 620, breite = 620, h = 64, max = 49152;
  parts.push(d.label(100, 0, "2 kb over your link at 10 bit/s", { size: 20, color: c.gray, centerY: 60 }));
  KOSTEN.forEach(([was, bit, zeit, plus, farbe], i) => {
    const y = 130 + i * 110;
    const col = { light: c.light, yellow: c.yellow, red: c.red }[farbe];
    parts.push(d.label(x0 - 40, 0, was, { size: 32, color: c.white, anchor: "end", centerY: y }));
    parts.push(d.label(x0 - 40, 0, bit.toLocaleString("en").replace(/,/g, " ") + " bits", { size: 20, mono: true, color: c.gray, anchor: "end", centerY: y + 36 }));
    const w = (bit / max) * breite;
    parts.push(`<rect x="${x0}" y="${y - h / 2}" width="${w.toFixed(1)}" height="${h}" rx="4" fill="${col}" fill-opacity="0.85"/>`);
    parts.push(d.label(x0 + breite + 40, 0, zeit, { size: 32, mono: true, color: col, centerY: y }));
    if (plus) parts.push(d.label(x0 + breite + 220, 0, plus, { size: 32, color: col, centerY: y }));
  });
  parts.push(d.label(100, 0, "noticing is nearly free. repairing without asking costs three times the link, every run, whether anything breaks or not.",
                     { size: 20, color: c.gray, centerY: 570 }));
  return put("fig-cost", d.svg(1680, 600, ...parts));
};

/* --- Teil 4: notice or repair ---------------------------------------------- */

/* Wiederholungscode: jedes Bit dreimal, die Mehrheit gewinnt. */
window.drawTriple = function () {
  const c = d.colors();
  const parts = [];
  const cw = 90, x0 = 260, y = 150;
  const gruppe = (gesendet, empfangen, kaputt, yy) => {
    [...gesendet].forEach((b, i) => parts.push(d.label(x0 + i * cw, 0, b, { size: 48, mono: true, color: c.light, anchor: "middle", centerY: yy })));
    [...empfangen].forEach((b, i) => parts.push(d.label(x0 + i * cw, 0, b, { size: 48, mono: true, color: i === kaputt ? c.red : c.light, anchor: "middle", centerY: yy + 110 })));
  };
  parts.push(d.label(x0 - 100, 0, "sent", { size: 20, color: c.gray, anchor: "end", centerY: y }));
  parts.push(d.label(x0 - 100, 0, "received", { size: 20, color: c.gray, anchor: "end", centerY: y + 110 }));
  gruppe("111", "101", 1, y);
  parts.push(d.arrow(x0 + 2 * cw + 60, y + 110, x0 + 2 * cw + 160, y + 110, { color: c.green, width: 3, head: 14 }));
  parts.push(d.label(x0 + 2 * cw + 200, 0, "1", { size: 48, mono: true, color: c.green, centerY: y + 110 }));
  parts.push(d.label(x0 + 2 * cw + 260, 0, "majority wins: the receiver repairs it alone, without asking anyone",
                     { size: 20, color: c.green, centerY: y + 110 }));
  parts.push(d.label(100, 0, "three times the bits · 82 minutes instead of 27 · and if two bits of the same triple flip, it repairs the wrong way",
                     { size: 20, color: c.gray, centerY: 400 }));
  parts.push(d.label(100, 0, "this is how a space probe does it: nobody can ask mars to repeat.", { size: 20, color: c.yellow, centerY: 450 }));
  return put("fig-triple", d.svg(1680, 480, ...parts));
};

/* Nachfragen: vier Rahmen, einer kaputt, der Rueckkanal holt genau den. */
window.drawAskAgain = function () {
  const c = d.colors();
  const parts = [];
  const w = 240, h = 90, gap = 20, x0 = 140, y = 100;
  const rahmen = [["frame 1", true], ["frame 2", true], ["frame 3", false], ["frame 4", true]];
  rahmen.forEach(([name, ok], i) => {
    const x = x0 + i * (w + gap);
    const col = ok ? c.light : c.red;
    parts.push(d.box(x, y, w, h, name, { border: col, color: col, size: 32, width: ok ? 2 : 4 }));
    parts.push(d.label(x + w / 2, 0, ok ? "checksum ok" : "checksum fails", { size: 20, color: ok ? c.gray : c.red, anchor: "middle", centerY: y + h + 40 }));
  });
  const x3 = x0 + 2 * (w + gap);
  parts.push(d.arrow(x3 + w / 2, 330, x3 + w / 2, 260, { color: c.yellow, width: 3, head: 14 }));
  parts.push(d.label(x3 + w / 2, 0, "frame 3 again, please", { size: 32, color: c.yellow, anchor: "middle", centerY: 380 }));
  parts.push(d.label(x3 + w / 2, 0, "the return channel, allowed from the final on", { size: 20, color: c.gray, anchor: "middle", centerY: 425 }));
  const xn = x0 + 4 * (w + gap);
  parts.push(d.box(xn, y, w, h, "frame 3", { border: c.green, color: c.green, size: 32, width: 4 }));
  parts.push(d.label(xn + w / 2, 0, "ok", { size: 20, color: c.green, anchor: "middle", centerY: y + h + 40 }));
  parts.push(d.label(140, 0, "costs 1.6 % while nothing breaks, and one frame when one breaks.", { size: 32, color: c.white, centerY: 500 }));
  return put("fig-ask-again", d.svg(1680, 530, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-inevitable")) {
  window.drawQr();
  window.drawInevitable();
  window.drawIpoCheck();
  window.drawParity();
  window.drawParityGap();
  window.drawChecksum();
  window.drawHashWhat();
  window.drawHashFlip();
  window.drawLevels();
  window.drawOneBitRaw();
  window.drawOneBitPacked();
  window.drawCost();
  window.drawTriple();
  window.drawAskAgain();
}

window.deck17 = {
  qr: window.drawQr,
  inevitable: window.drawInevitable,
  ipoCheck: window.drawIpoCheck,
  parity: window.drawParity,
  parityGap: window.drawParityGap,
  checksum: window.drawChecksum,
  hashWhat: window.drawHashWhat,
  hashFlip: window.drawHashFlip,
  levels: window.drawLevels,
  oneBitRaw: window.drawOneBitRaw,
  oneBitPacked: window.drawOneBitPacked,
  cost: window.drawCost,
  triple: window.drawTriple,
  askAgain: window.drawAskAgain,
};
