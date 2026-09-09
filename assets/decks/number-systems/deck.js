/* Zeichnungen fuer „why ten?" (Zahlensysteme).
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

/* Das Stellenwertschema: oben die Ziffern, darunter ihre Stellenwerte, und im
 * zweiten Schritt die ausgeschriebene Summe. Dreimal dieselbe Zeichnung mit
 * anderer Basis, damit der Trick durch Wiederholung sitzt. */
function stellenwert(id, ziffern, werte, summe, ergebnis, step, hinweis) {
  const c = d.colors();
  const n = ziffern.length;
  const w = 200, luecke = 40, h = 150;
  const gesamt = n * w + (n - 1) * luecke;
  const x0 = (1680 - gesamt) / 2;
  const parts = [];

  ziffern.forEach((z, i) => {
    const x = x0 + i * (w + luecke);
    parts.push(d.box(x, 60, w, h, z, { size: 80, mono: true, border: c.white }));
    parts.push(d.label(x + w / 2, 0, "×", { size: 32, color: c.gray, anchor: "middle", centerY: 250 }));
    parts.push(d.label(x + w / 2, 0, werte[i], { size: 48, color: c.yellow, anchor: "middle", mono: true, centerY: 330 }));
  });
  parts.push(d.label(x0, 0, hinweis, { size: 20, color: c.gray, centerY: 30 }));
  if (step >= 1) {
    parts.push(d.formula(840, 0, `${summe} = ${ergebnis}`, { size: 48, color: c.white, anchor: "middle", centerY: 460 }));
  }
  return put(id, d.svg(1680, 530, ...parts));
}

window.drawPlace = function (_slide, step = 0) {
  return stellenwert("fig-place", ["1", "2", "3"], ["100", "10", "1"],
                     "1·100 + 2·10 + 3·1", "123", step, "base 10: powers of ten");
};

window.drawEight = function (_slide, step = 0) {
  return stellenwert("fig-eight", ["1", "2", "3"], ["64", "8", "1"],
                     "1·64 + 2·8 + 3·1", "83", step, "base 8: powers of eight");
};

window.drawDolphin = function (_slide, step = 0) {
  return stellenwert("fig-dolphin", ["1", "1", "0"], ["4", "2", "1"],
                     "1·4 + 1·2 + 0·1", "6", step, "base 2: powers of two");
};

/* --- binaer zaehlen ------------------------------------------------------- */

window.drawBinaryCount = function () {
  const c = d.colors();
  const zeilen = [[0, "0"], [1, "1"], [2, "10"], [3, "11"], [4, "100"],
                  [5, "101"], [6, "110"], [7, "111"], [8, "1000"]];
  const parts = [
    d.label(420, 60, "we write", { size: 20, color: c.gray, anchor: "middle" }),
    d.label(760, 60, "the dolphin writes", { size: 20, color: c.gray, anchor: "middle" }),
    d.line(300, 90, 980, 90, { color: c.dark, width: 2 }),
  ];
  zeilen.forEach(([dez, bin], i) => {
    const y = 140 + i * 56;
    const wechsel = bin.length > (zeilen[i - 1] ? zeilen[i - 1][1].length : 1);
    parts.push(d.label(420, 0, String(dez), { size: 32, color: c.light, anchor: "middle", mono: true, centerY: y }));
    parts.push(d.label(760, 0, bin, { size: 32, color: wechsel ? c.yellow : c.white, anchor: "middle", mono: true, centerY: y }));
  });
  parts.push(d.label(1060, 0, "a new place opens\nwhen the digits run out,\njust like 9 to 10",
                     { size: 32, color: c.gray, centerY: 380 }));
  return put("fig-binary-count", d.svg(1680, 660, ...parts));
};

/* --- warum zwei? ---------------------------------------------------------- */

window.drawWhyTwo = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const balken = (x, n, titel, farbe) => {
    const h = 420, y = 70, w = 190;
    parts.push(d.box(x, y, w, h, "", { border: c.light, rounded: false, fill: "none" }));
    for (let i = 1; i < n; i += 1) {
      parts.push(d.line(x, y + (i * h) / n, x + w, y + (i * h) / n, { color: c.gray, width: 2 }));
    }
    // dieselbe Stoerung in beiden Faellen
    const fach = h / n;
    const mitte = y + h / 2 - fach / 2;
    const wackel = 52;
    const passt = wackel < fach / 2;
    const col = passt ? c.white : c.red;
    parts.push(d.line(x + w / 2, mitte - wackel, x + w / 2, mitte + wackel, { color: col, width: 4 }));
    [-wackel, wackel].forEach((dy) => {
      parts.push(d.line(x + w / 2 - 24, mitte + dy, x + w / 2 + 24, mitte + dy, { color: col, width: 4 }));
    });
    parts.push(`<circle cx="${x + w / 2}" cy="${mitte}" r="10" fill="${col}"/>`);
    parts.push(d.label(x + w / 2, y + h + 50, titel, { size: 32, color: farbe, anchor: "middle" }));
  };

  balken(220, 2, "2 states", c.white);
  if (step >= 1) {
    balken(620, 10, "10 states", c.red);
    parts.push(d.label(950, 0, "the same wobble on the wire.\nwith two states it never matters,\nwith ten it always does.",
                       { size: 32, color: c.gray, centerY: 240 }));
    parts.push(d.label(950, 0, "the price: more places.\nplaces are cheap.",
                       { size: 32, color: c.yellow, centerY: 430 }));
  }
  return put("fig-why-two", d.svg(1680, 600, ...parts));
};

/* --- das Byte -------------------------------------------------------------- */

window.drawByte = function (_slide, step = 0) {
  const c = d.colors();
  const bits = [0, 1, 0, 0, 0, 0, 0, 1];
  const werte = [128, 64, 32, 16, 8, 4, 2, 1];
  const w = 150, luecke = 20, x0 = 160, y = 120, h = 150;
  const parts = [d.label(x0, 0, "place values", { size: 20, color: c.gray, centerY: 40 })];
  bits.forEach((b, i) => {
    const x = x0 + i * (w + luecke);
    parts.push(d.label(x + w / 2, 0, String(werte[i]), { size: 32, color: c.gray, anchor: "middle", centerY: 90 }));
    parts.push(d.box(x, y, w, h, String(b), {
      size: 80, mono: true, border: b ? c.yellow : c.dark, color: b ? c.yellow : c.light,
    }));
  });
  if (step >= 1) {
    parts.push(d.formula(840, 0, "64 + 1 = 65", { size: 48, color: c.white, anchor: "middle", centerY: 380 }));
    parts.push(d.formula(840, 0, "2^8 = 256 values, 0 to 255", { size: 32, color: c.gray, anchor: "middle", centerY: 450 }));
  }
  return put("fig-byte", d.svg(1680, 510, ...parts));
};

/* --- hex ------------------------------------------------------------------- */

window.drawHex = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  // ein Byte, in zwei Viererpaeckchen
  const bits = "11010010";
  const w = 96, x0 = 180, y = 80, h = 110;
  bits.split("").forEach((b, i) => {
    const x = x0 + i * (w + 12) + (i >= 4 ? 60 : 0);
    parts.push(d.box(x, y, w, h, b, { size: 48, mono: true, border: b === "1" ? c.yellow : c.dark, color: b === "1" ? c.yellow : c.light }));
  });
  parts.push(d.label(x0 + 2 * (w + 12), 0, "1101", { size: 20, color: c.gray, anchor: "middle", centerY: 230 }));
  parts.push(d.label(x0 + 6 * (w + 12) + 60, 0, "0010", { size: 20, color: c.gray, anchor: "middle", centerY: 230 }));

  if (step >= 1) {
    parts.push(d.arrow(x0 + 2 * (w + 12), 260, x0 + 2 * (w + 12), 330, { color: c.gray, width: 3 }));
    parts.push(d.arrow(x0 + 6 * (w + 12) + 60, 260, x0 + 6 * (w + 12) + 60, 330, { color: c.gray, width: 3 }));
    parts.push(d.label(x0 + 2 * (w + 12), 0, "D", { size: 80, color: c.white, anchor: "middle", mono: true, keepCase: true, centerY: 400 }));
    parts.push(d.label(x0 + 6 * (w + 12) + 60, 0, "2", { size: 80, color: c.white, anchor: "middle", mono: true, centerY: 400 }));
    parts.push(d.label(1180, 0, "four bits have 16 states.\nso one hex digit fits a nibble,\nand a byte fits two.",
                       { size: 32, color: c.gray, centerY: 330 }));
  }
  if (step >= 2) {
    // die sechzehn Ziffern
    const zeichen = "0123456789ABCDEF".split("");
    zeichen.forEach((z, i) => {
      const x = 180 + i * 88;
      parts.push(d.label(x, 0, z, { size: 32, color: i > 9 ? c.yellow : c.light, mono: true, keepCase: true, centerY: 530 }));
      parts.push(d.label(x, 0, String(i), { size: 20, color: c.gray, mono: true, centerY: 575 }));
    });
    parts.push(d.label(180, 0, "ten digits are not enough, so six letters help out",
                       { size: 20, color: c.gray, centerY: 480 }));
  }
  return put("fig-hex", d.svg(1680, 620, ...parts));
};

/* --- zwei Einheitenleitern ------------------------------------------------- */

window.drawLadders = function () {
  const c = d.colors();
  const stufen = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
  const dez = ["1", "1 000", "1 000 000", "1 000 000 000", "1 000 000 000 000"];
  const bin = ["1", "1 024", "1 048 576", "1 073 741 824", "1 099 511 627 776"];
  const parts = [
    d.label(120, 0, "decimal: each step × 1000", { size: 32, color: c.gray, centerY: 60 }),
    d.label(980, 0, "binary: each step × 1024", { size: 32, color: c.yellow, centerY: 60 }),
    d.line(120, 90, 1600, 90, { color: c.dark, width: 2 }),
  ];
  stufen.forEach((name, i) => {
    const y = 150 + i * 80;
    parts.push(d.label(120, 0, name, { size: 32, color: c.light, centerY: y }));
    parts.push(d.label(760, 0, dez[i], { size: 32, color: c.light, mono: true, anchor: "end", centerY: y }));
    parts.push(d.label(1600, 0, bin[i], { size: 32, color: c.yellow, mono: true, anchor: "end", centerY: y }));
  });
  parts.push(d.label(120, 0, "both are called the same in everyday speech. that is where the trouble starts.",
                     { size: 32, color: c.gray, centerY: 590 }));
  return put("fig-ladders", d.svg(1680, 630, ...parts));
};

/* --- die fehlenden 69 Gigabyte --------------------------------------------- */

window.drawDisk = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.box(140, 80, 620, 220, "on the box:\n1 TB", { size: 48, border: c.white, keepCase: true }),
    d.label(140, 0, "1 000 000 000 000 bytes", { size: 32, color: c.gray, mono: true, centerY: 360 }),
    d.label(140, 0, "counted up the decimal ladder, × 1000", { size: 20, color: c.gray, centerY: 410 }),
  ];
  if (step >= 1) {
    parts.push(d.box(920, 80, 620, 220, "your computer:\n931 GB", { size: 48, border: c.red, color: c.red, keepCase: true }));
    parts.push(d.label(920, 0, "1 000 000 000 000 ÷ 1 073 741 824", { size: 32, color: c.gray, mono: true, centerY: 360 }));
    parts.push(d.label(920, 0, "counted down the binary ladder, ÷ 1024³", { size: 20, color: c.gray, centerY: 410 }));
    parts.push(d.arrow(780, 190, 900, 190, { color: c.gray, width: 3 }));
    parts.push(d.label(840, 0, "same bytes", { size: 20, color: c.gray, anchor: "middle", centerY: 150 }));
  }
  return put("fig-disk", d.svg(1680, 460, ...parts));
};

/* --- eure eigene Basis ------------------------------------------------------ */

const LICHT = ["#e03131", "#2f9e44", "#1971c2", "#f2b705"];

window.drawOwnBase = function (_slide, step = 0) {
  const c = d.colors();
  const folge = [0, 3, 1];       // rot, gelb, gruen
  const w = 190, luecke = 40, x0 = 380, y = 80, h = 190;
  const parts = [d.label(x0, 0, "one letter, three colour positions", { size: 20, color: c.gray, centerY: 50 })];

  // ohne Legende kann niemand nachrechnen, welche Farbe welche Ziffer ist
  ["0", "1", "2", "3"].forEach((ziffer, i) => {
    const ly = 110 + i * 74;
    parts.push(feld(120, ly, 56, 56, LICHT[i], 8));
    parts.push(d.label(200, 0, ziffer, { size: 32, color: c.light, mono: true, centerY: ly + 28 }));
  });
  parts.push(d.label(120, 0, "the agreed digits", { size: 20, color: c.gray, centerY: 80 }));

  folge.forEach((farbe, i) => {
    const x = x0 + i * (w + luecke);
    parts.push(feld(x, y, w, h, LICHT[farbe], 10));
    parts.push(d.label(x + w / 2, 0, "×", { size: 32, color: c.gray, anchor: "middle", centerY: y + h + 50 }));
    parts.push(d.formula(x + w / 2, 0, `4^${2 - i}`, { size: 48, color: c.yellow, anchor: "middle", centerY: y + h + 120 }));
  });
  if (step >= 1) {
    parts.push(d.formula(840, 0, "0·16 + 3·4 + 1·1 = 13", { size: 48, color: c.white, anchor: "middle", centerY: 500 }));
  }
  if (step >= 2) {
    parts.push(d.formula(840, 0, "4^3 = 64 combinations, enough for an alphabet",
                         { size: 32, color: c.gray, anchor: "middle", centerY: 570 }));
  }
  return put("fig-own-base", d.svg(1680, 620, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-binary-count")) {
  window.drawBinaryCount();
  window.drawLadders();
}

window.deck10 = {
  place: window.drawPlace,
  eight: window.drawEight,
  binaryCount: window.drawBinaryCount,
  dolphin: window.drawDolphin,
  whyTwo: window.drawWhyTwo,
  byte: window.drawByte,
  hex: window.drawHex,
  ladders: window.drawLadders,
  disk: window.drawDisk,
  ownBase: window.drawOwnBase,
};
