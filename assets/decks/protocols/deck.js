/* Zeichnungen fuer „where does a message start?" (Protokolle).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Ausnahme von der Palettenregel: Wo gesendete Farben gezeigt werden, tragen
 * die Felder echte Lichtfarben statt Palettenrollen. Sie stehen fuer Farben,
 * nicht fuer Bedeutung; dieselbe Ausnahme wie in Deck 06 bis 09. Wo das gilt,
 * sind Beschriftungen und Zeiger weiss, damit Rot nicht zugleich Lichtfarbe
 * und Warnhinweis ist. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

const ROT = "#e0322f", BLAU = "#2f7de0", GRUEN = "#3ba55d";

/* Fester Pseudozufall: dasselbe Rauschen bei jedem Rendern, damit die
 * Abbildungen auf den Folien und auf der Website gleich aussehen. */
function wuerfel(saat) {
  let z = saat;
  return () => { z = (z * 1103515245 + 12345) % 2147483648; return z / 2147483648; };
}

/* Eine Zelle des Symbolstroms. */
function zelle(x, y, w, h, farbe, deckkraft) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${farbe}"` +
         (deckkraft === undefined ? "" : ` fill-opacity="${deckkraft}"`) + `/>`;
}

/* Der Strom, den ein laufender Empfaenger sieht: Zimmerlicht, irgendwo darin
 * die Nachricht. Wird von mehreren Folien benutzt, immer mit demselben
 * Rauschen, damit der Saal dieselbe Stelle wiedererkennt. */
function strom(x0, y, zw, h, n, von, bis, muster) {
  const zufall = wuerfel(4711);
  const teile = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * zw;
    if (i >= von && i < bis) {
      const k = i - von;
      const farbe = muster ? muster(k) : (zufall() < 0.5 ? ROT : BLAU);
      teile.push(zelle(x, y, zw - 3, h, farbe));
    } else {
      // Zimmerlicht: unregelmaessig hell, und weil es warm ist, gelegentlich
      // rotstichig. Genau deshalb taugt ein einzelnes Rot nicht als Anfang.
      const w = zufall();
      const g = 0.18 + zufall() * 0.5;
      teile.push(w < 0.1 ? zelle(x, y, zw - 3, h, ROT, 0.45)
                         : zelle(x, y, zw - 3, h, "#9aa3ab", g * 0.5));
    }
  }
  return teile;
}

/* --- Teil 1 --------------------------------------------------------------- */

/* Bisher hat ein Mensch „jetzt" gesagt: zwei Rechner, zwei Tastendruecke. */
window.drawHuman = function () {
  const c = d.colors();
  const bw = 300, bh = 110, y = 120, links = 300, rechts = 1080;
  const parts = [
    d.box(links, y, bw, bh, "enter", { border: c.light, size: 32, mono: true, color: c.yellow }),
    d.box(rechts, y, bw, bh, "enter", { border: c.light, size: 32, mono: true, color: c.yellow }),
    d.line(links + bw, y + bh / 2, rechts, y + bh / 2, { color: c.gray, width: 2, dashed: true }),
    d.label((links + rechts + bw) / 2, 0, "at the same time",
            { size: 20, color: c.gray, anchor: "middle", centerY: y + bh / 2 - 28 }),
    d.box(links, y + 230, bw, bh, "sender", { border: c.light, size: 32 }),
    d.box(rechts, y + 230, bw, bh, "receiver", { border: c.light, size: 32 }),
    d.arrow(links + bw / 2, y + bh, links + bw / 2, y + 230, { color: c.gray, width: 2 }),
    d.arrow(rechts + bw / 2, y + bh, rechts + bw / 2, y + 230, { color: c.gray, width: 2 }),
    d.arrow(links + bw, y + 285, rechts, y + 285, { color: c.yellow, width: 3 }),
    d.label((links + rechts + bw) / 2, 0, "the message", { size: 20, color: c.yellow, anchor: "middle", centerY: y + 262 }),
  ];
  return put("fig-human", d.svg(1680, 500, ...parts));
};

/* Was der Empfaenger wirklich sieht: Licht, ununterbrochen. */
window.drawStream = function () {
  const c = d.colors();
  const x0 = 60, n = 76, zw = 20, y = 130, h = 150;
  const parts = strom(x0, y, zw, h, n, 30, 46);
  parts.push(d.label(x0 + 15 * zw, 0, "noise: the room", { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 45 }));
  parts.push(d.label(x0 + 38 * zw, 0, "the message", { size: 20, color: c.white, anchor: "middle", centerY: y + h + 45 }));
  parts.push(d.label(x0 + 61 * zw, 0, "noise: the room", { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 45 }));
  parts.push(d.label(x0 + 30 * zw, 0, "?", { size: 48, color: c.red, anchor: "middle", centerY: y - 40 }));
  parts.push(d.label(x0 + 46 * zw, 0, "?", { size: 48, color: c.red, anchor: "middle", centerY: y - 40 }));
  return put("fig-stream", d.svg(1680, 380, ...parts));
};

/* --- Teil 2 --------------------------------------------------------------- */

/* Derselbe Strom, jetzt mit dem vereinbarten Muster davor. */
window.drawPreamble = function () {
  const c = d.colors();
  const x0 = 60, n = 76, zw = 20, y = 130, h = 150;
  // Sechs Zellen Praeambel, danach die Nachricht
  // Erst der Strom wie auf Folie 6 (dieselbe Saat, damit der Saal ihn
  // wiedererkennt), dann die Praeambel sauber darueber.
  const parts = strom(x0, y, zw, h, n, 24, 46);
  for (let k = 0; k < 6; k++) {
    parts.push(zelle(x0 + (24 + k) * zw, y, zw - 3, h, k % 2 ? BLAU : ROT));
  }
  const px = x0 + 24 * zw, pw = 6 * zw - 3;
  parts.push(`<rect x="${px - 6}" y="${y - 6}" width="${pw + 12}" height="${h + 12}" rx="6" fill="none" stroke="${c.white}" stroke-width="3"/>`);
  parts.push(d.label(px + pw / 2, 0, "preamble", { size: 20, color: c.white, anchor: "middle", centerY: y - 32 }));
  parts.push(d.label(x0 + 36 * zw, 0, "the message", { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 45 }));
  parts.push(d.label(x0 + 30 * zw, 0, "an agreed pattern that noise cannot fake",
                     { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 100 }));
  return put("fig-preamble", d.svg(1680, 420, ...parts));
};

/* Warum ein einzelnes Symbol nicht genuegt: dasselbe Rauschen zweimal, einmal
 * mit einem einzelnen Rot als Anfangsmuster, einmal mit sechs Wechseln. Die
 * Fehlstarts werden nicht geraten, sondern aus dem Rauschen selbst genommen:
 * markiert sind die ersten drei Zellen, die zufaellig rot ausgefallen sind. */
window.drawOneRed = function () {
  const c = d.colors();
  const x0 = 120, n = 68, zw = 21, h = 92;
  const parts = [];

  // Dasselbe Rauschen fuer beide Reihen, einmal erzeugt
  const zufall = wuerfel(90210);
  const rauschen = [];
  for (let i = 0; i < n; i++) {
    const w = zufall();
    rauschen.push(w < 0.12 ? { rot: true, g: 0.5 } : { rot: false, g: (0.18 + zufall() * 0.5) * 0.5 });
  }
  const zeichneRauschen = (y) => rauschen.forEach((z, i) =>
    parts.push(zelle(x0 + i * zw, y, zw - 3, h, z.rot ? ROT : "#9aa3ab", z.g)));

  const y1 = 150, y2 = 420, pv = 44;          // pv: wo das Sechsermuster liegt
  parts.push(d.label(x0, 0, "start pattern: a single red", { size: 20, color: c.gray, centerY: y1 - 30 }));
  zeichneRauschen(y1);
  rauschen.map((z, i) => (z.rot ? i : -1)).filter((i) => i >= 0).slice(0, 3).forEach((i) => {
    const x = x0 + i * zw;
    // Weiss, nicht Rot: In dieser Zeichnung ist Rot eine echte Lichtfarbe, und
    // markiert werden ausgerechnet rote Zellen. Gestrichelt trennt den
    // Fehlstart vom echten Anfang weiter unten.
    parts.push(`<rect x="${x - 4}" y="${y1 - 5}" width="${zw + 5}" height="${h + 10}" rx="5" fill="none" stroke="${c.white}" stroke-width="3" stroke-dasharray="6 5"/>`);
    parts.push(d.label(x + zw / 2, 0, "start?", { size: 20, color: c.white, anchor: "middle", centerY: y1 + h + 36 }));
  });

  parts.push(d.label(x0, 0, "start pattern: red, blue, red, blue, red, blue", { size: 20, color: c.gray, centerY: y2 - 30 }));
  zeichneRauschen(y2);
  for (let k = 0; k < 6; k++) {
    parts.push(zelle(x0 + (pv + k) * zw, y2, zw - 3, h, k % 2 ? BLAU : ROT));
  }
  const gx = x0 + pv * zw;
  parts.push(`<rect x="${gx - 5}" y="${y2 - 5}" width="${6 * zw + 3}" height="${h + 10}" rx="5" fill="none" stroke="${c.white}" stroke-width="3"/>`);
  parts.push(d.label(gx + 3 * zw, 0, "the only start", { size: 20, color: c.white, anchor: "middle", centerY: y2 + h + 36 }));
  return put("fig-one-red", d.svg(1680, 600, ...parts));
};

/* Was der Rahmen kostet: dieselben neun Symbole, zwei verschiedene Nachrichten. */
window.drawCost = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 270, breite = 1080, y = 130, h = 96;
  const parts = [];
  const balken = (y, zeichen, beschriften) => {
    const daten = zeichen * 8, gesamt = 6 + daten + 3;
    const e = breite / gesamt;                       // Breite einer Zelle
    const stueck = (von, bis, farbe, deckkraft) =>
      `<rect x="${x0 + von * e}" y="${y}" width="${(bis - von) * e - 2}" height="${h}" rx="4" ` +
      `fill="${farbe}" fill-opacity="${deckkraft}"/>`;
    parts.push(stueck(0, 6, ROT, 0.85));
    parts.push(stueck(6, 6 + daten, "#9aa3ab", 0.35));
    parts.push(stueck(6 + daten, gesamt, GRUEN, 0.85));
    parts.push(d.label(x0 - 40, 0, zeichen + " characters", { size: 20, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    if (beschriften) {
      parts.push(d.label(x0 + 3 * e, 0, "preamble", { size: 20, color: c.white, anchor: "middle", centerY: y - 30 }));
      parts.push(d.label(x0 + (6 + daten / 2) * e, 0, "the message", { size: 20, color: c.gray, anchor: "middle", centerY: y - 30 }));
      parts.push(d.label(x0 + (gesamt - 1.5) * e, 0, "end", { size: 20, color: c.white, anchor: "middle", centerY: y - 30 }));
    }
    parts.push(d.label(x0 + breite + 40, 0, "9 of " + gesamt,
                       { size: 32, mono: true, color: c.light, centerY: y + h / 2 - 22 }));
    parts.push(d.label(x0 + breite + 40, 0, Math.round(900 / gesamt) + " %",
                       { size: 32, mono: true, color: c.yellow, centerY: y + h / 2 + 24 }));
  };
  balken(y, 5, true);
  if (step >= 1) balken(y + 210, 20, false);
  parts.push(d.label(x0, 0, "6 symbols preamble, 3 symbols end marker, 8 bits per character, 2 colours",
                     { size: 20, color: c.gray, centerY: y + (step >= 1 ? 390 : 180) }));
  return put("fig-cost", d.svg(1680, 560, ...parts));
};

/* Wenn die Daten wie der Anfang aussehen. */
window.drawLookalike = function () {
  const c = d.colors();
  const x0 = 60, n = 70, zw = 22, y = 150, h = 140;
  const parts = [];
  const muster = (k) => (k % 2 ? BLAU : ROT);
  // Praeambel, Nachricht, und mitten darin dasselbe Muster noch einmal
  const zufall = wuerfel(31337);
  for (let i = 0; i < n; i++) {
    const x = x0 + i * zw;
    if (i >= 6 && i < 12) parts.push(zelle(x, y, zw - 3, h, muster(i - 6)));
    else if (i >= 30 && i < 36) parts.push(zelle(x, y, zw - 3, h, muster(i - 30)));
    else if (i >= 12 && i < 56) parts.push(zelle(x, y, zw - 3, h, zufall() < 0.5 ? ROT : BLAU));
    else parts.push(zelle(x, y, zw - 3, h, "#9aa3ab", 0.22));
  }
  // Beide Marken weiss: Rot und Blau sind hier echte Lichtfarben. Den
  // Unterschied traegt die Linienart, nicht die Farbe.
  const rahmen = (i, w, gestrichelt, text, oben) => {
    const x = x0 + i * zw;
    parts.push(`<rect x="${x - 5}" y="${y - 5}" width="${w * zw + 3}" height="${h + 10}" rx="5" fill="none" ` +
               `stroke="${c.white}" stroke-width="3"${gestrichelt ? ' stroke-dasharray="6 5"' : ""}/>`);
    parts.push(d.label(x + (w * zw) / 2, 0, text, { size: 20, color: c.white, anchor: "middle", centerY: oben ? y - 32 : y + h + 42 }));
  };
  rahmen(6, 6, false, "the real start", true);
  rahmen(30, 6, true, "the same pattern, inside the data", false);
  parts.push(d.arrow(x0 + 33 * zw, y + h + 70, x0 + 33 * zw, y + h + 120, { color: c.gray, width: 2 }));
  parts.push(d.label(x0 + 33 * zw, 0, "the receiver throws away what it had and starts again here",
                     { size: 20, color: c.white, anchor: "middle", centerY: y + h + 150 }));
  return put("fig-lookalike", d.svg(1680, 500, ...parts));
};

/* --- Teil 3 --------------------------------------------------------------- */

/* Zwei Antworten, zwei Preisschilder. */
window.drawTwoAnswers = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const kasten = (x, titel, wie, gut, schlecht) => {
    parts.push(d.box(x, 110, 680, 330, "", { border: c.light }));
    parts.push(d.label(x + 340, 0, titel, { size: 48, mono: true, color: c.white, anchor: "middle", centerY: 185 }));
    parts.push(d.label(x + 340, 0, wie, { size: 20, color: c.gray, anchor: "middle", centerY: 240 }));
    parts.push(d.label(x + 340, 0, gut, { size: 32, color: c.green, anchor: "middle", centerY: 320 }));
    parts.push(d.label(x + 340, 0, schlecht, { size: 32, color: c.red, anchor: "middle", centerY: 385 }));
  };
  kasten(120, "length field", '"12 characters follow"',
         "the receiver counts along", "must arrive intact");
  if (step >= 1) {
    kasten(880, "end marker", '"stop", a reserved symbol',
           "any length", "must never appear in the data");
  }
  return put("fig-two-answers", d.svg(1680, 500, ...parts));
};

/* Der Zustandsautomat, der denselben Strom Schritt fuer Schritt liest.
 * Fuenf Schritte, und in jedem steht der Lesekopf an einer anderen Stelle:
 * Rauschen, noch immer Rauschen, Praeambel vollstaendig, Daten, Endmarke. */
window.drawStates = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const s = Math.max(0, Math.min(step, 4));
  const lesend = s === 2 || s === 3;          // in welchem Zustand der Empfaenger ist

  // Oben die zwei Zustaende
  const r = 88, ly = 180, lx = 500, rx = 1180;
  parts.push(d.arrow(lx + r, ly - 34, rx - r, ly - 34, { color: s === 2 ? c.yellow : c.dark, width: 3 }));
  parts.push(d.label((lx + rx) / 2, 0, "preamble seen",
                     { size: 20, color: s === 2 ? c.yellow : c.gray, anchor: "middle", centerY: ly - 54 }));
  parts.push(d.arrow(rx - r, ly + 34, lx + r, ly + 34, { color: s === 4 ? c.yellow : c.dark, width: 3 }));
  parts.push(d.label((lx + rx) / 2, 0, "end seen",
                     { size: 20, color: s === 4 ? c.yellow : c.gray, anchor: "middle", centerY: ly + 62 }));
  [[lx, "waiting", false], [rx, "reading", true]].forEach(([x, name, istLesend]) => {
    const aktiv = istLesend === lesend;
    parts.push(`<circle cx="${x}" cy="${ly}" r="${r}" fill="none" stroke="${aktiv ? c.yellow : c.gray}" stroke-width="${aktiv ? 4 : 2}"/>`);
    parts.push(d.label(x, 0, name, { size: 32, mono: true, color: aktiv ? c.yellow : c.gray, anchor: "middle", centerY: ly }));
  });

  // Unten derselbe Strom; was der Lesekopf noch nicht erreicht hat, liegt
  // gedaempft da, bleibt aber lesbar.
  const x0 = 120, n = 60, zw = 24, sy = 380, h = 96;
  const kopfBei = [8, 12, 19, 34, 48][s];
  const zufall = wuerfel(4711);
  for (let i = 0; i < n; i++) {
    const x = x0 + i * zw;
    const kommt = i > kopfBei;                // noch nicht gelesen
    let farbe, deckkraft;
    if (i >= 14 && i < 20) { farbe = (i - 14) % 2 ? BLAU : ROT; deckkraft = 1; }
    else if (i >= 20 && i < 46) { farbe = zufall() < 0.5 ? ROT : BLAU; deckkraft = 1; }
    else if (i >= 46 && i < 49) { farbe = GRUEN; deckkraft = 1; }
    else { farbe = "#9aa3ab"; deckkraft = 0.22; }
    parts.push(zelle(x, sy, zw - 3, h, farbe, kommt ? deckkraft * 0.4 : deckkraft));
  }
  const kopf = x0 + (kopfBei + 1) * zw - 1;
  parts.push(d.line(kopf, sy - 18, kopf, sy + h + 18, { color: c.yellow, width: 3 }));

  const sagen = [
    "noise. not the pattern. thrown away.",
    "a red one, but alone. the pattern needs all six.",
    "the pattern is complete: switch to reading",
    "every symbol is data now, and is kept",
    "the end marker: hand over the message and wait again",
  ];
  parts.push(d.label(x0, 0, sagen[s], { size: 32, color: c.white, centerY: sy + h + 70 }));
  return put("fig-states", d.svg(1680, 560, ...parts));
};

/* Wenn das Ende nie kommt. */
window.drawNoEnd = function () {
  const c = d.colors();
  const x0 = 120, n = 62, zw = 24, y = 150, h = 110;
  const parts = [];
  const zufall = wuerfel(4711);
  for (let i = 0; i < n; i++) {
    const x = x0 + i * zw;
    if (i >= 8 && i < 14) parts.push(zelle(x, y, zw - 3, h, (i - 8) % 2 ? BLAU : ROT));
    else if (i >= 14 && i < 30) parts.push(zelle(x, y, zw - 3, h, zufall() < 0.5 ? ROT : BLAU));
    else if (i >= 30 && i < 42) parts.push(zelle(x, y, zw - 3, h, "#9aa3ab", 0.22));
    else if (i >= 42 && i < 48) parts.push(zelle(x, y, zw - 3, h, (i - 42) % 2 ? BLAU : ROT));
    else if (i >= 48) parts.push(zelle(x, y, zw - 3, h, zufall() < 0.5 ? ROT : BLAU));
    else parts.push(zelle(x, y, zw - 3, h, "#9aa3ab", 0.22));
  }
  // Alles am Strom weiss: Rot und Blau sind hier echte Lichtfarben.
  const marke = (i, w, gestrichelt, text, oben) => {
    const x = x0 + i * zw;
    parts.push(`<rect x="${x - 5}" y="${y - 5}" width="${w * zw + 3}" height="${h + 10}" rx="5" fill="none" ` +
               `stroke="${c.white}" stroke-width="3"${gestrichelt ? ' stroke-dasharray="6 5"' : ""}/>`);
    parts.push(d.label(x + (w * zw) / 2, 0, text, { size: 20, color: c.white, anchor: "middle", centerY: oben ? y - 30 : y + h + 40 }));
  };
  marke(8, 6, false, "message one starts", true);
  marke(42, 6, true, "message two starts, and is ignored", true);
  parts.push(d.line(x0 + 30 * zw, y - 20, x0 + 30 * zw, y + h + 20, { color: c.white, width: 3, dashed: true }));
  parts.push(d.label(x0 + 30 * zw + 16, 0, "the beam is blocked. no end marker.", { size: 20, color: c.white, centerY: y + h + 40 }));
  // Begruendete Ausnahme von der Weiss-Regel: Dieser Kasten steht nicht am
  // Strom, sondern darunter, und er ist das einzige rote Objekt der Zeichnung.
  // Verwechseln laesst er sich mit einer Lichtfarbe deshalb nicht.
  parts.push(d.box(x0, y + 230, 560, 110, "", { border: c.red }));
  parts.push(d.label(x0 + 280, 0, "state: reading", { size: 32, mono: true, color: c.red, anchor: "middle", centerY: y + 285 }));
  parts.push(d.label(x0 + 620, 0, "it is not looking for a preamble any more,", { size: 32, color: c.white, centerY: y + 262 }));
  parts.push(d.label(x0 + 620, 0, "and it never will again", { size: 32, color: c.white, centerY: y + 310 }));
  return put("fig-no-end", d.svg(1680, 560, ...parts));
};

/* --- Teil 4 --------------------------------------------------------------- */

/* Die Probe fuer die Spezifikation: was fehlt, faellt erst dem Fremden auf. */
window.drawSpecTest = function () {
  const c = d.colors();
  const zeilen = [
    ["symbols", "0 is red, 1 is blue", true],
    ["start", "red-blue, three times", true],
    ["characters", "8 bits each, ascii", true],
    ["end", "blue-red, three times", true],
    ["how long a symbol stands", "", false],
    ["what happens if the end never comes", "", false],
  ];
  const parts = [];
  const x0 = 300, y0 = 110, zh = 78;
  zeilen.forEach(([was, wert, da], i) => {
    const y = y0 + i * zh;
    const farbe = da ? c.white : c.red;
    parts.push(d.label(x0, 0, was, { size: 32, color: da ? c.gray : c.red, centerY: y }));
    parts.push(d.label(x0 + 640, 0, da ? wert : "not written down anywhere",
                       { size: 32, mono: da, color: farbe, centerY: y }));
  });
  return put("fig-spec-test", d.svg(1680, 600, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-human")) {
  window.drawHuman();
  window.drawStream();
  window.drawPreamble();
  window.drawOneRed();
  window.drawCost();
  window.drawLookalike();
  window.drawTwoAnswers();
  window.drawStates();
  window.drawNoEnd();
  window.drawSpecTest();
}

window.deck11 = {
  human: window.drawHuman,
  stream: window.drawStream,
  preamble: window.drawPreamble,
  oneRed: window.drawOneRed,
  cost: window.drawCost,
  lookalike: window.drawLookalike,
  twoAnswers: window.drawTwoAnswers,
  states: window.drawStates,
  noEnd: window.drawNoEnd,
  specTest: window.drawSpecTest,
};
