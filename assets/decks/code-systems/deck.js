/* Zeichnungen fuer „what the bits mean" (Codesysteme).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Ausnahme von der Palettenregel: die drei Quadrate im Vergleich der
 * 64er-Codes (drawSixtyFour) tragen echte Lichtfarben, keine Palettenrollen.
 * Sie stehen fuer Farben eines Alphabets, nicht fuer Bedeutung; dieselbe
 * Ausnahme wie in Deck 06 bei der Vereinbarungstabelle. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Echte Werte aus dem Papageienfoto (lifi-concept-demos/assets/photos/parrot.png,
 * 256x256). Ausgelesen beim Bau, damit die Folie nicht behauptet, was sie nicht
 * zeigt: PHOTO_BYTES sind acht aufeinanderfolgende Bytes ab Pixel (192,160),
 * PHOTO_PIXEL ist der Farbwert von Pixel (156,225). PHOTO_URI ist dasselbe Foto
 * als 220er JPEG, damit auch die Abbildungen der Website vollstaendig sind. */
const PHOTO_BYTES = [0x4D, 0x00, 0x00, 0xB0, 0x24, 0x1E, 0xFF, 0x45];
const PHOTO_BYTE_AT = [0.7500, 0.6250];
const PHOTO_PIXEL = [236, 171, 3];
const PHOTO_PIXEL_AT = [0.6094, 0.8789];
/* Das Foto steht als kleines JPEG direkt hier und nicht in einer eigenen Datei:
 * tools/figures.py laedt nur draw.js, deck.js und figures.js, und ohne die
 * Daten bliebe die Miniatur in den Abbildungen der Website leer. */
const PHOTO_URI = "data:image/jpeg;base64,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";

const hex = (v) => v.toString(16).toUpperCase().padStart(2, "0");

/* Mehrere Zeilen in einem Kasten stehen linksbuendig auf einer gemeinsamen
 * Kante, damit Gleichheitszeichen und Werte untereinander liegen; der Block als
 * ganzes sitzt optisch mittig. Geliefert wird diese linke Kante. */
function blockLinks(x, breite, zeilen, size) {
  const breiteste = Math.max(...zeilen.map((z) => z.length)) * size * 0.6;
  return x + (breite - breiteste) / 2;
}

/* Das uebliche Zeichen fuer ein Leerzeichen: eine Grundlinie mit zwei kurzen
 * Aufstrichen. Gezeichnet statt gesetzt, weil die Schrift es nicht sicher hat. */
function leerzeichen(cx, cy, col) {
  const w = 30, h = 13;
  return `<path d="M${cx - w / 2},${cy - h} L${cx - w / 2},${cy} L${cx + w / 2},${cy} L${cx + w / 2},${cy - h}" ` +
    `fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const grau = (v) => `rgb(${v},${v},${v})`;

/* Ausnahme von der Palettenregel: Wo ein Farbalphabet gezeigt wird, tragen die
 * Felder echte Lichtfarben statt Palettenrollen. Sie stehen fuer Farben, nicht
 * fuer Bedeutung; dieselbe Ausnahme wie in Deck 06 bei der Vereinbarungstabelle. */
const ALPHABET = ["#e0322f", "#3ba55d", "#2f7de0", "#e0b32f"];

/* Das Foto als Miniatur mit einer roten Marke an der Stelle, um die es geht.
 * Ein Bild im SVG, damit die Abbildung auch auf der Website vollstaendig ist. */
function miniatur(x, y, size, frac) {
  const c = d.colors();
  const mx = x + frac[0] * size, my = y + frac[1] * size;
  const r = 14;
  // Die Marke bekommt einen hellen Hof: Rot allein verschwindet auf dem roten
  // Gefieder des Vogels, und zwar in beiden Paletten. Einen Rahmen bekommt das
  // Foto nicht, es steht fuer sich.
  const marke = (col, w) =>
    `<rect x="${mx - r}" y="${my - r}" width="${2 * r}" height="${2 * r}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  void c;
  return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="${PHOTO_URI}" preserveAspectRatio="none"/>` +
    marke(d.colors().white, 8) + marke(d.colors().red, 3);
}

/* --- Teil 1 --------------------------------------------------------------- */

/* Ein Zeichen, drei Vereinbarungen: dasselbe A wird zu drei ganz verschiedenen
 * Folgen. Darunter die drei Abgrenzungen, matt, weil sie nur sagen, was ein
 * Code NICHT ist. */
window.drawMapping = function () {
  const c = d.colors();
  const ziele = [
    ["0100 0001", "ascii"],
    [".-", "morse"],
    ["red green green", "a colour code"],
  ];
  const parts = [];
  parts.push(d.box(180, 180, 180, 180, "A", { size: 80, mono: true, keepCase: true, border: c.white }));
  ziele.forEach(([bits, name], i) => {
    const y = 110 + i * 130, h = 110, mid = y + h / 2;
    parts.push(d.arrow(380, 270, 740, mid, { color: c.gray, width: 2 }));
    parts.push(d.box(760, y, 520, h, bits, { size: 48, mono: true, border: c.light }));
    parts.push(d.label(1320, 0, name, { size: 32, color: c.gray, centerY: mid }));
  });
  return put("fig-mapping", d.svg(1680, 520, ...parts));
};

/* ascii: Zeichen, Zahl, und im zweiten Schritt die Bits darunter. */
window.drawAscii = function (_slide, step = 0) {
  const c = d.colors();
  const zeilen = [["A", 65], ["B", 66], ["C", 67], ["a", 97]];
  const parts = [
    d.label(500, 0, "character", { size: 20, color: c.gray, anchor: "middle", centerY: 55 }),
    d.label(800, 0, "number", { size: 20, color: c.gray, anchor: "middle", centerY: 55 }),
    d.label(1110, 0, "bits", { size: 20, color: c.gray, anchor: "middle", centerY: 55 }),
  ];
  zeilen.forEach(([ch, n], i) => {
    const y = 100 + i * 120, mid = y + 45;
    parts.push(d.box(440, y, 120, 90, ch, { size: 48, mono: true, keepCase: true, border: c.white }));
    parts.push(d.arrow(590, mid, 700, mid, { color: c.gray, width: 2 }));
    parts.push(d.label(800, 0, String(n), { size: 48, color: c.white, anchor: "middle", mono: true, centerY: mid }));
    if (step >= 1) {
      const bits = n.toString(2).padStart(8, "0");
      parts.push(d.label(1110, 0, bits.slice(0, 4) + " " + bits.slice(4), {
        size: 48, color: c.light, anchor: "middle", mono: true, centerY: mid,
      }));
    }
  });
  // Die Abgrenzung gehoert zur Definition, aber nur als Randnotiz: Ein Code ist
  // etwas anderes als Verschluesselung, Kompression oder Programmtext.
  parts.push(d.label(840, 0, "a code is not encryption, not compression, and not source code",
                     { size: 20, color: c.dark, anchor: "middle", centerY: 590 }));
  return put("fig-ascii", d.svg(1680, 630, ...parts));
};

/* Die eine Tabelle war zu klein. Erst die Zeichen, die in ascii fehlen, dann
 * die Nummern, die unicode ihnen gibt. Dass utf-8 diese Nummern verschieden
 * lang aufschreibt, steht als Nebensatz darunter: Es ist der zweite Schritt,
 * nicht die Aussage der Folie. */
window.drawUtf8 = function (_slide, step = 0) {
  const c = d.colors();
  const zeichen = [["A", 65, true], ["z", 122, true], ["7", 55, true], ["?", 63, true],
                   ["ä", 228, false], ["€", 8364, false], ["π", 960, false]];
  const cw = 120, gap = 16;
  const x0 = (1680 - (zeichen.length * cw + (zeichen.length - 1) * gap)) / 2;
  const parts = [d.label(840, 0, "does ascii have it?", { size: 20, color: c.gray, anchor: "middle", centerY: 55 })];
  zeichen.forEach(([ch, nr, drin], i) => {
    const x = x0 + i * (cw + gap);
    parts.push(d.box(x, 100, cw, 110, ch, {
      size: 48, mono: true, keepCase: true, border: drin ? c.light : c.red,
    }));
    parts.push(d.mark(x + cw / 2, 270, drin, { size: 30 }));
    if (step >= 1) {
      parts.push(d.label(x + cw / 2, 0, String(nr), {
        size: 32, mono: true, anchor: "middle", color: c.yellow, centerY: 420,
      }));
    }
  });
  if (step >= 1) {
    parts.push(d.label(840, 0, "unicode: a number for every one of them",
                       { size: 32, color: c.white, anchor: "middle", centerY: 350 }));
  }
  parts.push(d.label(840, 0, "utf-8 then writes those numbers down: common ones in one byte, rare ones in up to four",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 520 }));
  return put("fig-utf8", d.svg(1680, 570, ...parts));
};

/* Zwei Tabellen, ein Wort: derselbe Code, zwei Bedeutungen, keine Fehlermeldung. */
window.drawTwoTables = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const tabelle = (x, titel, zeilen) => {
    parts.push(d.box(x, 140, 420, 280, "", { border: c.light }));
    parts.push(d.label(x + 210, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: 185 }));
    const links = blockLinks(x, 420, zeilen.map(([t]) => t), 48);
    zeilen.forEach(([t, hell], i) => {
      parts.push(d.label(links, 0, t, {
        size: 48, mono: true, color: hell ? c.yellow : c.light, centerY: 265 + i * 70,
      }));
    });
  };
  tabelle(60, "sender", [["n = 0110", true], ["m = 1001", false]]);
  tabelle(1200, "receiver", [["n = 1001", false], ["m = 0110", true]]);
  parts.push(d.arrow(500, 270, 1180, 270, { color: c.gray, width: 2 }));
  parts.push(d.label(840, 0, "0110", { size: 48, color: c.yellow, anchor: "middle", mono: true, centerY: 215 }));
  parts.push(d.label(840, 0, "the same bits either way", { size: 20, color: c.gray, anchor: "middle", centerY: 320 }));
  if (step >= 1) {
    parts.push(d.label(270, 0, "typed", { size: 20, color: c.gray, anchor: "middle", centerY: 470 }));
    parts.push(d.label(270, 0, "sonne", { size: 48, color: c.white, anchor: "middle", mono: true, centerY: 530 }));
  }
  if (step >= 2) {
    parts.push(d.label(1410, 0, "printed", { size: 20, color: c.gray, anchor: "middle", centerY: 470 }));
    parts.push(d.label(1410, 0, "somme", { size: 48, color: c.red, anchor: "middle", mono: true, centerY: 530 }));
  }
  return put("fig-two-tables", d.svg(1680, 590, ...parts));
};

/* --- Teil 2 --------------------------------------------------------------- */

/* Wie viele Stellen je Buchstabe? Die Rechnung aus dem Input davor, angewandt.
 * Ueber den Spalten steht, womit gerechnet wird (vier Farben) und wofuer
 * (26 Buchstaben); ohne beides waeren die roten Kreuze nicht gerechtfertigt. */
window.drawPositions = function (_slide, step = 0) {
  const c = d.colors();
  const spalten = [
    ["1 position", "4 codes", "not enough for 26", false],
    ["2 positions", "4 x 4 = 16", "not enough for 26", false],
    ["3 positions", "4 x 4 x 4 = 64", "enough for 26", true],
  ];
  const parts = [d.label(840, 0, "your alphabet", { size: 20, color: c.gray, anchor: "middle", centerY: 30 })];
  ALPHABET.forEach((f, k) => {
    parts.push(`<rect x="${650 + k * 100}" y="50" width="80" height="80" rx="8" fill="${f}"/>`);
  });
  parts.push(d.label(840, 0, "26 letters to encode", { size: 32, color: c.white, anchor: "middle", centerY: 190 }));
  spalten.forEach(([titel, rechnung, fussnote, ok], i) => {
    const x = 60 + i * 550;
    const urteil = step >= i ? ok : null;
    parts.push(d.verdict(x, 230, 460, 260, "", urteil, { border: c.light }));
    parts.push(d.label(x + 230, 0, titel, { size: 32, color: c.gray, anchor: "middle", centerY: 295 }));
    parts.push(d.label(x + 230, 0, rechnung, { size: 48, color: c.white, anchor: "middle", mono: true, centerY: 370 }));
    if (step >= i) {
      parts.push(d.label(x + 230, 0, fussnote, {
        size: 32, color: ok ? c.green : c.red, anchor: "middle", centerY: 545,
      }));
    }
  });
  return put("fig-positions", d.svg(1680, 600, ...parts));
};

/* Das Codebuch als das, was es ist: 64 Plaetze, von denen die meisten leer sind. */
window.drawCodebook = function () {
  const c = d.colors();
  const zeichen = "abcdefghijklmnopqrstuvwxyz".split("")
    .concat([" ", "."], "0123456789".split(""));
  const cw = 120, ch = 84, gap = 10;
  const x0 = (1680 - (8 * cw + 7 * gap)) / 2, y0 = 30;
  const parts = [];
  for (let i = 0; i < 64; i++) {
    const x = x0 + (i % 8) * (cw + gap), y = y0 + Math.floor(i / 8) * (ch + gap);
    const z = zeichen[i];
    const belegt = z !== undefined;
    const extra = belegt && i >= 26;
    parts.push(d.box(x, y, cw, ch, "", { border: belegt ? c.light : c.dark, rx: 6 }));
    if (z === " ") {
      // Das Leerzeichen als Zeichen zu setzen geht nicht: Es ist unsichtbar, und
      // ein Kuerzel wie "sp" liest sich als zwei Buchstaben. Also gezeichnet.
      parts.push(leerzeichen(x + cw / 2, y + 40, c.yellow));
    } else if (belegt) {
      parts.push(d.label(x + cw / 2, 0, z, {
        size: 32, mono: true, anchor: "middle", color: extra ? c.yellow : c.white, centerY: y + 31,
      }));
    }
    const code = i.toString(4).padStart(3, "0");
    parts.push(d.label(x + cw / 2, 0, code, {
      size: 20, mono: true, anchor: "middle", color: belegt ? c.gray : c.dark, centerY: y + 64,
    }));
  }
  return put("fig-codebook", d.svg(1680, y0 + 8 * ch + 7 * gap + 20, ...parts));
};

/* Dieselbe Tabelle, in beide Richtungen gelesen. */
window.drawBothWays = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  // Die Codewoerter sind seit der Codebuch-Folie dreistellig; die Spalten sitzen
  // deshalb weiter rechts, damit die linke Beschriftung nicht aus der Folie laeuft.
  const reihe = (y, kopf, links, kasten, rechts, sichtbar) => {
    const mid = y + 60;
    if (!sichtbar) return;
    parts.push(d.label(750, 0, kopf, { size: 20, color: c.gray, anchor: "middle", mono: true, centerY: y - 40 }));
    parts.push(d.label(380, 0, links, { size: 48, color: c.white, anchor: "end", mono: true, centerY: mid }));
    parts.push(d.arrow(410, mid, 520, mid, { color: c.gray, width: 2 }));
    parts.push(d.box(530, y, 440, 120, kasten, { size: 32, border: c.light }));
    parts.push(d.arrow(990, mid, 1100, mid, { color: c.gray, width: 2 }));
    parts.push(d.label(1130, 0, rechts, { size: 48, color: c.white, anchor: "start", mono: true, centerY: mid }));
  };
  reihe(120, "send_text()", "\"cab\"", "look up", "002 000 001", true);
  reihe(410, "receive_text()", "002 000 001", "look up backwards", "\"cab\"", step >= 1);
  if (step >= 2) {
    parts.push(`<path d="M510,180 L470,180 L470,470 L510,470" fill="none" stroke="${c.yellow}" stroke-width="3"/>`);
    parts.push(d.label(440, 0, "one table", { size: 32, color: c.yellow, anchor: "end", centerY: 325 }));
  }
  return put("fig-both-ways", d.svg(1680, 580, ...parts));
};

/* Was nicht in der Tabelle steht: das Leerzeichen hat keinen Code. Der Anlass
 * steht als Aufruf darueber, damit der praktische Fall klar ist. */
window.drawNotInTable = function () {
  const c = d.colors();
  const text = "guten morgen".split("");
  const cw = 100, gap = 10;
  const x0 = (1680 - (text.length * cw + (text.length - 1) * gap)) / 2;
  const parts = [
    d.label(840, 0, "send_text(\"guten morgen\")",
            { size: 32, mono: true, keepCase: true, color: c.light, anchor: "middle", centerY: 45 }),
    d.label(840, 0, "your codebook has a to z and nothing else",
            { size: 20, color: c.gray, anchor: "middle", centerY: 100 }),
  ];
  text.forEach((ch, i) => {
    const x = x0 + i * (cw + gap);
    const luecke = ch === " ";
    parts.push(d.box(x, 150, cw, 100, luecke ? "space" : ch, {
      size: luecke ? 20 : 48, mono: !luecke, color: luecke ? c.red : c.white,
      border: luecke ? c.red : c.light, dashed: luecke,
    }));
    if (luecke) {
      parts.push(d.label(x + cw / 2, 0, "?", { size: 48, color: c.red, anchor: "middle", mono: true, centerY: 305 }));
    } else {
      parts.push(d.mark(x + cw / 2, 305, true, { size: 30 }));
    }
  });
  parts.push(d.label(840, 0, "three ways out, and you have to pick one",
                     { size: 32, color: c.gray, anchor: "middle", centerY: 390 }));
  ["add it\nto the table", "drop it\nbefore sending", "stop\nwith a message"].forEach((t, i) => {
    parts.push(d.box(60 + i * 550, 430, 460, 150, t, { size: 32, border: c.light }));
  });
  return put("fig-not-in-table", d.svg(1680, 620, ...parts));
};

/* --- Teil 3 --------------------------------------------------------------- */

/* Der Code, der nicht funktioniert, in derselben Sender/Empfaenger-Logik wie
 * die zwei Tabellen: Beide Seiten haben dieselbe Tabelle, und es geht trotzdem
 * schief. Die Lesarten stehen beim Empfaenger, denn er ist es, der sich
 * entscheiden muesste und nicht kann. */
window.drawAmbiguous = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const zeilen = ["a = 0", "b = 01", "c = 10"];
  const tabelle = (x, titel) => {
    parts.push(d.box(x, 40, 420, 280, "", { border: c.light }));
    parts.push(d.label(x + 210, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: 85 }));
    const links = blockLinks(x, 420, zeilen, 48);
    zeilen.forEach((z, i) => {
      parts.push(d.label(links, 0, z, { size: 48, mono: true, color: c.white, centerY: 155 + i * 55 }));
    });
  };
  tabelle(60, "sender");
  tabelle(1200, "receiver");
  parts.push(d.arrow(500, 180, 1180, 180, { color: c.gray, width: 2 }));
  parts.push(d.label(840, 0, "010", { size: 80, color: c.yellow, anchor: "middle", mono: true, centerY: 100 }));
  parts.push(d.label(840, 0, "three bits, no gaps between them",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 245 }));
  parts.push(d.label(270, 0, "typed", { size: 20, color: c.gray, anchor: "middle", centerY: 375 }));
  parts.push(d.label(270, 0, "a c", { size: 48, color: c.white, anchor: "middle", mono: true, centerY: 440 }));
  parts.push(d.label(1410, 0, "could read", { size: 20, color: c.gray, anchor: "middle", centerY: 370 }));

  /* Eine Lesart: die drei Bits als Zellen, darunter Klammern ueber den Gruppen
   * und die Buchstaben, die dabei herauskommen. Kein Pipe-Zeichen und keine
   * Bewertung: Beide Lesarten sind regelkonform, und genau das ist das Problem. */
  const lesart = (y, gruppen) => {
    const bits = "010".split("");
    const zw = 76, luecke = 12;
    const x0 = 1410 - (3 * zw + 2 * luecke) / 2;
    bits.forEach((b, i) => {
      parts.push(d.box(x0 + i * (zw + luecke), y, zw, zw, b, { size: 48, mono: true, border: c.light, rx: 4 }));
    });
    let von = 0;
    gruppen.forEach(([laenge, buchstabe]) => {
      const links = x0 + von * (zw + luecke);
      const rechts = links + laenge * zw + (laenge - 1) * luecke;
      const ky = y + zw + 26;
      parts.push(`<path d="M${links},${ky - 15} L${links},${ky} L${rechts},${ky} L${rechts},${ky - 15}" ` +
                 `fill="none" stroke="${c.light}" stroke-width="3"/>`);
      parts.push(d.label((links + rechts) / 2, 0, buchstabe,
                         { size: 48, mono: true, anchor: "middle", color: c.white, centerY: ky + 44 }));
      von += laenge;
    });
  };
  if (step >= 0) lesart(410, [[1, "a"], [2, "c"]]);
  if (step >= 1) lesart(600, [[2, "b"], [1, "a"]]);
  return put("fig-ambiguous", d.svg(1680, 790, ...parts));
};

/* Drei Auswege, alle gangbar. Kein Rezept: die Wahl bleibt beim Team.
 * Alle drei Spalten zeigen dieselbe Form "a = ...", und die Codezeilen stehen
 * linksbuendig auf einer gemeinsamen Kante, damit die Gleichheitszeichen
 * untereinander liegen; der Block als ganzes sitzt mittig im Kasten. */
window.drawThreeWays = function () {
  const c = d.colors();
  const spalten = [
    ["fixed length", ["a = 00", "b = 01", "c = 10"], "count instead of guessing"],
    ["a separator", ["a = .-", "b = -...", "c = -.-."], "morse pauses between letters"],
    ["no code word\nstarts another", ["a = 0", "b = 10", "c = 110"], "read until it matches"],
  ];
  const parts = [];
  spalten.forEach(([titel, zeilen, fuss], i) => {
    const x = 60 + i * 550;
    const links = blockLinks(x, 460, zeilen, 32);
    parts.push(d.verdict(x, 120, 460, 340, "", true));
    parts.push(d.label(x + 230, 0, titel, { size: 32, color: c.gray, anchor: "middle", centerY: 180 }));
    zeilen.forEach((z, k) => {
      parts.push(d.label(links, 0, z, { size: 32, color: c.white, mono: true, centerY: 260 + k * 55 }));
    });
    parts.push(d.label(x + 230, 0, fuss, { size: 32, color: c.light, anchor: "middle", centerY: 510 }));
  });
  return put("fig-three-ways", d.svg(1680, 560, ...parts));
};

/* Was feste Laenge kostet: dasselbe Wort, in zwei selbstgebauten Codes.
 * Neben jeder Zeile steht die Regel, nach der sie codiert ist, sonst bleibt
 * offen, woher die 30 und die 26 kommen. */
window.drawLengthCost = function () {
  const c = d.colors();
  const wort = "experiment".split("");
  const haeufig = new Set("enisratdhu".split(""));
  const einheit = 30, x0 = 460;
  const parts = [
    d.label(840, 0, "the same word in two codes of your own",
            { size: 20, color: c.gray, anchor: "middle", centerY: 60 }),
  ];
  const balken = (y, breiten, name, regel) => {
    const mid = y + 45;
    let x = x0;
    breiten.forEach((b, i) => {
      const w = b * einheit;
      parts.push(d.box(x, y, w, 90, wort[i], { size: 32, mono: true, keepCase: true, border: c.light, rx: 4 }));
      x += w;
    });
    parts.push(d.label(430, 0, name, { size: 32, color: c.white, anchor: "end", centerY: mid - 22 }));
    parts.push(d.label(430, 0, regel, { size: 20, color: c.gray, anchor: "end", centerY: mid + 22 }));
    // Die Summen stehen an einer gemeinsamen Kante, nicht am Ende des jeweiligen
    // Balkens: So liegt der Laengenunterschied als Luecke zwischen beiden Zeilen.
    const gesamt = breiten.reduce((a, b) => a + b, 0);
    parts.push(d.label(1400, 0, gesamt + " positions", { size: 32, color: c.white, centerY: mid - 22 }));
    parts.push(d.label(1400, 0, (gesamt / wort.length).toFixed(1) + " per letter",
                       { size: 20, color: c.gray, centerY: mid + 22 }));
  };
  balken(140, wort.map(() => 3), "fixed", "three positions for every letter");
  balken(300, wort.map((ch) => (haeufig.has(ch) ? 2 : 4)), "variable", "two for the common ones, four for the rest");
  parts.push(d.label(840, 0, "the ten most common letters in german and english: e n i s r a t d h u",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 460 }));
  return put("fig-length-cost", d.svg(1680, 510, ...parts));
};

/* --- Teil 4 --------------------------------------------------------------- */

/* Acht echte Bytes aus dem Foto, drei Lesarten. */
window.drawThreeReadings = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [miniatur(80, 60, 220, PHOTO_BYTE_AT)];
  parts.push(d.label(190, 0, "the photo", { size: 20, color: c.gray, anchor: "middle", centerY: 305 }));
  parts.push(d.arrow(320, 170, 430, 170, { color: c.gray, width: 2 }));

  const bw = 130, gap = 10, bx = 460;
  PHOTO_BYTES.forEach((v, i) => {
    parts.push(d.box(bx + i * (bw + gap), 120, bw, 100, hex(v), { size: 32, mono: true, keepCase: true, border: c.white }));
  });
  parts.push(d.label(bx, 0, "eight bytes out of the middle of it", { size: 20, color: c.gray, centerY: 90 }));

  if (step >= 1) {
    const spalten = [
      ["as text", (x, y, w) => PHOTO_BYTES.map((v, i) =>
        d.label(x + (w - 7 * 44) / 2 + i * 44, 0, v >= 33 && v <= 126 ? String.fromCharCode(v) : ".",
                { size: 32, mono: true, keepCase: true, anchor: "middle", color: c.light, centerY: y + 100 })).join("")],
      ["as grey values", (x, y, w) => PHOTO_BYTES.map((v, i) =>
        `<rect x="${x + (w - 8 * 40) / 2 + i * 40}" y="${y + 67}" width="34" height="66" fill="${grau(v)}" stroke="${c.dark}" stroke-width="1"/>`).join("")],
      ["as audio", (x, y, w) => {
        const pts = PHOTO_BYTES.map((v, i) => `${x + (w - 7 * 52) / 2 + i * 52},${y + 130 - (v / 255) * 80}`).join(" ");
        return `<polyline points="${pts}" fill="none" stroke="${c.light}" stroke-width="3"/>` +
          PHOTO_BYTES.map((v, i) => `<circle cx="${x + (w - 7 * 52) / 2 + i * 52}" cy="${y + 130 - (v / 255) * 80}" r="5" fill="${c.light}"/>`).join("");
      }],
    ];
    spalten.forEach(([titel, zeichnen], i) => {
      const x = 220 + i * 450, y = 330, w = 420;
      parts.push(d.arrow(840, 250, x + w / 2, y - 10, { color: c.gray, width: 2 }));
      parts.push(d.box(x, y, w, 180, "", { border: c.light }));
      parts.push(d.label(x + w / 2, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: y + 35 }));
      parts.push(zeichnen(x, y, w));
    });
  }
  return put("fig-three-readings", d.svg(1680, 560, ...parts));
};

/* Ein Bildpunkt sind drei Zahlen, und es sind genau die des Senders.
 * Das Foto sitzt an derselben Stelle wie auf der Folie davor (gleicher Ort,
 * gleiche viewBox-Hoehe), damit es beim Weiterblaettern nicht springt. Statt
 * eines eigenen Farbkastens traegt die Hex-Schreibweise die Farbe selbst. */
window.drawPixel = function () {
  const c = d.colors();
  const [r, g, b] = PHOTO_PIXEL;
  const farbe = `rgb(${r},${g},${b})`;
  const parts = [
    miniatur(80, 60, 220, PHOTO_PIXEL_AT),
    d.label(190, 0, "one pixel of it", { size: 20, color: c.gray, anchor: "middle", centerY: 305 }),
    d.arrow(320, 170, 430, 170, { color: c.gray, width: 2 }),
  ];
  const maxb = 760;
  [["red", r], ["green", g], ["blue", b]].forEach(([name, v], i) => {
    const y = 70 + i * 80, mid = y + 30;
    parts.push(d.label(590, 0, name, { size: 32, color: c.gray, anchor: "end", centerY: mid }));
    parts.push(`<rect x="620" y="${y}" width="${(v / 255) * maxb}" height="60" rx="4" fill="${c.dark}"/>`);
    parts.push(d.label(1560, 0, String(v), { size: 32, color: c.white, anchor: "end", mono: true, centerY: mid }));
  });
  parts.push(d.label(840, 0, "the same colour, written as hex: two places per byte",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 400 }));
  parts.push(d.label(840, 0, "#" + hex(r) + hex(g) + hex(b),
                     { size: 80, color: farbe, anchor: "middle", mono: true, keepCase: true, centerY: 490 }));
  return put("fig-pixel", d.svg(1680, 560, ...parts));
};

/* Wer sagt, welche Lesart gilt? Drei Antworten, und die dritte baut ihr selbst. */
window.drawWhoSays = function () {
  const c = d.colors();
  const spalten = [
    ["the file extension", ".txt   .png   .wav", false],
    ["a header in the file", "the first bytes say it", false],
    ["a type field in your frame", "you decide what it says", true],
  ];
  const parts = [];
  spalten.forEach(([titel, unten, eigen], i) => {
    const x = 60 + i * 550;
    parts.push(d.box(x, 140, 460, 300, "", { border: eigen ? c.yellow : c.light }));
    parts.push(d.label(x + 230, 0, titel, { size: 32, color: eigen ? c.yellow : c.white, anchor: "middle", centerY: 230 }));
    parts.push(d.label(x + 230, 0, unten, { size: 32, color: c.gray, anchor: "middle", mono: i === 0, centerY: 320 }));
    if (eigen) parts.push(d.label(x + 230, 0, "challenge 3", { size: 20, color: c.yellow, anchor: "middle", centerY: 400 }));
  });
  return put("fig-who-says", d.svg(1680, 500, ...parts));
};

/* --- Teil 5 --------------------------------------------------------------- */

/* Braille, DNA und euer Alphabet rechnen dieselbe Rechnung. */
window.drawSixtyFour = function () {
  const c = d.colors();
  const parts = [];
  const spalte = (i, titel, glyph, unten, formel) => {
    const x = 60 + i * 550;
    parts.push(d.label(x + 230, 0, titel, { size: 32, color: c.gray, anchor: "middle", centerY: 60 }));
    parts.push(d.box(x, 100, 460, 420, "", { border: c.light }));
    parts.push(glyph(x + 230));
    parts.push(d.label(x + 230, 0, unten, { size: 32, color: c.light, anchor: "middle", centerY: 390 }));
    parts.push(d.formula(x + 230, 0, formel, { size: 48, color: c.white, anchor: "middle", centerY: 465 }));
  };

  spalte(0, "braille", (cx) => {
    const gefuellt = [true, true, false, true, false, false];   // das Muster fuer „f"
    let s = "";
    gefuellt.forEach((an, k) => {
      const px = cx - 45 + (k % 2) * 90, py = 190 + Math.floor(k / 2) * 70;
      s += `<circle cx="${px}" cy="${py}" r="24" fill="${an ? c.white : "none"}" stroke="${an ? c.white : c.dark}" stroke-width="3"/>`;
    });
    return s;
  }, "2 states, 6 positions", "2^6 = 64");

  spalte(1, "dna", (cx) => "ACG".split("").map((base, k) =>
    d.box(cx - 165 + k * 110, 150, 90, 90, base, { size: 48, mono: true, keepCase: true, border: c.light })
  ).join(""), "4 bases, 3 positions", "4^3 = 64");

  spalte(2, "your alphabet", (cx) => ALPHABET.slice(0, 3).map((f, k) =>
    `<rect x="${cx - 165 + k * 110}" y="150" width="90" height="90" rx="8" fill="${f}"/>`
  ).join(""), "4 colours, 3 positions", "4^3 = 64");

  return put("fig-sixty-four", d.svg(1680, 520, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-mapping")) {
  window.drawMapping();
  window.drawCodebook();
  window.drawNotInTable();
  window.drawThreeWays();
  window.drawLengthCost();
  window.drawPixel();
  window.drawWhoSays();
  window.drawSixtyFour();
}

window.deck08 = {
  mapping: window.drawMapping,
  ascii: window.drawAscii,
  utf8: window.drawUtf8,
  twoTables: window.drawTwoTables,
  positions: window.drawPositions,
  codebook: window.drawCodebook,
  bothWays: window.drawBothWays,
  notInTable: window.drawNotInTable,
  ambiguous: window.drawAmbiguous,
  threeWays: window.drawThreeWays,
  lengthCost: window.drawLengthCost,
  threeReadings: window.drawThreeReadings,
  pixel: window.drawPixel,
  whoSays: window.drawWhoSays,
  sixtyFour: window.drawSixtyFour,
};
