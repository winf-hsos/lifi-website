/* Zeichnungen fuer „why 16 and not 4?" (Signal und Rauschen).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Alle Rauschbilder stammen aus demselben Zufallsgenerator mit festem Startwert
 * (rnd unten). Das ist Absicht: Die Abbildung soll bei jedem Rendern gleich
 * aussehen, sonst wandert sie zwischen Folie, PDF und Website. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Ausnahme von der Palettenregel: Wo eine gemessene Farbe gezeigt wird, traegt
 * das Feld eine echte Lichtfarbe statt einer Palettenrolle. Sie steht fuer eine
 * Farbe, nicht fuer Bedeutung; dieselbe Ausnahme wie in Deck 06 und 08. */
const MESSFARBE = "#e0b32f";

/* Fester Startwert, damit jede Zeichnung reproduzierbar ist. */
function zufall(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Normalverteilte Zufallszahlen (Box-Muller), fuer das Rauschen. */
function rauschen(seed) {
  const r = zufall(seed);
  return () => {
    const u = Math.max(r(), 1e-9), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

/* --- Teil 1 --------------------------------------------------------------- */

/* Zehn Messungen derselben Farbe. Die Grundtatsache, auf der alles steht:
 * nichts hat sich geaendert, die Zahlen schon. */
const MESSUNGEN = [214, 211, 218, 209, 216, 213, 220, 207, 215, 212];

window.drawReadings = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    `<rect x="120" y="80" width="200" height="200" rx="10" fill="${MESSFARBE}"/>`,
    d.label(220, 0, "the same colour", { size: 20, color: c.gray, anchor: "middle", centerY: 320 }),
    d.label(220, 0, "ten times", { size: 20, color: c.gray, anchor: "middle", centerY: 350 }),
    d.label(440, 0, "what the sensor reports", { size: 20, color: c.gray, centerY: 95 }),
  ];
  const zx = (i) => 440 + i * 120;
  MESSUNGEN.forEach((v, i) => {
    if (i > 0 && step < 1) return;
    parts.push(d.label(zx(i), 0, String(v), { size: 32, mono: true, color: c.white, centerY: 165 }));
  });

  if (step >= 2) {
    // Dieselben zehn Werte auf einer Zahlenachse, dazu die Spannweite
    const lo = 204, hi = 223;
    const ax = 440, aw = 1080, ay = 330;
    const px = (v) => ax + ((v - lo) / (hi - lo)) * aw;
    parts.push(d.line(ax, ay, ax + aw, ay, { color: c.dark, width: 2 }));
    [205, 210, 215, 220].forEach((v) => {
      parts.push(d.line(px(v), ay - 8, px(v), ay + 8, { color: c.dark, width: 2 }));
      parts.push(d.label(px(v), 0, String(v), { size: 20, color: c.gray, anchor: "middle", centerY: ay + 40 }));
    });
    MESSUNGEN.forEach((v) => {
      parts.push(`<circle cx="${px(v)}" cy="${ay}" r="9" fill="${c.yellow}"/>`);
    });
    const a = px(Math.min(...MESSUNGEN)), b = px(Math.max(...MESSUNGEN));
    parts.push(`<path d="M${a},${ay + 70} L${a},${ay + 85} L${b},${ay + 85} L${b},${ay + 70}" ` +
               `fill="none" stroke="${c.light}" stroke-width="3"/>`);
    parts.push(d.label((a + b) / 2, 0, "spread: 207 to 220",
                       { size: 32, color: c.light, anchor: "middle", centerY: ay + 130 }));
  }
  return put("fig-readings", d.svg(1680, 510, ...parts));
};

/* --- Teil 2 --------------------------------------------------------------- */

/* Dasselbe Rohsignal, in immer laengere Messfenster zerlegt. Die zentrale
 * Abbildung des Konzepts; sie heisst auf der Website weiterhin
 * `signal-and-noise`, weil sn-002 ueber das Feld `bild` darauf zeigt. */
const ROH = (() => {
  const n = rauschen(20260907);
  return Array.from({ length: 288 }, () => n());
})();

window.drawWindows = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 300, breite = 1080, hoehe = 92, luecke = 62;
  const streifen = [["raw signal", 1], ["window 4", 4], ["window 12", 12], ["window 32", 32]];
  const parts = [];
  streifen.forEach(([name, fenster], k) => {
    if (k > step) return;
    const y = 70 + k * (hoehe + luecke);
    const mitte = y + hoehe / 2;
    parts.push(d.label(x0 - 40, 0, name, { size: 32, color: c.gray, anchor: "end", centerY: mitte }));
    parts.push(d.line(x0, mitte, x0 + breite, mitte, { color: c.dark, width: 2, dashed: true }));
    if (fenster === 1) {
      const pts = ROH.map((v, i) => `${x0 + (i / (ROH.length - 1)) * breite},${mitte - v * 28}`).join(" ");
      parts.push(`<polyline points="${pts}" fill="none" stroke="${c.light}" stroke-width="2"/>`);
    } else {
      const anzahl = Math.floor(ROH.length / fenster);
      const bw = breite / anzahl;
      for (let i = 0; i < anzahl; i++) {
        const teil = ROH.slice(i * fenster, (i + 1) * fenster);
        const m = teil.reduce((a, b) => a + b, 0) / teil.length;
        const bx = x0 + i * bw;
        parts.push(d.line(bx + 3, mitte - m * 28, bx + bw - 3, mitte - m * 28,
                          { color: c.white, width: 6 }));
      }
      parts.push(d.label(x0 + breite + 30, 0, anzahl + " readings",
                         { size: 20, color: c.gray, centerY: mitte }));
    }
  });
  return put("fig-signal-and-noise", d.svg(1680, 70 + 4 * (hoehe + luecke), ...parts));
};

/* Eine Messwertwolke als Glockenkurve, gezeichnet als gefuellter Pfad.
 * `von` und `bis` schneiden ein Stueck heraus (in Vielfachen von breite,
 * -1 bis 1); damit laesst sich genau der Teil einfaerben, der ueber die
 * Grenze faellt, statt der ganzen Wolke. */
function wolke(mx, breite, hoehe, basis, farbe, deckkraft = 0.55, von = -1, bis = 1) {
  const pts = [];
  const n = 64;
  for (let i = 0; i <= n; i++) {
    const f = von + (i / n) * (bis - von);
    const t = f * 3;
    const x = mx + f * breite;
    const y = basis - hoehe * Math.exp(-(t * t) / 2);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `<path d="M${(mx + von * breite).toFixed(1)},${basis} L${pts.join(" L")} L${(mx + bis * breite).toFixed(1)},${basis} Z" ` +
    `fill="${farbe}" fill-opacity="${deckkraft}" stroke="${farbe}" stroke-width="2"/>`;
}

/* Zwei Symbole, zwei Wolken: einmal sauber getrennt, einmal ueberlappend. */
window.drawTwoClouds = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const panel = (x, titel, sigma, ok) => {
    const basis = 430, hoehe = 200, mitteA = x + 250, mitteB = x + 490;
    parts.push(d.label(x + 370, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: 50 }));
    parts.push(d.line(x + 10, basis, x + 730, basis, { color: c.dark, width: 2 }));
    parts.push(wolke(mitteA, sigma, hoehe, basis, c.light));
    parts.push(wolke(mitteB, sigma, hoehe, basis, c.light));
    parts.push(d.label(mitteA, 0, "symbol a", { size: 20, color: c.gray, anchor: "middle", centerY: basis + 40 }));
    parts.push(d.label(mitteB, 0, "symbol b", { size: 20, color: c.gray, anchor: "middle", centerY: basis + 40 }));
    // Abstand d zwischen den Mitten
    parts.push(d.line(mitteA, 130, mitteB, 130, { color: c.yellow, width: 3 }));
    parts.push(d.line(mitteA, 122, mitteA, 138, { color: c.yellow, width: 3 }));
    parts.push(d.line(mitteB, 122, mitteB, 138, { color: c.yellow, width: 3 }));
    parts.push(d.label((mitteA + mitteB) / 2, 0, "d", { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: 105 }));
    // Breite s einer Wolke
    parts.push(d.line(mitteB - sigma, basis + 80, mitteB + sigma, basis + 80, { color: c.yellow, width: 3 }));
    parts.push(d.line(mitteB - sigma, basis + 72, mitteB - sigma, basis + 88, { color: c.yellow, width: 3 }));
    parts.push(d.line(mitteB + sigma, basis + 72, mitteB + sigma, basis + 88, { color: c.yellow, width: 3 }));
    parts.push(d.label(mitteB, 0, "s", { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: basis + 125 }));
    if (!ok) {
      // Rot ist nur der Teil jeder Wolke, der ueber die Grenze faellt: genau die
      // Messungen, die beim Empfaenger auf der falschen Seite landen.
      const grenze = (mitteA + mitteB) / 2;
      parts.push(wolke(mitteA, sigma, hoehe, basis, c.red, 0.9, (grenze - mitteA) / sigma, 1));
      parts.push(wolke(mitteB, sigma, hoehe, basis, c.red, 0.9, -1, (grenze - mitteB) / sigma));
      parts.push(d.line(grenze, 190, grenze, basis, { color: c.red, width: 2, dashed: true }));
      parts.push(d.label(grenze, 0, "the boundary", { size: 20, color: c.red, anchor: "middle", centerY: 175 }));
    }
    parts.push(d.label(x + 370, 0, ok ? "every reading lands on its own side" : "some readings land on the wrong side",
                       { size: 32, color: ok ? c.green : c.red, anchor: "middle", centerY: basis + 180 }));
  };
  panel(60, "narrow clouds", 90, true);
  if (step >= 1) panel(900, "same distance, wider clouds", 230, false);
  return put("fig-two-clouds", d.svg(1680, 660, ...parts));
};

/* Das Verhaeltnis, und was „sicher unterscheidbar" heisst. */
window.drawRatio = function () {
  const c = d.colors();
  const basis = 520, hoehe = 150, sigma = 90, mitteA = 560, mitteB = 1120;
  const parts = [
    d.formula(840, 0, "d / s", { size: 80, color: c.yellow, anchor: "middle", centerY: 100 }),
    d.label(600, 0, "d", { size: 32, mono: true, color: c.yellow, centerY: 200 }),
    d.label(680, 0, "distance between two symbols", { size: 32, color: c.light, centerY: 200 }),
    d.label(600, 0, "s", { size: 32, mono: true, color: c.yellow, centerY: 255 }),
    d.label(680, 0, "spread of your readings", { size: 32, color: c.light, centerY: 255 }),
    d.line(200, 320, 1480, 320, { color: c.dark, width: 2 }),
    d.line(300, basis, 1380, basis, { color: c.dark, width: 2 }),
    wolke(mitteA, sigma, hoehe, basis, c.light),
    wolke(mitteB, sigma, hoehe, basis, c.light),
  ];
  // Die volle Ausdehnung jeder Wolke als Klammer, dazu die Luecke dazwischen.
  // Klammer und Beschriftung sehen aus wie auf der Folie davor: gelb und `s`.
  // Streuung ist dieselbe Groesse, also traegt sie auch dasselbe Zeichen.
  [mitteA, mitteB].forEach((m) => {
    parts.push(`<path d="M${m - sigma},${basis + 45} L${m - sigma},${basis + 30} L${m + sigma},${basis + 30} L${m + sigma},${basis + 45}" ` +
               `fill="none" stroke="${c.yellow}" stroke-width="3"/>`);
    parts.push(d.label(m, 0, "s", { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: basis + 90 }));
  });
  parts.push(d.line(mitteA + sigma, basis + 30, mitteB - sigma, basis + 30, { color: c.dark, width: 2, dashed: true }));
  parts.push(d.label(840, 0, "a gap between them, not a touch: that is what safely distinguishable means",
                     { size: 20, color: c.gray, anchor: "middle", centerY: basis + 145 }));
  return put("fig-ratio", d.svg(1680, 690, ...parts));
};

/* Wie viele Symbole passen zwischen Boden und Decke? */
window.drawHowMany = function () {
  const c = d.colors();
  const oben = 120, unten = 560, hoehe = unten - oben;
  const parts = [
    d.label(300, 0, "ceiling", { size: 20, color: c.gray, anchor: "end", centerY: oben }),
    d.label(300, 0, "floor", { size: 20, color: c.gray, anchor: "end", centerY: unten }),
    d.line(320, oben, 320, unten, { color: c.dark, width: 2 }),
  ];
  const saeule = (x, n, titel) => {
    const bh = hoehe / n;
    for (let i = 0; i < n; i++) {
      const y = oben + i * bh;
      parts.push(d.box(x, y + 3, 300, bh - 6, "", { border: c.light, rx: 4, fill: c.bg }));
    }
    parts.push(d.label(x + 150, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: oben - 45 }));
    parts.push(d.label(x + 150, 0, n + " symbols", { size: 32, color: c.white, anchor: "middle", centerY: unten + 55 }));
  };
  saeule(400, 4, "wide bands");
  saeule(980, 8, "narrow bands");
  parts.push(d.label(840, 0, "the narrower your clouds, the more symbols fit into the same range",
                     { size: 20, color: c.gray, anchor: "middle", centerY: unten + 130 }));
  return put("fig-how-many", d.svg(1680, 740, ...parts));
};

/* --- Teil 3 --------------------------------------------------------------- */

/* Die Werkzeugkiste mit Preisschildern. Drei Zeilen kosten nur Bastelzeit,
 * und genau das begruendet den erlaubten optischen Selbstbau. */
window.drawToolbox = function () {
  const c = d.colors();
  const spalten = [
    ["bigger d", [
      ["pick colours further apart", "fewer symbols fit", false],
      ["use fewer symbols", "fewer bits per symbol", false],
      ["aim the light better", "only craft", true],
    ]],
    ["smaller s", [
      ["longer integration time", "fewer symbols per second", false],
      ["average several readings", "fewer symbols per second", false],
      ["block ambient light", "only craft", true],
      ["fix the geometry", "only craft", true],
    ]],
  ];
  const parts = [];
  spalten.forEach(([kopf, zeilen], k) => {
    const x = 60 + k * 800;
    parts.push(d.label(x + 380, 0, kopf, { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: 70 }));
    zeilen.forEach(([mittel, preis, gratis], i) => {
      const y = 130 + i * 110;
      parts.push(d.box(x, y, 760, 90, "", { border: gratis ? c.yellow : c.dark, rx: 6 }));
      parts.push(d.label(x + 30, 0, mittel, { size: 32, color: c.white, centerY: y + 45 }));
      parts.push(d.label(x + 730, 0, preis, { size: 20, color: gratis ? c.yellow : c.gray, anchor: "end", centerY: y + 45 }));
    });
  });
  parts.push(d.label(840, 0, "everything else is paid for in bits per symbol or symbols per second",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 620 }));
  return put("fig-toolbox", d.svg(1680, 670, ...parts));
};

/* Beide Wege zahlen aus demselben Topf. */
window.drawWall = function () {
  const c = d.colors();
  const bx = 620, bw = 440, by = 250, bh = 130;
  const parts = [
    d.box(bx, by, bw, bh, "the margin", { size: 32, border: c.yellow, color: c.yellow }),
    d.arrow(220, by + bh / 2, bx - 20, by + bh / 2, { color: c.light, width: 3 }),
    d.arrow(1460, by + bh / 2, bx + bw + 20, by + bh / 2, { color: c.light, width: 3 }),
    d.label(220, 0, "more symbols", { size: 32, color: c.white, centerY: by - 40 }),
    d.label(220, 0, "the bands get narrower", { size: 20, color: c.gray, centerY: by + bh + 40 }),
    d.label(1460, 0, "faster symbols", { size: 32, color: c.white, anchor: "end", centerY: by - 40 }),
    d.label(1460, 0, "the clouds get wider", { size: 20, color: c.gray, anchor: "end", centerY: by + bh + 40 }),
    d.label(840, 0, "one budget, two ways to spend it",
            { size: 20, color: c.gray, anchor: "middle", centerY: by + bh + 140 }),
  ];
  return put("fig-wall", d.svg(1680, 520, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-ratio")) {
  window.drawRatio();
  window.drawHowMany();
  window.drawToolbox();
  window.drawWall();
}

window.deck07 = {
  readings: window.drawReadings,
  windows: window.drawWindows,
  twoClouds: window.drawTwoClouds,
  ratio: window.drawRatio,
  howMany: window.drawHowMany,
  toolbox: window.drawToolbox,
  wall: window.drawWall,
};
