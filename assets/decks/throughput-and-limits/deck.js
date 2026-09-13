/* Zeichnungen fuer „why is it still not done?" (Durchsatz und Grenzen).
 * Die Kompressionszeichnungen leben seit dem 13.09.2026 in Deck 15 (../../15-compression/web/deck.js).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Ein waagerechter Balken aus Abschnitten. Jeder Abschnitt ist [anteil, farbe,
 * deckkraft]; die Summe der Anteile ergibt die volle Breite. */
function balken(x, y, breite, hoehe, teile) {
  const gesamt = teile.reduce((s, t) => s + t[0], 0);
  let lauf = x;
  return teile.map(([anteil, farbe, deckkraft]) => {
    const w = (anteil / gesamt) * breite;
    const teil = `<rect x="${lauf.toFixed(1)}" y="${y}" width="${Math.max(0, w - 3).toFixed(1)}" ` +
                 `height="${hoehe}" rx="4" fill="${farbe}" fill-opacity="${deckkraft}"/>`;
    lauf += w;
    return teil;
  });
}

/* --- Teil 1: where the time goes ------------------------------------------ */

/* Brutto gegen netto: derselbe Balken, einmal ganz Nutzdaten, einmal nicht. */
window.drawGrossNet = function () {
  const c = d.colors();
  const x0 = 360, breite = 1040, h = 110;
  const parts = [];
  const reihe = (y, titel, teile, wert) => {
    parts.push(d.label(x0 - 40, 0, titel, { size: 32, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    parts.push(...balken(x0, y, breite, h, teile));
    parts.push(d.label(x0 + breite + 40, 0, wert, { size: 32, mono: true, color: c.yellow, centerY: y + h / 2 }));
  };
  reihe(120, "gross", [[1, c.yellow, 0.85]], "24 bit/s");
  reihe(320, "net", [[10.8, c.yellow, 0.85], [13.2, c.dark, 0.9]], "10.8 bit/s");
  parts.push(d.label(x0, 0, "markers, preamble, end marker, repeats", { size: 20, color: c.gray, centerY: 480 }));
  return put("fig-gross-net", d.svg(1680, 503, ...parts));
};

/* Wo die 24 geblieben sind: die Abzuege greifen nacheinander. */
window.drawDeductions = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 420, breite = 900, h = 84;
  const parts = [];
  const zeile = (y, titel, anteil, wert, farbe) => {
    parts.push(d.label(x0 - 40, 0, titel, { size: 20, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    parts.push(...balken(x0, y, breite, h, [[anteil, farbe, 0.85], [1 - anteil, c.dark, 0.9]]));
    parts.push(d.label(x0 + breite + 40, 0, wert, { size: 32, mono: true, color: farbe, centerY: y + h / 2 }));
  };
  zeile(110, "every symbol carries data", 1, "24.0", c.yellow);
  if (step >= 1) zeile(240, "minus every fourth symbol: a marker", 0.75, "18.0", c.yellow);
  if (step >= 2) zeile(370, "minus 40 % of the rest: the frame", 0.45, "10.8", c.yellow);
  if (step >= 3) {
    parts.push(d.box(x0 - 40, 500, 980, 120, "", { border: c.red }));
    parts.push(d.label(x0 + 450, 0, "25 % + 40 % = 65 %, so 8.4?",
                       { size: 32, color: c.red, anchor: "middle", centerY: 545 }));
    parts.push(d.label(x0 + 450, 0, "no. the second cut only applies to what the first left over.",
                       { size: 20, color: c.red, anchor: "middle", centerY: 592 }));
  }
  return put("fig-deductions", d.svg(1680, 660, ...parts));
};

/* Der Hebel jenseits des Engpasses. */
window.drawWrongLever = function () {
  const c = d.colors();
  const parts = [];
  const seite = (x, titel, symbolBreite, ok) => {
    const y = 150, h = 110, bw = 640;
    parts.push(d.label(x + bw / 2, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: y - 40 }));
    const n = Math.ceil(bw / symbolBreite);
    for (let i = 0; i < n; i++) {
      const bx = x + i * symbolBreite;
      const w = Math.min(symbolBreite - 4, x + bw - bx);
      if (w <= 0) break;
      parts.push(`<rect x="${bx}" y="${y}" width="${w}" height="${h}" rx="5" ` +
                 `fill="${["#e0322f", "#3ba55d", "#2f7de0"][i % 3]}" fill-opacity="0.6"/>`);
    }
    // Das Messfenster als Klammer darunter, immer gleich breit: 50 ms
    // Links passt das Fenster in ein Symbol, rechts reicht es ueber eine
    // Grenze: genau das ist der Unterschied, den die Folie zeigt.
    const fw = 160, fx = x + (ok ? 40 : 80);
    parts.push(`<rect x="${fx}" y="${y + h + 26}" width="${fw}" height="42" rx="6" ` +
               `fill="none" stroke="${c.yellow}" stroke-width="3"/>`);
    parts.push(d.label(fx + fw / 2, 0, "50 ms window", { size: 20, color: c.yellow, anchor: "middle", centerY: y + h + 47 }));
    parts.push(d.label(x + bw / 2, 0, ok ? "20 bit/s, and all of it readable" : "40 bit/s on paper, nothing readable",
                       { size: 32, color: ok ? c.green : c.red, anchor: "middle", centerY: y + h + 130 }));
  };
  seite(100, "10 symbols per second: a symbol is 100 ms", 320, true);
  seite(940, "20 symbols per second: a symbol is 50 ms", 160, false);
  return put("fig-wrong-lever", d.svg(1680, 420, ...parts));
};

/* --- Teil 2: three levers ------------------------------------------------- */

/* Die drei Hebel, jeder mit seinem Preis. */
window.drawLevers = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.formula(840, 0, "t = n / (r * b)", { size: 80, color: c.yellow, anchor: "middle", centerY: 100 }),
  ];
  const hebel = [
    ["b", "more bits per symbol", "costs safety margin: narrower bands"],
    ["r", "more symbols per second", "costs the measurement window"],
    ["n", "fewer bits in total", "costs a few milliseconds of computing"],
  ];
  hebel.forEach(([zeichen, was, preis], i) => {
    if (step < i + 1) return;
    const y = 240 + i * 130;
    parts.push(d.label(300, 0, zeichen, { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: y }));
    parts.push(d.label(380, 0, was, { size: 32, color: c.white, centerY: y - 20 }));
    parts.push(d.label(380, 0, preis, { size: 20, color: c.gray, centerY: y + 26 }));
  });
  return put("fig-levers", d.svg(1680, 549, ...parts));
};

/* Dieselben 20 bit/s auf zwei Wegen. */
window.drawSameRate = function () {
  const c = d.colors();
  const parts = [];
  const team = (x, name, rate, bits, eng) => {
    // Der Kasten ist 330 hoch, damit unter der letzten Zeile derselbe
    // Abstand bleibt wie ueber der ersten: oben 170 - 16 - 110 = 44,
    // unten 440 - (370 + 24) = 46.
    parts.push(d.box(x, 110, 640, 330, "", { border: c.light }));
    parts.push(d.label(x + 320, 0, name, { size: 32, color: c.gray, anchor: "middle", centerY: 170 }));
    parts.push(d.formula(x + 320, 0, rate, { size: 48, color: c.white, anchor: "middle", centerY: 250 }));
    parts.push(d.label(x + 320, 0, bits, { size: 20, color: c.gray, anchor: "middle", centerY: 310 }));
    parts.push(d.label(x + 320, 0, "20 bit/s", { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: 370 }));
    parts.push(d.label(x + 320, 0, eng, { size: 32, color: c.red, anchor: "middle", centerY: 505 }));
  };
  team(100, "team a", "10 * 2", "10 symbols per second, 4 colours", "close to the measurement window");
  team(940, "team b", "5 * 4", "5 symbols per second, 16 colours", "close to the scatter limit");
  return put("fig-same-rate", d.svg(1680, 530, ...parts));
};

/* --- Teil 3: what it costs to be sure ------------------------------------- */

/* Drei Hebel auf dieselbe Datei. */
window.drawThreeOnOne = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 540, breite = 960, h = 78;
  const parts = [];
  const zeile = (i, name, minuten, farbe) => {
    const y = 120 + i * 130;
    parts.push(d.label(x0 - 40, 0, name, { size: 32, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    parts.push(...balken(x0, y, breite, h, [[minuten, farbe, 0.85], [27 - minuten, c.dark, 0.9]]));
    parts.push(d.label(x0 + breite + 40, 0, minuten + " min", { size: 32, mono: true, color: farbe, centerY: y + h / 2 }));
  };
  zeile(0, "as it is", 27, c.light);
  if (step >= 1) zeile(1, "8 colours instead of 4", 18, c.yellow);
  if (step >= 2) zeile(2, "compressed to 60 %", 16, c.yellow);
  if (step >= 3) zeile(3, "both", 11, c.green);
  parts.push(d.label(x0 - 40, 0, "16 000 bits, 5 symbols per second", { size: 20, color: c.gray, anchor: "end", centerY: 660 }));
  return put("fig-three-on-one", d.svg(1680, 700, ...parts));
};

/* Elf Sendungen fuer zehn Zustellungen. */
window.drawRepeats = function () {
  const c = d.colors();
  const x0 = 200, zw = 108, h = 96, y = 160;
  const parts = [];
  // Zehn gute und eine Wiederholung: die siebte geht schief
  // Zehn zugestellte Nachrichten (gelb) und eine verdorbene (rot): elf Sendungen.
  const folge = [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1];
  folge.forEach((gut, i) => {
    parts.push(`<rect x="${x0 + i * zw}" y="${y}" width="${zw - 8}" height="${h}" rx="5" ` +
               `fill="${gut ? c.yellow : c.red}" fill-opacity="${gut ? 0.85 : 0.5}"/>`);
  });
  parts.push(d.label(x0 + 6 * zw + (zw - 8) / 2, 0, "damaged, sent again",
                     { size: 20, color: c.red, anchor: "middle", centerY: y - 30 }));
  parts.push(d.label(x0, 0, "11 transmissions", { size: 32, color: c.gray, centerY: y + h + 60 }));
  parts.push(d.label(x0, 0, "10 messages delivered", { size: 32, color: c.gray, centerY: y + h + 112 }));
  parts.push(d.formula(x0 + 720, 0, "10 / 11 = 0.91", { size: 48, color: c.yellow, centerY: y + h + 60 }));
  parts.push(d.label(x0 + 720, 0, "not 0.90", { size: 32, color: c.red, centerY: y + h + 118 }));
  return put("fig-repeats", d.svg(1680, 404, ...parts));
};

/* Einzeln quittieren gegen blockweise. */
window.drawAcks = function () {
  const c = d.colors();
  const x0 = 320, breite = 1180, h = 72;
  const parts = [];
  const reihe = (y, titel, bloecke, warten) => {
    parts.push(d.label(x0 - 40, 0, titel, { size: 20, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    const teile = [];
    for (let i = 0; i < bloecke; i++) {
      teile.push([10 / bloecke, c.yellow, 0.85]);
      teile.push([warten, c.dark, 0.9]);
    }
    parts.push(...balken(x0, y, breite, h, teile));
  };
  reihe(130, "acknowledge every message", 10, 0.6);
  reihe(300, "acknowledge every block of ten", 1, 0.6);
  parts.push(d.label(x0, 0, "yellow: payload   ·   dark: waiting for the acknowledgement",
                     { size: 20, color: c.gray, centerY: 430 }));
  parts.push(d.label(x0, 0, "but one damaged message costs the whole block again",
                     { size: 32, color: c.red, centerY: 500 }));
  return put("fig-acks", d.svg(1680, 530, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-gross-net")) {
  window.drawGrossNet();
  window.drawDeductions();
  window.drawWrongLever();
  window.drawLevers();
  window.drawSameRate();
  window.drawThreeOnOne();
  window.drawRepeats();
  window.drawAcks();
}

window.deck14 = {
  grossNet: window.drawGrossNet,
  deductions: window.drawDeductions,
  wrongLever: window.drawWrongLever,
  levers: window.drawLevers,
  sameRate: window.drawSameRate,
  threeOnOne: window.drawThreeOnOne,
  repeats: window.drawRepeats,
  acks: window.drawAcks,
};
