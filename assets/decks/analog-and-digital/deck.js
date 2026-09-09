/* Zeichnungen fuer „drawing the line" (Analog und digital).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 *
 * Die Bildfolien rechnen mit dem echten Foto: pixeln() verkleinert es auf n mal
 * n Punkte, rundet die Kanaele auf eine Zahl von Stufen und vergroessert wieder
 * ohne Glaettung. Das Ergebnis ist eine data-URI, damit die SVGs auch dann
 * vollstaendig sind, wenn eine Website sie ueber <img> laedt. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

function rect(x, y, w, h, fill, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
}

/* --- das Foto in Punkte und Stufen zerlegen ------------------------------ */

const FOTO = "img/parrot.png";
const cache = new Map();
let quelle = null;

function laden(pfad) {
  if (quelle) return quelle;
  quelle = new Promise((fertig, schief) => {
    const img = new Image();
    img.onload = () => fertig(img);
    img.onerror = schief;
    img.src = pfad;
  });
  return quelle;
}

/* n: Punkte je Kante, stufen: Werte je Kanal (2 = 1 bit), grau: erst entfaerben */
async function pixeln(n, stufen = 256, grau = false, pfad = FOTO) {
  const schluessel = `${pfad}|${n}|${stufen}|${grau}`;
  if (cache.has(schluessel)) return cache.get(schluessel);
  const img = await laden(pfad);

  const klein = document.createElement("canvas");
  klein.width = n; klein.height = n;
  const kc = klein.getContext("2d");
  kc.drawImage(img, 0, 0, n, n);

  if (stufen < 256 || grau) {
    const daten = kc.getImageData(0, 0, n, n);
    const p = daten.data;
    const schritt = 255 / (stufen - 1);
    for (let i = 0; i < p.length; i += 4) {
      if (grau) {
        const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
        p[i] = p[i + 1] = p[i + 2] = g;
      }
      for (let k = 0; k < 3; k += 1) p[i + k] = Math.round(p[i + k] / schritt) * schritt;
    }
    kc.putImageData(daten, 0, 0);
  }

  const gross = document.createElement("canvas");
  gross.width = 512; gross.height = 512;
  const gc = gross.getContext("2d");
  gc.imageSmoothingEnabled = false;
  gc.drawImage(klein, 0, 0, 512, 512);
  const uri = gross.toDataURL("image/png");
  cache.set(schluessel, uri);
  return uri;
}

/* Fuer die Website: eine Datei als data-URI einbetten. Ein SVG, das eine Seite
 * ueber <img> laedt, darf keine externen Bilder nachladen. */
window.toDataURI = async function (pfad, kante = 200) {
  const img = await new Promise((fertig, schief) => {
    const i = new Image();
    i.onload = () => fertig(i);
    i.onerror = schief;
    i.src = pfad;
  });
  const cv = document.createElement("canvas");
  cv.width = cv.height = kante;
  cv.getContext("2d").drawImage(img, 0, 0, kante, kante);
  // WebP statt JPEG: haelt die Transparenz und ist trotzdem klein genug,
  // um acht Bilder in eine einzige SVG-Datei zu legen
  return cv.toDataURL("image/webp", 0.85);
};

function bild(uri, x, y, groesse) {
  return `<image href="${uri}" x="${x}" y="${y}" width="${groesse}" height="${groesse}" `
    + `image-rendering="pixelated" preserveAspectRatio="none"/>`;
}

/* --- 1. digital ist nicht dasselbe wie elektronisch ---------------------- */

window.drawKinds = function (_slide, _step, uris = null) {
  const c = d.colors();
  // Bild und Name je Ding: die Marke macht den Begriff sofort greifbar,
  // der Name bleibt die Hauptsache und steht deshalb daneben, nicht darunter.
  // Die Pfade stehen woertlich da, nicht zusammengesetzt: `sync_decks.py` sucht
  // Bildverweise mit einem regulaeren Ausdruck, und was es nicht findet, kopiert
  // es auch nicht auf die Website.
  const digital = [["flip-scoreboard", "img/icon-flip-scoreboard.png", "flip scoreboard"],
                   ["light-switch", "img/icon-light-switch.png", "light switch"],
                   ["abacus", "img/icon-abacus.png", "abacus"],
                   ["die", "img/icon-die.png", "a die"]];
  const analog = [["slide-rule", "img/icon-slide-rule.png", "slide rule"],
                  ["thermometer", "img/icon-thermometer.png", "dial thermometer"],
                  ["dimmer", "img/icon-dimmer.png", "dimmer"],
                  ["hourglass", "img/icon-hourglass.png", "hourglass"]];
  const g = 108, schritt = 132, oben = 96;
  const parts = [
    d.label(60, 56, "digital", { size: 32, color: c.yellow }),
    d.label(900, 56, "analog", { size: 32, color: c.gray }),
    d.line(60, 76, 780, 76, { color: c.dark, width: 2 }),
    d.line(900, 76, 1620, 76, { color: c.dark, width: 2 }),
    d.line(840, 30, 840, 620, { color: c.dark, width: 2 }),
  ];
  const spalte = (eintraege, x, farbe) => eintraege.forEach(([name, pfad, text], i) => {
    const y = oben + i * schritt;
    const quelle = uris ? uris[name] : pfad;
    parts.push(`<image href="${quelle}" x="${x}" y="${y}" width="${g}" height="${g}"/>`);
    parts.push(d.label(x + g + 34, 0, text, { size: 32, color: farbe, centerY: y + g / 2 }));
  });
  spalte(digital, 60, c.white);
  spalte(analog, 900, c.light);
  return put("fig-kinds", d.svg(1680, oben + 4 * schritt + 20, ...parts));
};

/* --- 2. die analoge Mitte ------------------------------------------------ */

window.drawMiddle = function () {
  const c = d.colors();
  const y = 170, h = 150;
  const mitte = y + h / 2;
  const kx0 = 430, kx1 = 980;          // Anfang und Ende der analogen Strecke
  const wires = [], boxes = [], labels = [];

  // Die analoge Strecke als glatte Kurve mit wechselnden Ausschlaegen:
  // ueberlagerte Wellen, dazu eine wandernde Huellkurve. Kein Zickzack, denn
  // analog heisst nicht „eckig", sondern stufenlos und staendig in Bewegung.
  const punkte = [];
  for (let i = 0; i <= 400; i += 1) {
    const t = i / 400;
    // Fenster: an beiden Enden null, damit die Kurve genau auf der Hoehe der
    // Anschlusslinien beginnt und endet
    const fenster = Math.sin(Math.PI * t) ** 0.65;
    const huelle = 30 + 22 * Math.sin(t * Math.PI * 2.7 + 0.9);
    const wert = Math.sin(t * 47) * 0.6
      + Math.sin(t * 19.4 + 1.1) * 0.3
      + Math.sin(t * 89 + 2.2) * 0.13;
    punkte.push(`${(kx0 + t * (kx1 - kx0)).toFixed(1)},${(mitte + fenster * huelle * wert * 1.5).toFixed(1)}`);
  }
  wires.push(`<polyline points="${punkte.join(" ")}" fill="none" stroke="${c.gray}" stroke-width="3"/>`);
  wires.push(d.line(340, mitte, kx0, mitte, { color: c.gray, width: 3 }));
  wires.push(d.arrow(kx1, mitte, 1060, mitte, { color: c.gray, width: 3 }));

  boxes.push(d.box(40, y, 300, h, "sender", { size: 32, border: c.white }));
  boxes.push(d.box(1060, y, 300, h, "sensor", { size: 32, border: c.white }));
  boxes.push(`<circle cx="390" cy="${mitte}" r="20" fill="${c.yellow}"/>`);

  labels.push(d.label(190, y - 30, "(255, 0, 0)", { size: 32, color: c.light, anchor: "middle", mono: true }));
  labels.push(d.label(1400, 0, "r = 203\ng =  41\nb =  57", { size: 32, color: c.light, mono: true, centerY: mitte }));
  labels.push(d.label(705, y - 30, "ambient light · distance · noise", { size: 32, color: c.gray, anchor: "middle" }));

  // die drei Zonen
  [[190, "digital", c.yellow], [705, "analog", c.red], [1355, "digital", c.yellow]].forEach(([x, t, col]) => {
    labels.push(d.label(x, y + h + 90, t, { size: 32, color: col, anchor: "middle" }));
  });
  [365, 1030].forEach((x) => labels.push(d.line(x, 40, x, y + h + 110, { color: c.dark, width: 2, dashed: true })));
  return put("fig-middle", d.svg(1680, 460, ...d.layers(wires, boxes, labels)));
};

/* --- 3. gleiches Rauschen, mehr Bereiche --------------------------------- */

window.drawRegions = function (_slide, step = 0) {
  const c = d.colors();
  const oben = 40, hoehe = 480, breite = 220;
  const spalten = [
    { x: 250, n: 2 },
    { x: 730, n: 4 },
    { x: 1210, n: 8 },
  ];
  const parts = [];
  const wackel = 52;   // dieselbe Schwankung in allen drei Spalten:
                       // bei 2 bequem, bei 4 knapp, bei 8 darueber hinaus

  spalten.slice(0, Math.min(2, step) + 1).forEach(({ x, n }) => {
    const fach = hoehe / n;
    parts.push(d.box(x, oben, breite, hoehe, "", { border: c.light, rounded: false, fill: "none" }));
    for (let i = 1; i < n; i += 1) {
      parts.push(d.line(x, oben + i * fach, x + breite, oben + i * fach, { color: c.gray, width: 2 }));
    }
    // eine Messung mit ihrem Band, immer in der Mitte des Bildes
    const mitte = oben + hoehe / 2 - fach / 2;
    const passt = wackel < fach / 2;
    const farbe = passt ? c.white : c.red;
    parts.push(d.line(x + breite / 2, mitte - wackel, x + breite / 2, mitte + wackel, { color: farbe, width: 4 }));
    [-wackel, wackel].forEach((dy) => {
      parts.push(d.line(x + breite / 2 - 26, mitte + dy, x + breite / 2 + 26, mitte + dy, { color: farbe, width: 4 }));
    });
    parts.push(`<circle cx="${x + breite / 2}" cy="${mitte}" r="11" fill="${farbe}"/>`);
    parts.push(d.label(x + breite / 2, oben + hoehe + 60, `${n} regions`, { size: 32, color: c.gray, anchor: "middle" }));
  });

  if (step >= 1) {
    parts.push(d.label(840, oben + hoehe + 140, "the same measurement with the same wobble, three times",
                       { size: 32, color: c.gray, anchor: "middle" }));
  }
  return put("fig-regions", d.svg(1680, oben + hoehe + 180, ...parts));
};

/* --- 4. was die weggeworfene Genauigkeit einkauft ------------------------ */

window.drawCopies = function () {
  const c = d.colors();
  const x0 = 60, w = 250, h = 100, luecke = 130;
  const namen = ["tape", "copy", "copy", "copy"];
  const dateien = ["file", "copy", "copy", "copy"];
  const wires = [], boxes = [], labels = [];

  const welle = (x, y, rauschen) => {
    const punkte = [];
    for (let i = 0; i <= 26; i += 1) {
      const t = i / 26;
      const grund = Math.sin(t * Math.PI * 2) * 22;
      const stoerung = rauschen ? (i % 2 ? -1 : 1) * rauschen : 0;
      punkte.push(`${x + t * luecke},${y + grund + stoerung}`);
    }
    return `<polyline points="${punkte.join(" ")}" fill="none" stroke="${c.light}" stroke-width="3"/>`;
  };

  namen.forEach((t, i) => {
    const x = x0 + i * (w + luecke);
    boxes.push(d.box(x, 60, w, h, t, { size: 32, border: i === 0 ? c.white : c.dark, color: i === 0 ? c.white : c.light }));
    if (i > 0) wires.push(welle(x - luecke, 110, (i - 1) * 9));
  });
  dateien.forEach((t, i) => {
    const x = x0 + i * (w + luecke);
    boxes.push(d.box(x, 330, w, h, t, { size: 32, border: i === 0 ? c.white : c.dark, color: i === 0 ? c.white : c.light }));
    labels.push(d.label(x + w / 2, 470, "0 1 1 0", { size: 32, color: c.yellow, anchor: "middle", mono: true }));
    if (i > 0) wires.push(d.arrow(x - luecke, 380, x, 380, { color: c.gray, width: 3 }));
  });
  labels.push(d.label(x0, 40, "analog: every copy carries the noise of the last one", { size: 20, color: c.gray }));
  labels.push(d.label(x0, 310, "digital: every copy is read and set again", { size: 20, color: c.gray }));
  return put("fig-copies", d.svg(1680, 520, ...d.layers(wires, boxes, labels)));
};

/* --- 5. die zwei Schnitte ------------------------------------------------ */

window.drawCuts = async function (_slide, step = 0) {
  const c = d.colors();
  const g = 300, y = 90;
  const xs = [110, 690, 1270];
  const voll = await pixeln(256);
  const abgetastet = await pixeln(16);
  const quantisiert = await pixeln(16, 4, true);

  const parts = [];
  parts.push(bild(voll, xs[0], y, g));
  // das Abtastraster ueber dem Original
  for (let i = 1; i < 16; i += 1) {
    const t = (i / 16) * g;
    parts.push(d.line(xs[0] + t, y, xs[0] + t, y + g, { color: c.gray, width: 1 }));
    parts.push(d.line(xs[0], y + t, xs[0] + g, y + t, { color: c.gray, width: 1 }));
  }
  parts.push(bild(abgetastet, xs[1], y, g));
  parts.push(d.arrow(xs[0] + g + 40, y + g / 2, xs[1] - 40, y + g / 2, { color: c.gray, width: 3 }));
  parts.push(d.label(xs[0] + g / 2, y - 30, "the analog picture", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.label(xs[1] + g / 2, y - 30, "16 × 16 points", { size: 32, color: c.white, anchor: "middle" }));
  parts.push(d.label(150, y + g + 90, "cut 1: sampling", { size: 32, color: c.yellow }));
  parts.push(d.label(150, y + g + 131, "how many points? that is the resolution", { size: 32, color: c.gray }));

  if (step >= 1) {
    parts.push(bild(quantisiert, xs[2], y, g));
    parts.push(d.arrow(xs[1] + g + 40, y + g / 2, xs[2] - 40, y + g / 2, { color: c.gray, width: 3 }));
    parts.push(d.label(xs[2] + g / 2, y - 30, "4 grey levels", { size: 32, color: c.white, anchor: "middle" }));
    parts.push(d.label(900, y + g + 90, "cut 2: quantization", { size: 32, color: c.yellow }));
    parts.push(d.label(900, y + g + 131, "how many levels? that is the colour depth", { size: 32, color: c.gray }));
    // die vier Stufen als Leiter
    for (let i = 0; i < 4; i += 1) {
      const v = Math.round((i / 3) * 255);
      // mit Rand, sonst verschwindet die helle Stufe auf hellem Grund
      parts.push(rect(xs[2] + g + 30, y + g - (i + 1) * 62, 46, 54, `rgb(${v},${v},${v})`, 4)
        .replace("/>", ` stroke="${c.gray}" stroke-width="2"/>`));
    }
  }
  return put("fig-cuts", d.svg(1680, y + g + 170, ...parts));
};

/* --- 6. welcher Schnitt war zu grob? ------------------------------------- */

window.drawArtefacts = async function () {
  const c = d.colors();
  const g = 340, y = 40;
  const links = 260, rechts = 1080;
  const klotzig = await pixeln(8);
  const flach = await pixeln(128, 2, false);
  const rahmen = (x) => d.box(x, y, g, g, "", { border: c.dark, fill: "none", rounded: false });
  const parts = [
    bild(klotzig, links, y, g),
    bild(flach, rechts, y, g),
    rahmen(links),
    rahmen(rechts),
    d.label(links + g / 2, y + g + 60, "too few points", { size: 32, color: c.yellow, anchor: "middle" }),
    d.label(links + g / 2, y + g + 101, "blocks", { size: 32, color: c.gray, anchor: "middle" }),
    d.label(rechts + g / 2, y + g + 60, "too few levels", { size: 32, color: c.yellow, anchor: "middle" }),
    d.label(rechts + g / 2, y + g + 101, "hard patches instead of soft shading", { size: 32, color: c.gray, anchor: "middle" }),
  ];
  return put("fig-artefacts", d.svg(1680, y + g + 140, ...parts));
};

/* --- 7. was ein Bild kostet ---------------------------------------------- */

window.drawCost = function () {
  const c = d.colors();
  const spalten = [80, 560, 900, 1240];
  const kopf = ["points", "bits per point", "size", "over the light link at 30 bit/s"];
  const zeilen = [
    ["4,096", "24 bit", "12 KB", "about 55 minutes"],
    ["4,096", "1 bit", "512 bytes", "about 2 minutes"],
  ];
  const parts = [
    d.label(80, 60, "64 × 64 points × bits per point = size", { size: 32, color: c.gray, mono: true }),
  ];
  kopf.forEach((t, j) => parts.push(d.label(spalten[j], 160, t, { size: 20, color: c.gray })));
  parts.push(d.line(60, 190, 1620, 190, { color: c.dark, width: 2 }));
  zeilen.forEach((zeile, i) => {
    const y = 270 + i * 110;
    zeile.forEach((v, j) => {
      const letzte = j === 3;
      parts.push(d.label(spalten[j], y, v, {
        size: 32, mono: !letzte, keepCase: true,
        color: letzte ? (i ? c.green : c.red) : c.white,
      }));
    });
  });
  parts.push(d.line(60, 400, 1620, 400, { color: c.dark, width: 2 }));
  return put("fig-cost", d.svg(1680, 440, ...parts));
};

/* --- 8. wie weit kann man gehen? ----------------------------------------- */

window.drawExtreme = async function (_slide, step = 0) {
  const stufen = [
    { n: 128, text: "128 × 128" },
    { n: 32, text: "32 × 32" },
    { n: 8, text: "8 × 8" },
    { n: 2, text: "2 × 2" },
  ];
  const c = d.colors();
  const g = 300, y = 40, x0 = 110, luecke = 76;
  const parts = [];
  const sichtbar = Math.min(3, step);
  for (let i = 0; i <= sichtbar; i += 1) {
    const x = x0 + i * (g + luecke);
    parts.push(bild(await pixeln(stufen[i].n), x, y, g));
    parts.push(d.label(x + g / 2, y + g + 60, stufen[i].text, { size: 32, color: c.white, anchor: "middle", mono: true }));
    const bytes = Math.round((stufen[i].n * stufen[i].n * 24) / 8);
    parts.push(d.label(x + g / 2, y + g + 101, `${bytes.toLocaleString("en")} bytes`, { size: 32, color: c.gray, anchor: "middle", mono: true }));
  }
  return put("fig-extreme", d.svg(1680, y + g + 140, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-kinds")) {
  window.drawKinds();
  window.drawMiddle();
  window.drawCopies();
  window.drawCost();
  window.drawArtefacts();
}

window.deck05 = {
  kinds: window.drawKinds,
  middle: window.drawMiddle,
  regions: window.drawRegions,
  copies: window.drawCopies,
  cuts: window.drawCuts,
  artefacts: window.drawArtefacts,
  cost: window.drawCost,
  extreme: window.drawExtreme,
  pixeln,
};
