/* Zeichnungen fuer „when is it your turn?" (Abtastung und Synchronisation).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Ausnahme von der Palettenregel: Wo gesendete Farben gezeigt werden, tragen
 * die Felder echte Lichtfarben statt Palettenrollen. Sie stehen fuer Farben,
 * nicht fuer Bedeutung; dieselbe Ausnahme wie in Deck 06, 07 und 08. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

const FARBEN = ["#e0322f", "#3ba55d", "#2f7de0", "#e0b32f"];

/* --- Teil 1 --------------------------------------------------------------- */

/* Wofuer ein Punkt in den folgenden Bildern steht: viele schnelle Messungen
 * innerhalb eines Symbols, zu einem Wert gemittelt. Ohne diese Folie waeren
 * alle Zeichnungen danach eine kleine Luege. */
window.drawOneDot = function () {
  const c = d.colors();
  const x0 = 300, breite = 520, y = 110, hoehe = 200;
  const parts = [
    `<rect x="${x0}" y="${y}" width="${breite}" height="${hoehe}" rx="8" fill="${FARBEN[1]}" fill-opacity="0.35" stroke="${FARBEN[1]}" stroke-width="2"/>`,
    d.label(x0 + breite / 2, 0, "one symbol, zoomed in", { size: 20, color: c.gray, anchor: "middle", centerY: y - 40 }),
  ];
  const messwerte = [0.42, -0.30, 0.18, -0.12, 0.35, -0.44, 0.08, 0.26];
  messwerte.forEach((v, i) => {
    const mx = x0 + 45 + i * 62;
    parts.push(`<circle cx="${mx}" cy="${y + hoehe / 2 + v * 60}" r="8" fill="${c.light}"/>`);
  });
  parts.push(d.label(x0 + breite / 2, 0, "eight quick readings, each a little different",
                     { size: 20, color: c.gray, anchor: "middle", centerY: y + hoehe + 45 }));
  parts.push(d.arrow(870, y + hoehe / 2, 1020, y + hoehe / 2, { color: c.gray, width: 2 }));
  // Der gemittelte Wert steht mittig unter seinem Punkt; rechts daneben liefe
  // die zweite Zeile aus der Leinwand.
  parts.push(`<circle cx="1210" cy="${y + hoehe / 2}" r="16" fill="${c.yellow}"/>`);
  parts.push(d.label(1210, 0, "their average: one value,", { size: 32, color: c.white, anchor: "middle", centerY: y + hoehe / 2 + 90 }));
  parts.push(d.label(1210, 0, "the dot in every picture from here on", { size: 32, color: c.light, anchor: "middle", centerY: y + hoehe / 2 + 138 }));
  return put("fig-one-dot", d.svg(1680, 430, ...parts));
};

/* Ursache eins: die Uhren laufen auseinander. Oben die Zeitschlitze des
 * Senders, darunter die Messpunkte des Empfaengers, die Schritt fuer Schritt
 * nach rechts wandern, bis sie im falschen Schlitz liegen. */
window.drawDrift = function (_slide, step = 0) {
  const c = d.colors();
  // Ein Schlitz mehr als Messpunkte: der letzte, abgedriftete Punkt muss
  // sichtbar im naechsten Schlitz liegen, nicht hinter dem Bild.
  const x0 = 120, sw = 170, n = 8, schlitze = 9, y = 110, h = 130;
  const versatz = [0, 0.06, 0.12, 0.18, 0.26, 0.36, 0.48, 0.62];   // Anteil eines Schlitzes
  const parts = [
    d.label(x0, 0, "sender: one colour per slot", { size: 20, color: c.gray, centerY: y - 40 }),
    d.label(x0, 0, "receiver: reads at", { size: 20, color: c.gray, centerY: y + h + 70 }),
  ];
  for (let i = 0; i < schlitze; i++) {
    parts.push(`<rect x="${x0 + i * sw}" y="${y}" width="${sw - 4}" height="${h}" rx="6" ` +
               `fill="${FARBEN[i % 3]}" fill-opacity="0.55" stroke="${FARBEN[i % 3]}" stroke-width="2"/>`);
  }
  const sichtbar = step === 0 ? 3 : n;
  for (let i = 0; i < sichtbar; i++) {
    const px = x0 + i * sw + sw / 2 + versatz[i] * sw;
    const daneben = versatz[i] > 0.5;
    parts.push(d.line(px, y, px, y + h + 40, { color: daneben ? c.red : c.dark, width: 2, dashed: true }));
    parts.push(`<circle cx="${px}" cy="${y + h + 40}" r="11" fill="${daneben ? c.red : c.yellow}"/>`);
  }
  if (step >= 1) {
    const letzte = x0 + (n - 1) * sw + sw / 2 + versatz[n - 1] * sw;
    parts.push(d.label(letzte, 0, "in the wrong slot",
                       { size: 20, color: c.red, anchor: "middle", centerY: y + h + 110 }));
  }
  return put("fig-sampling-drift", d.svg(1680, 400, ...parts));
};

/* Ursache zwei: der Sensor mittelt ueber sein Messfenster. */
window.drawWindow = function () {
  const c = d.colors();
  const parts = [];
  const fall = (x, titel, symbolBreite, ok) => {
    const y = 130, h = 130, fenster = 200;
    const anzahl = Math.ceil(760 / symbolBreite);
    parts.push(d.label(x + 380, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: 80 }));
    for (let i = 0; i < anzahl; i++) {
      const bx = x + i * symbolBreite;
      const bw = Math.min(symbolBreite - 4, x + 760 - bx);
      if (bw <= 0) break;
      parts.push(`<rect x="${bx}" y="${y}" width="${bw}" height="${h}" rx="6" ` +
                 `fill="${FARBEN[i % 3]}" fill-opacity="0.55" stroke="${FARBEN[i % 3]}" stroke-width="2"/>`);
    }
    // Das Messfenster als Klammer unter den Symbolen
    const fx = x + (ok ? 20 : 130);
    // Die einzelnen Messungen innerhalb des Fensters, dezent: sie liegen genau
    // ueber der Klammer, und man sieht auf einen Blick, in welchem Farbfeld
    // jede von ihnen steckt. Links alle im selben, rechts zwei daneben.
    const streuung = [0.30, -0.42, 0.12, -0.18, 0.38, -0.26, 0.06, 0.34, -0.34, 0.20];
    streuung.forEach((v, i) => {
      const mx = fx + 10 + (i * (fenster - 20)) / (streuung.length - 1);
      parts.push(`<circle cx="${mx.toFixed(1)}" cy="${(y + h / 2 + v * 40).toFixed(1)}" r="5" ` +
                 `fill="${c.white}" fill-opacity="0.55"/>`);
    });
    parts.push(`<rect x="${fx}" y="${y + h + 24}" width="${fenster}" height="44" rx="6" ` +
               `fill="none" stroke="${c.yellow}" stroke-width="3"/>`);
    parts.push(d.label(fx + fenster / 2, 0, "50 ms window", { size: 20, color: c.yellow, anchor: "middle", centerY: y + h + 46 }));
    parts.push(d.label(x + 380, 0, ok ? "the reading falls inside one colour" : "every reading holds a colour change",
                       { size: 32, color: ok ? c.green : c.red, anchor: "middle", centerY: y + h + 130 }));
    parts.push(d.label(x + 380, 0, ok ? "matches one of your profiles" : "matches nothing",
                       { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 175 }));
  };
  fall(60, "symbols 100 ms long", 380, true);
  fall(860, "symbols 40 ms long", 152, false);
  return put("fig-sampling-window", d.svg(1680, 470, ...parts));
};

/* --- Teil 2 --------------------------------------------------------------- */

/* Wann kippt es? Der aufgelaufene Fehler gegen die Zeit, dazu die Schwelle
 * „ein halbes Symbol" und der Schnittpunkt. Genau die Rechnung von ca-011. */
window.drawWhenTips = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 220, x1 = 1500, y0 = 90, y1 = 470;
  const tMax = 30, eMax = 200;                     // Sekunden, Millisekunden
  const px = (t) => x0 + (t / tMax) * (x1 - x0);
  const py = (e) => y1 - (e / eMax) * (y1 - y0);
  const parts = [
    d.line(x0, y1, x1, y1, { color: c.dark, width: 2 }),
    d.line(x0, y0, x0, y1, { color: c.dark, width: 2 }),
    d.label(x0 - 30, 0, "error", { size: 20, color: c.gray, anchor: "end", centerY: y0 + 20 }),
    d.label((x0 + x1) / 2, 0, "seconds since the shared start", { size: 20, color: c.gray, anchor: "middle", centerY: y1 + 90 }),
  ];
  [0, 10, 20, 30].forEach((t) => {
    parts.push(d.line(px(t), y1 - 8, px(t), y1 + 8, { color: c.dark, width: 2 }));
    parts.push(d.label(px(t), 0, String(t), { size: 20, color: c.gray, anchor: "middle", centerY: y1 + 40 }));
  });
  // 0,5 % der verstrichenen Zeit, in Millisekunden
  parts.push(d.line(px(0), py(0), px(tMax), py(0.005 * tMax * 1000), { color: c.light, width: 3 }));
  parts.push(d.label(px(28), 0, "0.5 % of the time", { size: 20, color: c.light, anchor: "end", centerY: py(150) }));
  // Die Schwelle: ein halbes Symbol
  parts.push(d.line(x0, py(50), x1, py(50), { color: c.yellow, width: 2, dashed: true }));
  parts.push(d.label(x1, 0, "half a symbol (50 ms)", { size: 20, color: c.yellow, anchor: "end", centerY: py(50) - 26 }));
  if (step >= 1) {
    parts.push(`<circle cx="${px(10)}" cy="${py(50)}" r="12" fill="${c.red}"/>`);
    parts.push(d.line(px(10), py(50), px(10), y1, { color: c.red, width: 2, dashed: true }));
    parts.push(d.label(px(10) + 40, 0, "after 10 seconds the receiver reads the neighbour",
                       { size: 32, color: c.red, centerY: py(50) + 55 }));
  }
  return put("fig-when-tips", d.svg(1680, 580, ...parts));
};

/* Das Klatschexperiment: einmal absprechen gegen immer wieder absprechen.
 * Ein Klatscher ist eine Wolke aus Punkten; ihre Breite ist die Streuung im
 * Saal. Ohne Impuls waechst sie ununterbrochen, mit Impuls faengt sie alle
 * fuenf Sekunden wieder bei null an. */
window.drawClapping = function () {
  const c = d.colors();
  const x0 = 320, breite = 1200, dauer = 15, leute = 14;
  // Fester Pseudozufall, damit die Wolken bei jedem Rendern gleich aussehen.
  let saat = 7;
  const zufall = () => { saat = (saat * 1103515245 + 12345) % 2147483648; return saat / 2147483648 * 2 - 1; };
  const parts = [];
  const reihe = (y, titel, impuls) => {
    parts.push(d.label(x0 - 50, 0, titel, { size: 32, color: c.gray, anchor: "end", centerY: y }));
    parts.push(d.line(x0, y, x0 + breite, y, { color: c.dark, width: 2 }));
    for (let t = 0; t <= dauer; t++) {
      const basis = x0 + (t / dauer) * breite;
      const seit = impuls ? t % 5 : t;
      const streu = seit * 2.6;
      for (let k = 0; k < leute; k++) {
        const px = basis + zufall() * streu;
        const py = y + zufall() * 26;
        parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5" fill="${c.light}" fill-opacity="0.8"/>`);
      }
      if (impuls && t % 5 === 0 && t > 0) {
        parts.push(d.line(basis, y - 60, basis, y + 60, { color: c.yellow, width: 3 }));
      }
    }
  };
  reihe(160, "one start", false);
  reihe(400, "a pulse every 5 s", true);
  parts.push(d.label(x0, 0, "one clap = one cloud of people. the cloud gets wider.",
                     { size: 20, color: c.gray, centerY: 250 }));
  parts.push(d.label(x0, 0, "every pulse pulls everyone back together",
                     { size: 20, color: c.yellow, centerY: 490 }));
  for (let t = 0; t <= dauer; t += 5) {
    parts.push(d.label(x0 + (t / dauer) * breite, 0, String(t),
                       { size: 20, mono: true, color: c.gray, anchor: "middle", centerY: 545 }));
  }
  parts.push(d.label(x0 + breite / 2, 0, "seconds", { size: 20, color: c.gray, anchor: "middle", centerY: 585 }));
  return put("fig-clapping", d.svg(1680, 620, ...parts));
};

/* Wiederkehrende Marken: der Saegezahn des aufgelaufenen Fehlers. */
window.drawMarkers = function () {
  const c = d.colors();
  const x0 = 260, breite = 1280, y1 = 400, hoehe = 240;
  const bloecke = 4, bw = breite / bloecke;
  const parts = [
    d.line(x0, y1, x0 + breite, y1, { color: c.dark, width: 2 }),
    d.label(x0 - 40, 0, "clock error", { size: 32, color: c.gray, anchor: "end", centerY: y1 - hoehe / 2 }),
  ];
  for (let b = 0; b < bloecke; b++) {
    const bx = x0 + b * bw;
    parts.push(d.line(bx, y1, bx + bw - 30, y1 - hoehe, { color: c.yellow, width: 3 }));
    // Der Absturz gehoert zur Marke: nach dem letzten Block kommt keine mehr.
    if (b < bloecke - 1) {
      parts.push(d.line(bx + bw - 30, y1 - hoehe, bx + bw - 30, y1, { color: c.yellow, width: 3 }));
      parts.push(`<rect x="${bx + bw - 26}" y="${y1 + 20}" width="22" height="60" rx="4" fill="${c.white}"/>`);
      parts.push(d.label(bx + bw - 15, 0, "marker", { size: 20, color: c.white, anchor: "middle", centerY: y1 + 110 }));
    }
  }
  parts.push(d.line(x0, y1 - hoehe, x0 + breite, y1 - hoehe, { color: c.dark, width: 2, dashed: true }));
  parts.push(d.label(x0 + breite + 20, 0, "never more\nthan this", { size: 20, color: c.gray, centerY: y1 - hoehe }));
  parts.push(d.label(840, 0, "a marker is a symbol reserved for this job: a colour outside your data alphabet, or a short dark pause",
                     { size: 20, color: c.gray, anchor: "middle", centerY: y1 + 175 }));
  return put("fig-markers", d.svg(1680, 590, ...parts));
};

/* Der Preis des getakteten Weges: zwei Wege, zwei Preisschilder. */
window.drawClockedPrice = function () {
  const c = d.colors();
  const spalten = [
    ["start once", "not a single symbol spent", "drift adds up without limit"],
    ["recurring markers", "drift stays bounded", "markers carry no message"],
  ];
  const parts = [];
  spalten.forEach(([titel, gut, schlecht], i) => {
    const x = 120 + i * 760;
    parts.push(d.box(x, 110, 680, 300, "", { border: c.light }));
    parts.push(d.label(x + 340, 0, titel, { size: 48, mono: true, color: c.white, anchor: "middle", centerY: 190 }));
    parts.push(d.label(x + 340, 0, gut, { size: 32, color: c.green, anchor: "middle", centerY: 285 }));
    parts.push(d.label(x + 340, 0, schlecht, { size: 32, color: c.red, anchor: "middle", centerY: 350 }));
  });
  return put("fig-clocked-price", d.svg(1680, 470, ...parts));
};

/* --- Teil 3 --------------------------------------------------------------- */

/* Die erste Idee und ihr Haken: zwei gleiche Symbole erzeugen keinen Wechsel. */
window.drawFirstIdea = function () {
  const c = d.colors();
  const y = 150, h = 140, bw = 260;
  const parts = [
    d.label(200, 0, "sent", { size: 32, color: c.gray, anchor: "end", centerY: y + h / 2 }),
    d.label(200, 0, "seen", { size: 32, color: c.gray, anchor: "end", centerY: y + 300 + h / 2 }),
  ];
  [0, 0, 1].forEach((f, i) => {
    parts.push(`<rect x="${260 + i * (bw + 10)}" y="${y}" width="${bw}" height="${h}" rx="6" ` +
               `fill="${FARBEN[f]}" fill-opacity="0.6" stroke="${FARBEN[f]}" stroke-width="2"/>`);
  });
  parts.push(`<rect x="260" y="${y + 300}" width="${2 * bw + 10}" height="${h}" rx="6" ` +
             `fill="${FARBEN[0]}" fill-opacity="0.6" stroke="${FARBEN[0]}" stroke-width="2"/>`);
  parts.push(`<rect x="${260 + 2 * (bw + 10)}" y="${y + 300}" width="${bw}" height="${h}" rx="6" ` +
             `fill="${FARBEN[1]}" fill-opacity="0.6" stroke="${FARBEN[1]}" stroke-width="2"/>`);
  // Rot ist auf dieser Folie schon als echte Lichtfarbe vergeben; die
  // Beschriftung und der Zeiger nehmen deshalb Weiss statt der Warnfarbe.
  parts.push(d.label(260 + bw + 5, 0, "one long red", { size: 32, color: c.white, anchor: "middle", centerY: y + 300 + h / 2 }));
  parts.push(d.arrow(430, y + h + 40, 430, y + 280, { color: c.gray, width: 2 }));
  parts.push(d.label(560, 0, "no change here", { size: 20, color: c.white, centerY: y + h + 40 }));
  parts.push(d.line(530, y + h + 20, 530, y + h + 60, { color: c.white, width: 3 }));
  return put("fig-first-idea", d.svg(1680, 590, ...parts));
};

/* Die Reparatur: nicht die Farbe traegt die Information, sondern der Uebergang. */
window.drawTransitionCode = function () {
  const c = d.colors();
  const cx = 520, cy = 300, r = 190;
  const ecken = [0, 1, 2].map((i) => {
    const w = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return [cx + r * Math.cos(w), cy + r * Math.sin(w)];
  });
  const parts = [];
  // Pfeile: im Uhrzeigersinn 1, gegen den Uhrzeigersinn 0
  for (let i = 0; i < 3; i++) {
    const a = ecken[i], b = ecken[(i + 1) % 3];
    const kuerze = 66;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const ax = a[0] + (dx / len) * kuerze, ay = a[1] + (dy / len) * kuerze;
    const bx = b[0] - (dx / len) * kuerze, by = b[1] - (dy / len) * kuerze;
    parts.push(d.arrow(ax, ay, bx, by, { color: c.yellow, width: 3 }));
    parts.push(d.label((ax + bx) / 2 + (dy / len) * 34, 0, "1",
                       { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: (ay + by) / 2 - (dx / len) * 34 }));
    const a2 = ecken[(i + 1) % 3], b2 = ecken[i];
    const dx2 = b2[0] - a2[0], dy2 = b2[1] - a2[1], l2 = Math.hypot(dx2, dy2);
    const ax2 = a2[0] + (dx2 / l2) * kuerze + (dy2 / l2) * 30, ay2 = a2[1] + (dy2 / l2) * kuerze - (dx2 / l2) * 30;
    const bx2 = b2[0] - (dx2 / l2) * kuerze + (dy2 / l2) * 30, by2 = b2[1] - (dy2 / l2) * kuerze - (dx2 / l2) * 30;
    parts.push(d.arrow(ax2, ay2, bx2, by2, { color: c.light, width: 2 }));
    parts.push(d.label((ax2 + bx2) / 2 + (dy2 / l2) * 24, 0, "0",
                       { size: 32, mono: true, color: c.light, anchor: "middle", centerY: (ay2 + by2) / 2 - (dx2 / l2) * 24 }));
  }
  ecken.forEach(([x, y], i) => {
    parts.push(`<circle cx="${x}" cy="${y}" r="52" fill="${FARBEN[i]}"/>`);
  });
  // Die Legende steht unter dem Dreieck, nicht darin: innen kreuzen sich die Pfeile.
  parts.push(d.label(cx, 0, "clockwise: 1, anticlockwise: 0", { size: 20, color: c.gray, anchor: "middle", centerY: cy + r + 45 }));

  // Rechts das Beispiel: rot, gruen, rot, blau ergibt 1 0 0
  const bx0 = 900, by = 210, bw = 130;
  const folge = [0, 1, 0, 2], bits = ["1", "0", "0"];
  folge.forEach((f, i) => {
    parts.push(`<rect x="${bx0 + i * (bw + 40)}" y="${by}" width="${bw}" height="${bw}" rx="8" fill="${FARBEN[f]}"/>`);
  });
  bits.forEach((b, i) => {
    const mx = bx0 + i * (bw + 40) + bw + 20;
    parts.push(d.arrow(mx - 14, by + bw / 2, mx + 14, by + bw / 2, { color: c.gray, width: 2 }));
    parts.push(d.label(mx, 0, b, { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: by + bw + 70 }));
  });
  parts.push(d.label(bx0, 0, "your own colour is never allowed next", { size: 20, color: c.gray, centerY: by - 50 }));
  return put("fig-transition-code", d.svg(1680, 550, ...parts));
};

/* Was die Freiheit kostet: aus k Wahlmoeglichkeiten werden k minus eins. */
window.drawCapacity = function () {
  const c = d.colors();
  // Von Hand gesetzt statt d.table: dessen Regel „Einsen in Gelb" gilt fuer
  // Bittafeln, hier waere 1.00 grundlos hervorgehoben.
  const kopf = ["k", "as states", "as transitions"];
  const zeilen = [["3", "1.58", "1.00"], ["4", "2.00", "1.58"], ["5", "2.32", "2.00"]];
  const x0 = 340, y0 = 120, cw = 260, rh = 84;
  const parts = [
    d.label(x0 + (cw * 3) / 2, 0, "bits carried by one symbol", { size: 20, color: c.gray, anchor: "middle", centerY: 80 }),
  ];
  // Die Zeile k = 5 traegt die Pointe und liegt deshalb unter dem Text
  parts.push(`<rect x="${x0 - 10}" y="${y0 + 3 * rh - 6}" width="${cw * 3 + 20}" height="${rh}" rx="6" fill="${c.yellow}" fill-opacity="0.12"/>`);
  kopf.forEach((h, j) => {
    parts.push(d.label(x0 + j * cw + cw / 2, 0, h, { size: 32, mono: true, color: c.gray, anchor: "middle", centerY: y0 + rh * 0.55 }));
  });
  parts.push(d.line(x0, y0 + rh, x0 + cw * 3, y0 + rh, { color: c.dark, width: 2 }));
  zeilen.forEach((r, i) => r.forEach((v, j) => {
    parts.push(d.label(x0 + j * cw + cw / 2, 0, v,
                       { size: 32, mono: true, color: c.light, anchor: "middle", centerY: y0 + rh * (i + 1) + rh * 0.55 }));
  }));
  parts.push(d.label(x0 + cw * 3 + 50, 0, "five colours,\nfour allowed successors,\na clean 2 bits",
                     { size: 20, color: c.yellow, centerY: y0 + 3.5 * rh - 6 }));
  return put("fig-capacity", d.svg(1680, 470, ...parts));
};

/* Die Rechnung, die am Ende zaehlt, mit ihren zwei Stellschrauben. */
window.drawTime = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.formula(840, 0, "t = n / (r * b)", { size: 80, color: c.yellow, anchor: "middle", centerY: 110 }),
    d.label(560, 0, "n", { size: 32, mono: true, color: c.yellow, centerY: 220 }),
    d.label(630, 0, "bits to send", { size: 32, color: c.light, centerY: 220 }),
    d.label(560, 0, "r", { size: 32, mono: true, color: c.yellow, centerY: 275 }),
    d.label(630, 0, "symbols per second", { size: 32, color: c.light, centerY: 275 }),
    d.label(560, 0, "b", { size: 32, mono: true, color: c.yellow, centerY: 330 }),
    d.label(630, 0, "bits per symbol", { size: 32, color: c.light, centerY: 330 }),
    d.line(200, 390, 1480, 390, { color: c.dark, width: 2 }),
  ];
  if (step >= 1) {
    const zeilen = [
      ["clocked", "b = log2(k) = 2.00", "about 27 minutes"],
      ["clock-free", "b = log2(k-1) = 1.58", "about 34 minutes"],
    ];
    parts.push(d.label(840, 0, "16 000 bits, 4 colours, 5 symbols per second",
                       { size: 20, color: c.gray, anchor: "middle", centerY: 440 }));
    zeilen.forEach(([weg, formel, zeit], i) => {
      const y = 500 + i * 80;
      parts.push(d.label(560, 0, weg, { size: 32, color: c.gray, anchor: "end", centerY: y }));
      parts.push(d.formula(600, 0, formel, { size: 32, color: c.white, centerY: y }));
      parts.push(d.label(1440, 0, zeit, { size: 32, color: c.yellow, anchor: "end", centerY: y }));
    });
  }
  return put("fig-time", d.svg(1680, 640, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-one-dot")) {
  window.drawOneDot();
  window.drawWindow();
  window.drawClapping();
  window.drawMarkers();
  window.drawClockedPrice();
  window.drawFirstIdea();
  window.drawTransitionCode();
  window.drawCapacity();
}

window.deck09 = {
  oneDot: window.drawOneDot,
  drift: window.drawDrift,
  window: window.drawWindow,
  whenTips: window.drawWhenTips,
  clapping: window.drawClapping,
  markers: window.drawMarkers,
  clockedPrice: window.drawClockedPrice,
  firstIdea: window.drawFirstIdea,
  transitionCode: window.drawTransitionCode,
  capacity: window.drawCapacity,
  time: window.drawTime,
};
