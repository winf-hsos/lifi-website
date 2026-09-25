/* Zeichnungen fuer „where the bytes live" (Speicher und Dateien).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Alle Bytes sind echt: die 4-mal-2-Bitmap mit 78 Byte, wie sie auch auf der
 * Konzeptseite steht und wie der Demonstrator „Inside a File" sie zeigt.
 * Dateikopf 14 Byte, Infokopf 40 Byte, Pixeldaten 24 Byte. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Verweise auf andere Konzepte: nie ueber eine Decknummer, sondern ueber den
 * Konzeptnamen als Link auf die Seite. Blau verweist. */
const SEITE = (konzept) => `https://docs.lifi-project.de/concepts/${konzept}.html`;
const verweis = (konzept, label) => `<a href="${SEITE(konzept)}" target="_blank">${label}</a>`;

/* Die 78 Byte, in Zeilen zu 16 */
const DUMP = [
  "42 4d 4e 00 00 00 00 00 00 00 36 00 00 00 28 00",
  "00 00 04 00 00 00 02 00 00 00 01 00 18 00 00 00",
  "00 00 18 00 00 00 c4 0e 00 00 c4 0e 00 00 00 00",
  "00 00 00 00 00 00 00 00 00 00 ff ff ff ff 00 ff",
  "00 ff 00 00 ff 00 ff 00 ff 00 00 ff ff ff",
];

/* --- Teil 1: a file is a sequence of bytes -------------------------------- */

/* Dieselbe Datei, zwei Programme: der Editor liest Zeichen, der Betrachter
 * liest Bildpunkte. Die Bytes selbst sagen nichts. */
window.drawTwoPrograms = function () {
  const c = d.colors();
  const parts = [];
  const fenster = (x, titel, zeilen, farbe) => {
    parts.push(d.box(x, 120, 620, 320, "", { border: c.gray, rx: 8 }));
    parts.push(d.label(x + 310, 0, titel, { size: 20, color: c.gray, anchor: "middle", centerY: 90 }));
    zeilen.forEach((z, i) => {
      parts.push(d.label(x + 40, 0, z, { size: 32, mono: true, color: farbe, keepCase: true, centerY: 190 + i * 50 }));
    });
  };
  // Was der Texteditor zeigt, ist aus denselben Bytes gerechnet: druckbare
  // Zeichen wie sie sind, alles andere als Punkt, so wie es ein Editor tut.
  const alsText = (zeile) => zeile.split(" ").map((b) => {
    const n = parseInt(b, 16);
    return n >= 32 && n <= 126 ? String.fromCharCode(n) : "·";
  }).join("");
  fenster(60, "a text editor", DUMP.slice(0, 4).map(alsText), c.gray);
  fenster(1000, "a hex editor", DUMP.slice(0, 4).map((z) => z.slice(0, 29)), c.white);
  // beide zeigen dieselbe Datei
  parts.push(d.box(700, 520, 280, 80, "parrot.bmp", { border: c.white, size: 32, mono: true, rx: 6 }));
  parts.push(d.arrow(760, 520, 500, 450, { color: c.gray }));
  parts.push(d.arrow(920, 520, 1180, 450, { color: c.gray }));
  return put("fig-two-programs", d.svg(1680, 640, ...parts));
};

/* Der Hex-Dump in drei Schritten: Dateikopf, Infokopf, Pixel */
const TEILE = [
  { von: 0, bis: 14, name: "file header", zeile: "14 bytes: \"BM\", the size of the file, where the pixels start" },
  { von: 14, bis: 54, name: "info header", zeile: "40 bytes: width, height, colour depth, and more" },
  { von: 54, bis: 78, name: "pixel data", zeile: "24 bytes: 4 × 2 pixels × 3 bytes" },
];

window.drawDump = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [];
  const x0 = 260, y0 = 80, cw = 66, rh = 64;
  const farben = [c.yellow, c.blue, c.white];
  DUMP.forEach((zeile, r) => {
    parts.push(d.label(x0 - 40, 0, (r * 16).toString(16).padStart(4, "0"),
                       { size: 32, mono: true, color: c.dark, anchor: "end", centerY: y0 + r * rh }));
    zeile.split(" ").forEach((byte, i) => {
      const n = r * 16 + i;
      const teil = TEILE.findIndex((t) => n >= t.von && n < t.bis);
      const an = step > teil;
      parts.push(d.label(x0 + i * cw, 0, byte,
                         { size: 32, mono: true, color: an ? farben[teil] : c.dark, centerY: y0 + r * rh }));
    });
  });
  // die Erklaerzeile des zuletzt gezeigten Teils
  if (step >= 1) {
    const t = TEILE[step - 1];
    parts.push(d.label(x0 - 40, 0, t.name, { size: 32, color: farben[step - 1], centerY: 440 }));
    parts.push(d.label(x0 - 40, 0, t.zeile, { size: 20, color: c.gray, centerY: 485 }));
  }
  return put("fig-dump", d.svg(1680, 520, ...parts));
};

/* Der Kopf als Band, vier Felder zeigen auf ihre Bedeutung */
window.drawHeader = function () {
  const c = d.colors();
  const parts = [];
  const y = 60, h = 90, x0 = 100;
  const band = [["file header", 14, c.yellow], ["info header", 40, c.blue], ["pixel data", 24, c.white]];
  const skala = 1480 / 78;
  let x = x0;
  band.forEach(([name, n, farbe]) => {
    const w = n * skala;
    parts.push(d.box(x, y, w, h, "", { border: farbe, fill: c.bg, rx: 6 }));
    parts.push(d.label(x + w / 2, 0, name, { size: 20, color: farbe, anchor: "middle", centerY: y + h / 2 - 16 }));
    parts.push(d.label(x + w / 2, 0, `${n} B`, { size: 20, mono: true, color: c.gray, anchor: "middle", centerY: y + h / 2 + 20 }));
    x += w;
  });
  // vier Felder, die etwas sagen
  const felder = [
    [2, "4e 00 00 00", "the file is 78 bytes long"],
    [10, "36 00 00 00", "the pixels start at byte 54"],
    [18, "04 00 00 00", "the image is 4 pixels wide"],
    [28, "18 00", "24 bits per pixel, so 3 bytes"],
  ];
  // Statt langer Linien, die durch die Zeilen darunter laufen: eine kurze Marke
  // am Band mit der Byteposition, und die Zeilen darunter in derselben Ordnung.
  felder.forEach(([pos, bytes, bedeutung], i) => {
    const px = x0 + pos * skala;
    const zy = 290 + i * 90;
    parts.push(d.line(px, y + h, px, y + h + 26, { color: c.yellow }));
    parts.push(d.label(px, 0, `byte ${pos}`, { size: 20, mono: true, color: c.yellow, anchor: "middle", centerY: y + h + 56 }));
    parts.push(d.label(240, 0, `byte ${pos}`, { size: 20, mono: true, color: c.gray, anchor: "end", centerY: zy }));
    parts.push(d.label(600, 0, bytes, { size: 32, mono: true, color: c.yellow, anchor: "end", centerY: zy }));
    parts.push(d.label(660, 0, bedeutung, { size: 32, color: c.white, centerY: zy }));
  });
  return put("fig-header", d.svg(1680, 580, ...parts));
};

/* Zwei Festlegungen, die man nicht erraten kann: Blau-Grün-Rot und kopfüber */
window.drawPixel = function () {
  const c = d.colors();
  const parts = [];
  // das Byte-Tripel gross
  const x0 = 140, cw = 150;
  ["00", "ff", "ff"].forEach((byte, i) => {
    parts.push(d.box(x0 + i * cw, 90, 120, 120, byte, { border: c.white, size: 48, mono: true, rx: 8 }));
  });
  ["blue", "green", "red"].forEach((name, i) => {
    parts.push(d.label(x0 + i * cw + 60, 0, name, { size: 32, color: c.gray, anchor: "middle", centerY: 250 }));
  });
  parts.push(d.label(x0, 0, "not red, green, blue. the other way round.", { size: 20, color: c.gray, centerY: 320 }));
  parts.push(d.box(x0 + 3 * cw + 60, 90, 200, 120, "yellow", { border: c.yellow, color: c.yellow, size: 32, rx: 8 }));

  // das Bild, 4 x 2, mit der Reihenfolge in der Datei
  const bx = 1080, by = 90, s = 110;
  const zeilen = [
    [[255, 0, 0], [255, 255, 255], [255, 255, 255], [0, 255, 255]],      // oben
    [[0, 0, 0], [255, 255, 0], [255, 0, 255], [255, 255, 255]],           // unten
  ];
  zeilen.forEach((zeile, r) => {
    zeile.forEach((rgb, i) => {
      parts.push(`<rect x="${bx + i * s}" y="${by + r * s}" width="${s}" height="${s}" fill="rgb(${rgb.join(",")})"/>`);
    });
    parts.push(d.label(bx - 30, 0, r === 0 ? "top" : "bottom", { size: 20, color: c.gray, anchor: "end", centerY: by + r * s + s / 2 }));
  });
  parts.push(d.label(bx, 0, "stored first", { size: 20, color: c.yellow, centerY: by + 2 * s + 50 }));
  parts.push(d.arrow(bx + 160, by + 2 * s + 34, bx + 160, by + s + 20, { color: c.yellow }));
  parts.push(d.label(bx, 0, "bitmaps stand upside down in the file.", { size: 20, color: c.gray, centerY: 420 }));
  return put("fig-pixel", d.svg(1680, 470, ...parts));
};

/* --- Teil 2: where the bytes live ----------------------------------------- */

/* Das Flip-Flop: zwei NOR-Gatter im Kreis. Schritt 0 ruhig, 1 Impuls auf set,
 * 2 set wieder aus und q bleibt. */
window.drawFlipFlop = function (_slide, step = 0) {
  const c = d.colors();
  const setzen = step === 1;
  const q = step >= 1;
  const parts = [];
  const wires = [], gates = [], labels = [];
  // Eingaenge
  labels.push(d.label(180, 0, "set", { size: 32, color: setzen ? c.yellow : c.gray, anchor: "end", centerY: 160 }));
  labels.push(d.label(180, 0, "reset", { size: 32, color: c.gray, anchor: "end", centerY: 440 }));
  wires.push(d.wire([[200, 160], [420, 160]], setzen));
  wires.push(d.wire([[200, 440], [420, 440]], false));
  gates.push(d.gate("nor", 420, 120, q));
  gates.push(d.gate("nor", 420, 400, !q));
  // Kreuzverdrahtung
  wires.push(d.wire([[580, 160], [700, 160], [700, 300], [380, 300], [380, 420], [420, 420]], q));
  wires.push(d.wire([[580, 440], [660, 440], [660, 260], [360, 260], [360, 180], [420, 180]], !q));
  // Ausgang
  wires.push(d.wire([[700, 160], [860, 160]], q));
  labels.push(d.label(900, 0, "q", { size: 48, mono: true, color: q ? c.yellow : c.gray, centerY: 160 }));
  labels.push(d.label(900, 0, q ? "1" : "0", { size: 48, mono: true, color: q ? c.yellow : c.gray, centerY: 220 }));
  const texte = [
    "nothing happens. q is 0.",
    "a short pulse on set, and q becomes 1.",
    "set is off again, and q stays 1. the loop feeds itself.",
  ];
  labels.push(d.label(180, 0, texte[Math.min(step, 2)], { size: 32, color: c.white, centerY: 560 }));
  parts.push(d.layers(wires, gates, labels));
  return put("fig-flip-flop", d.svg(1680, 578, ...parts));
};

/* Der Arbeitsspeicher als Tafel mit Adressen */
window.drawAddresses = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 520, y0 = 90, rh = 90, w = 560;
  const zeilen = [["4709", "0100 0001"], ["4710", "0110 1101"], ["4711", "1111 0000"], ["4712", "0000 1001"]];
  zeilen.forEach(([adresse, bits], i) => {
    const y = y0 + i * rh, an = adresse === "4711";
    parts.push(d.box(x0, y, w, 70, "", { border: an ? c.yellow : c.dark, rx: 6 }));
    parts.push(d.label(x0 + 40, 0, adresse, { size: 32, mono: true, color: an ? c.yellow : c.gray, centerY: y + 35 }));
    parts.push(d.label(x0 + 240, 0, bits, { size: 32, mono: true, color: an ? c.white : c.dark, centerY: y + 35 }));
  });
  // Adress- und Datenleitungen
  parts.push(d.label(460, 0, "address lines", { size: 20, color: c.gray, anchor: "end", centerY: y0 + 2 * rh + 35 }));
  parts.push(d.arrow(470, y0 + 2 * rh + 35, x0 - 10, y0 + 2 * rh + 35, { color: c.yellow }));
  parts.push(d.arrow(x0 + w + 10, y0 + 2 * rh + 35, x0 + w + 180, y0 + 2 * rh + 35, { color: c.yellow }));
  parts.push(d.label(x0 + w + 200, 0, "data lines", { size: 20, color: c.gray, centerY: y0 + 2 * rh + 35 }));
  parts.push(d.label(x0, 0, "billions of rows, all alike. the number is the only handle.", { size: 20, color: c.gray, centerY: y0 + 4 * rh + 40 }));
  return put("fig-addresses", d.svg(1680, 501, ...parts));
};

/* Strom weg: dieselbe Schleife, einmal gefuettert, einmal nicht */
window.drawPullPlug = function (_slide, step = 0) {
  const c = d.colors();
  const an = step === 0;
  const parts = [];
  const wires = [], gates = [], labels = [];
  gates.push(d.gate("nor", 620, 120, an));
  gates.push(d.gate("nor", 620, 400, false));
  wires.push(d.wire([[780, 160], [900, 160], [900, 300], [580, 300], [580, 420], [620, 420]], an));
  wires.push(d.wire([[780, 440], [860, 440], [860, 260], [560, 260], [560, 180], [620, 180]], false));
  wires.push(d.wire([[900, 160], [1060, 160]], an));
  labels.push(d.label(1100, 0, an ? "1" : "", { size: 48, mono: true, color: c.yellow, centerY: 160 }));
  labels.push(d.box(240, 120, 260, 90, an ? "power on" : "power off",
                    { border: an ? c.yellow : c.red, color: an ? c.yellow : c.red, size: 32, rx: 8 }));
  labels.push(d.label(240, 0, an
    ? "the two gates keep feeding each other."
    : "the loop collapses. nobody deleted anything.", { size: 32, color: c.white, centerY: 540 }));
  parts.push(d.layers(wires, gates, labels));
  return put("fig-pull-plug", d.svg(1680, 600, ...parts));
};

/* Fuenf Materialien, eine Aufgabe */
window.drawMaterials = function () {
  const c = d.colors();
  const parts = [];
  const namen = ["ram", "hard disk", "flash", "cd", "tape"];
  const zeilen = ["a loop that\nmust be fed", "a spot magnetised\nthis way or that",
                  "a charge, trapped\nbehind insulation", "a pit that scatters light,\na land that reflects it",
                  "the same as a disk,\nbut in a long line"];
  const x0 = 60, bw = 300, gap = 20, y = 90, h = 260;
  namen.forEach((name, i) => {
    const x = x0 + i * (bw + gap);
    parts.push(d.label(x + bw / 2, 0, name, { size: 32, color: i === 0 ? c.gray : c.white, anchor: "middle", centerY: 60 }));
    parts.push(d.box(x, y, bw, h, "", { border: i === 0 ? c.dark : c.light, rx: 8 }));
    // die Skizze im Kasten
    const cx = x + bw / 2, cy = y + h / 2;
    if (i === 0) {
      // eine Schleife, die sich selbst fuettert: zwei Boegen mit Pfeilspitzen
      const r = 60;
      parts.push(`<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${c.light}" stroke-width="3"/>`);
      parts.push(`<path d="M ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx - r} ${cy}" fill="none" stroke="${c.light}" stroke-width="3"/>`);
      parts.push(d.arrow(cx + r - 2, cy - 14, cx + r, cy + 6, { color: c.light, width: 3, head: 12 }));
      parts.push(d.arrow(cx - r + 2, cy + 14, cx - r, cy - 6, { color: c.light, width: 3, head: 12 }));
      parts.push(d.label(cx, 0, "1", { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: cy }));
    } else if (i === 1 || i === 4) {
      // magnetisierte Abschnitte
      const w = 44;
      [-2, -1, 0, 1, 2].forEach((k, j) => {
        const px = cx + k * (w + 10);
        parts.push(`<rect x="${px - w / 2}" y="${cy - 10}" width="${w}" height="40" rx="3" fill="none" stroke="${c.light}" stroke-width="2"/>`);
        const rechts = j % 2 === 0;
        parts.push(d.arrow(px - 14 * (rechts ? 1 : -1), cy + 10, px + 14 * (rechts ? 1 : -1), cy + 10,
                           { color: rechts ? c.yellow : c.gray, width: 3, head: 10 }));
      });
      if (i === 1) parts.push(d.label(cx, 0, "▼ head", { size: 20, color: c.gray, anchor: "middle", centerY: cy - 50 }));
    } else if (i === 2) {
      parts.push(d.box(cx - 90, cy - 50, 180, 100, "", { border: c.light, rx: 6 }));
      parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="46" ry="26" fill="${c.yellow}" fill-opacity="0.85"/>`);
      parts.push(d.label(cx, 0, "+ + +", { size: 20, mono: true, color: c.bg, anchor: "middle", centerY: cy }));
    } else if (i === 3) {
      // Spur mit Vertiefung und ebener Stelle
      parts.push(d.line(cx - 110, cy + 30, cx - 40, cy + 30, { color: c.light, width: 3 }));
      parts.push(d.line(cx - 40, cy + 30, cx - 40, cy + 60, { color: c.light, width: 3 }));
      parts.push(d.line(cx - 40, cy + 60, cx + 20, cy + 60, { color: c.light, width: 3 }));
      parts.push(d.line(cx + 20, cy + 60, cx + 20, cy + 30, { color: c.light, width: 3 }));
      parts.push(d.line(cx + 20, cy + 30, cx + 110, cy + 30, { color: c.light, width: 3 }));
      parts.push(d.arrow(cx + 70, cy - 60, cx + 70, cy + 20, { color: c.yellow }));
      parts.push(d.arrow(cx + 70, cy + 20, cx + 110, cy - 50, { color: c.yellow }));
      parts.push(d.arrow(cx - 10, cy - 60, cx - 10, cy + 46, { color: c.gray }));
      parts.push(d.line(cx - 10, cy + 46, cx - 70, cy - 20, { color: c.dark, width: 2 }));
      parts.push(d.line(cx - 10, cy + 46, cx + 30, cy - 30, { color: c.dark, width: 2 }));
    }
    parts.push(d.label(x + bw / 2, 0, zeilen[i], { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 60 }));
  });
  parts.push(d.label(x0, 0, "only the first one needs power. and none of them knows whether its bit belongs to a parrot.",
                     { size: 20, color: c.gray, centerY: y + h + 150 }));
  return put("fig-materials", d.svg(1680, 511, ...parts));
};

/* Die CD: ein Laser, eine Vertiefung, eine Reflexion. Zwei Faelle nebeneinander,
 * damit man den Unterschied sieht: unter einer ebenen Stelle kommt das Licht
 * zurueck zum Sensor, unter einer Vertiefung streut es weg. */
window.drawCd = function () {
  const c = d.colors();
  const parts = [];
  const y = 180, tief = 70, x0 = 120, x1 = 1020;
  const pits = [[340, 520], [700, 830]];
  // das Profil der Spur
  const punkte = [[x0, y]];
  pits.forEach(([a, b]) => { punkte.push([a, y], [a, y + tief], [b, y + tief], [b, y]); });
  punkte.push([x1, y]);
  parts.push(`<polyline points="${punkte.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${c.light}" stroke-width="4"/>`);
  parts.push(d.label(230, 0, "land", { size: 20, color: c.gray, anchor: "middle", centerY: y - 40 }));
  parts.push(d.label(765, 0, "pit", { size: 20, color: c.gray, anchor: "middle", centerY: y + 36 }));

  // Fall 1: ebene Stelle, das Licht kommt zurueck
  parts.push(d.box(130, 520, 130, 70, "laser", { border: c.gray, color: c.gray, size: 20, mono: true, rx: 6 }));
  parts.push(d.arrow(195, 512, 230, y + 14, { color: c.yellow, width: 3 }));
  parts.push(d.arrow(230, y + 14, 300, 512, { color: c.yellow, width: 3 }));
  parts.push(d.box(240, 520, 130, 70, "sensor", { border: c.yellow, color: c.yellow, size: 20, mono: true, rx: 6 }));
  parts.push(d.label(250, 0, "1", { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: 660 }));

  // Fall 2: Vertiefung, das Licht streut weg. Weiter rechts, damit die
  // gestreuten Strahlen den ersten Fall nicht kreuzen.
  const px = 765;
  parts.push(d.box(px - 195, 520, 130, 70, "laser", { border: c.gray, color: c.gray, size: 20, mono: true, rx: 6 }));
  parts.push(d.arrow(px - 130, 512, px, y + tief + 12, { color: c.gray, width: 3 }));
  [[px - 240, 430], [px + 250, 430]].forEach(([zx, zy]) => {
    parts.push(d.line(px, y + tief + 14, zx, zy, { color: c.dark, width: 2 }));
  });
  parts.push(d.box(px - 65, 520, 130, 70, "sensor", { border: c.dark, color: c.dark, size: 20, mono: true, rx: 6 }));
  parts.push(d.label(px - 130, 0, "0", { size: 48, mono: true, color: c.gray, anchor: "middle", centerY: 660 }));
  parts.push(d.label(x0, 0, "a laser from below, and a reflection that comes back or does not.",
                     { size: 20, color: c.gray, centerY: 730 }));

  // die Scheibe von oben
  const cx = 1380, cy = 380;
  parts.push(`<circle cx="${cx}" cy="${cy}" r="230" fill="none" stroke="${c.light}" stroke-width="2"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="45" fill="${c.bg}" stroke="${c.light}" stroke-width="2"/>`);
  for (let r = 75; r < 225; r += 20) {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.dark}" stroke-width="1"/>`);
  }
  parts.push(d.arrow(cx + 50, cy, cx + 215, cy, { color: c.yellow }));
  parts.push(d.label(cx, 0, "one spiral, from the inside out", { size: 20, color: c.gray, anchor: "middle", centerY: cy + 280 }));
  return put("fig-cd", d.svg(1680, 780, ...parts));
};

/* Speichern heisst kopieren */
window.drawSaving = function () {
  const c = d.colors();
  const parts = [];
  const y = 140;
  parts.push(d.box(180, y, 360, 160, "ram", { border: c.yellow, color: c.yellow, size: 48, mono: true, rx: 10 }));
  parts.push(d.label(360, 0, "needs power", { size: 20, color: c.gray, anchor: "middle", centerY: y + 200 }));
  parts.push(d.box(1140, y, 360, 160, "disk", { border: c.light, size: 48, mono: true, rx: 10 }));
  parts.push(d.label(1320, 0, "holds without power", { size: 20, color: c.gray, anchor: "middle", centerY: y + 200 }));
  parts.push(d.arrow(560, y + 50, 1120, y + 50, { color: c.white }));
  parts.push(d.label(840, 0, "save: copy", { size: 32, color: c.white, anchor: "middle", centerY: y + 16 }));
  parts.push(d.arrow(1120, y + 120, 560, y + 120, { color: c.gray }));
  parts.push(d.label(840, 0, "open: copy back", { size: 32, color: c.gray, anchor: "middle", centerY: y + 155 }));
  parts.push(d.label(840, 0, "42 4d 4e 00 …", { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: y + 85 }));
  parts.push(d.label(180, 0, "copied, not moved: after saving, the bytes are in both places, and they are the same bytes.",
                     { size: 20, color: c.gray, centerY: y + 300 }));
  return put("fig-saving", d.svg(1680, 451, ...parts));
};

/* Vier Orte, eine Folge: die Tafel. Von Hand gesetzt statt mit d.table, weil
 * die Spalten hier Prosa tragen und linksbuendig stehen muessen. */
const ORTE = [
  ["register", "eight flip-flops in the processor", "under a nanosecond", "gone"],
  ["main memory", "a cell with an address", "nanoseconds", "gone"],
  ["disk, flash", "a magnetised spot, a trapped charge", "milliseconds", "holds"],
  ["cd, tape", "a pressed pit, a magnetised stripe", "seconds to find the place", "holds for decades"],
];

window.drawPlaces = function () {
  const c = d.colors();
  const parts = [];
  const spalten = [80, 480, 1060, 1400];
  const kopf = ["", "what a bit is", "how long to reach it", "without power"];
  kopf.forEach((h, j) => {
    if (h) parts.push(d.label(spalten[j], 0, h, { size: 20, color: c.gray, centerY: 60 }));
  });
  parts.push(d.line(60, 90, 1620, 90, { color: c.dark }));
  ORTE.forEach((zeile, i) => {
    const y = 150 + i * 90;
    zeile.forEach((wert, j) => {
      const farbe = j === 0 ? c.white : (j === 3 ? (wert === "gone" ? c.red : c.yellow) : c.light);
      parts.push(d.label(spalten[j], 0, wert, { size: 32, color: farbe, centerY: y }));
    });
  });
  parts.push(d.label(80, 0, "the faster it answers, the more it depends on the power staying on.",
                     { size: 20, color: c.gray, centerY: 150 + ORTE.length * 90 }));
  return put("fig-places", d.svg(1680, 521, ...parts));
};

/* --- Teil 3: on your link -------------------------------------------------- */

/* Der ganze Weg, von der Platte bis zur Platte */
window.drawWholeWay = function () {
  const c = d.colors();
  const parts = [];
  const y = 160, h = 110;
  const kette = [
    ["disk", c.light, "memory-and-storage"],
    ["ram", c.yellow, "memory-and-storage"],
    ["bytes", c.white, "memory-and-storage"],
    ["symbols", c.white, "code-systems"],
    ["light", c.yellow, "signal-and-noise"],
    ["bytes", c.white, "errors-and-redundancy"],
    ["ram", c.yellow, "memory-and-storage"],
    ["disk", c.light, "memory-and-storage"],
  ];
  const bw = 170, gap = 40;
  const x0 = (1680 - (kette.length * bw + (kette.length - 1) * gap)) / 2;
  kette.forEach(([name, farbe], i) => {
    const x = x0 + i * (bw + gap);
    parts.push(d.box(x, y, bw, h, name, { border: farbe, color: farbe, size: 32, mono: true, rx: 8 }));
    if (i < kette.length - 1) parts.push(d.arrow(x + bw, y + h / 2, x + bw + gap, y + h / 2, { color: c.gray }));
  });
  // wo das Geraet steht
  const mitte = x0 + 4 * (bw + gap) - gap / 2;
  parts.push(d.label(mitte, 0, "↑ your device", { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 50 }));
  parts.push(d.label(840, 0, "at no point is it a picture. it is the same sequence of bytes, in different places.",
                     { size: 32, color: c.white, anchor: "middle", centerY: y + h + 140 }));
  parts.push(d.label(840, 0, "storing, representing, transferring, processing: the map of this module, read from below.",
                     { size: 20, color: c.gray, anchor: "middle", centerY: y + h + 200 }));
  return put("fig-whole-way", d.svg(1680, 481, ...parts));
};

/* --- Start ----------------------------------------------------------------- */

if ($("fig-two-programs")) {
  window.drawTwoPrograms();
  window.drawHeader();
  window.drawPixel();
  window.drawAddresses();
  window.drawMaterials();
  window.drawCd();
  window.drawSaving();
  window.drawPlaces();
  window.drawWholeWay();
}

window.deckMs = {
  twoPrograms: window.drawTwoPrograms,
  dump: window.drawDump,
  header: window.drawHeader,
  pixel: window.drawPixel,
  flipFlop: window.drawFlipFlop,
  addresses: window.drawAddresses,
  pullPlug: window.drawPullPlug,
  materials: window.drawMaterials,
  cd: window.drawCd,
  saving: window.drawSaving,
  places: window.drawPlaces,
  wholeWay: window.drawWholeWay,
};
