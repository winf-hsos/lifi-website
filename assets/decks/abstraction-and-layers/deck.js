/* Zeichnungen fuer „what's under the switch?" (Abstraktion und Schichten).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt. So laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert. */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

function rect(x, y, w, h, fill, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
}

/* --- 1. hinter dem Schalter ---------------------------------------------- */

window.drawGrid = function (_slide, step = 0) {
  const c = d.colors();
  const namen = ["switch", "wire", "transformer", "grid", "power plant"];
  const x0 = 15, w = 270, gap = 72, y = 175, h = 155;
  const wires = [], boxes = [], labels = [];
  const sichtbar = step >= 1 ? 5 : 1;
  for (let i = 0; i < sichtbar; i += 1) {
    const x = x0 + i * (w + gap);
    if (i > 0) wires.push(d.arrow(x - gap - 10, y + h / 2, x + 20, y + h / 2, { color: c.gray, width: 3 }));
    boxes.push(d.box(x, y, w, h, namen[i], {
      size: 32, border: i === 0 ? c.white : c.dark, color: i === 0 ? c.white : c.light,
    }));
  }
  if (step >= 2) {
    const x = x0 + w + gap;
    const breite = 4 * w + 3 * gap;
    labels.push(d.box(x - 26, y - 40, breite + 52, h + 80, "", { border: c.gray, dashed: true, fill: "none" }));
    labels.push(d.label(x + breite / 2, y + h + 100, "you never think about any of this",
                        { size: 32, color: c.gray, anchor: "middle" }));
  }
  return put("fig-grid", d.svg(1680, 470, ...d.layers(wires, boxes, labels)));
};

/* --- 2. drei Abstraktionen, die heute schon benutzt wurden ---------------- */

window.drawHiding = function () {
  const c = d.colors();
  const spalten = [
    { oben: "led.set_color(255, 0, 0)", unten: ["usb", "tinkerforge protocol", "voltages", "led driver"] },
    { oben: "python", unten: ["machine code", "memory", "the cpu"] },
    { oben: "photo.jpg", unten: ["bytes on a disk", "a file system", "a controller"] },
  ];
  const x0 = 0, w = 520, gap = 60, hoehe = 150;
  const parts = [];
  spalten.forEach((s, i) => {
    const x = x0 + i * (w + gap);
    parts.push(d.box(x, 30, w, hoehe, s.oben, { size: 32, mono: true, border: c.white }));
    parts.push(d.arrow(x + w / 2, 30 + hoehe, x + w / 2, 275, { color: c.gray, width: 3 }));
    parts.push(d.label(x + w / 2 + 22, 240, "hides", { size: 20, color: c.gray }));
    parts.push(d.box(x, 285, w, 260, s.unten.join("\n"),
                     { size: 32, mono: true, border: c.dark, color: c.gray }));
  });
  return put("fig-hiding", d.svg(1680, 575, ...parts));
};

/* --- 3. der Stapel, den sie selbst gebaut haben --------------------------- */

const SCHICHTEN = ["meaning", "code system", "frame", "bits", "symbols", "carrier"];

/* Fuer die Website: das Foto als data-URI einbetten. Ein SVG, das eine Seite
 * ueber <img> laedt, darf keine externen Bilder nachladen; ohne data-URI bliebe
 * das Vorschaubild dort leer. */
window.toDataURI = async function (pfad) {
  const antwort = await fetch(pfad);
  const blob = await antwort.blob();
  return new Promise((fertig) => {
    const leser = new FileReader();
    leser.onload = () => fertig(leser.result);
    leser.readAsDataURL(blob);
  });
};

window.drawStack = function (_slide, step = 0, bildSrc = "img/parrot.png") {
  const c = d.colors();
  const x = 420, w = 430, h = 96, gap = 10, y0 = 26;
  const artX = 930;
  const sichtbar = Math.min(5, step);
  const parts = [];

  // die Richtung: von oben nach unten wird gesendet
  parts.push(d.arrow(350, y0, 350, y0 + 6 * (h + gap) - gap, { color: c.dark, width: 3 }));
  parts.push(d.label(330, y0 + 14, "sending", { size: 20, color: c.gray, anchor: "end" }));

  for (let i = 0; i <= sichtbar; i += 1) {
    const y = y0 + i * (h + gap);
    const aktuell = i === sichtbar;
    parts.push(d.box(x, y, w, h, SCHICHTEN[i], {
      size: 32, border: aktuell ? c.white : c.dark, color: aktuell ? c.white : c.light,
    }));
    const mitte = y + h / 2;
    if (i === 0) {
      parts.push(`<image href="${bildSrc}" x="${artX}" y="${y + 8}" width="107" height="80"/>`);
      parts.push(d.label(artX + 130, 0, "your photo", { size: 32, color: c.light, centerY: mitte }));
    } else if (i === 1) {
      parts.push(d.label(artX, 0, "FF D8 FF E0 …", { size: 32, color: c.light, mono: true, keepCase: true, centerY: mitte }));
    } else if (i === 2) {
      const felder = [["pre", 90], ["type", 90], ["len", 90], ["payload", 240], ["crc", 90], ["end", 80]];
      let fx = artX;
      felder.forEach(([name, breite]) => {
        parts.push(d.box(fx, mitte - 26, breite, 52, name, { size: 20, border: c.gray, color: c.light, rx: 4 }));
        fx += breite + 6;
      });
    } else if (i === 3) {
      parts.push(d.label(artX, 0, "1101 0010 0110 1001", { size: 32, color: c.light, mono: true, centerY: mitte }));
    } else if (i === 4) {
      // vier Farbflaechen als Symbole: die vier Toene der Palette, die in beiden
      // Themes am weitesten auseinanderliegen (gruen und blau werden hell zu zwei Blau)
      [c.red, c.yellow, c.blue, c.dark].forEach((farbe, k) => {
        parts.push(rect(artX + k * 76, mitte - 30, 60, 60, farbe, 6));
      });
    } else {
      parts.push(d.label(artX, 0, "light", { size: 32, color: c.yellow, centerY: mitte }));
    }
  }
  return put("fig-stack", d.svg(1680, y0 + 6 * (h + gap) + 20, ...parts));
};

/* --- 4. was die Trennung einbringt ---------------------------------------- */

window.drawSeparate = function () {
  const c = d.colors();
  const parts = [];
  const wires = [
    d.arrow(840, 175, 840, 235, { color: c.gray, width: 3 }),
    d.arrow(840, 335, 840, 395, { color: c.gray, width: 3 }),
  ];
  const boxes = [
    d.box(560, 25, 560, 150, "text_to_bits()", { size: 32, mono: true, border: c.white }),
    d.box(560, 235, 560, 100, "1101 0010 0110 1001", { size: 32, mono: true, border: c.blue, color: c.blue }),
    d.box(560, 395, 560, 150, "send_symbol()", { size: 32, mono: true, border: c.white }),
  ];
  const labels = [
    d.label(530, 0, "knows nothing\nabout colours", { size: 32, color: c.gray, anchor: "end", centerY: 100 }),
    d.label(1150, 0, "knows nothing\nabout letters", { size: 32, color: c.gray, centerY: 470 }),
    d.label(1150, 0, "bits: all they share", { size: 32, color: c.blue, centerY: 285 }),
  ];
  parts.push(...d.layers(wires, boxes, labels));
  return put("fig-separate", d.svg(1680, 575, ...parts));
};

/* --- 5. wer darf led.set_color aufrufen? ---------------------------------- */

window.drawCalls = function (_slide, step = 0) {
  const c = d.colors();
  // Die Frage ist ein Aufruf, also traegt der Pfeil das Urteil, nicht der
  // Kasten: gruen ist der erlaubte Weg, rot die Abkuerzung.
  const x = 60, w = 520, h = 120;
  const ys = [20, 180, 340, 530];
  const cx = x + w / 2;
  const wires = [], boxes = [], labels = [];

  wires.push(d.arrow(cx, ys[0] + h, cx, ys[1], { color: c.gray, width: 3 }));
  wires.push(d.arrow(cx, ys[1] + h, cx, ys[2], { color: c.gray, width: 3 }));

  const stil = { size: 32, mono: true, border: c.dark, color: c.light };
  boxes.push(d.box(x, ys[0], w, h, "send_text()", stil));
  boxes.push(d.box(x, ys[1], w, h, "send_frame()", stil));
  boxes.push(d.box(x, ys[2], w, h, "send_symbols()",
                   { ...stil, border: step >= 1 ? c.green : c.dark, color: step >= 1 ? c.white : c.light }));
  boxes.push(d.box(x, ys[3], w, h, "led.set_color()", { size: 32, mono: true, border: c.gray, color: c.white }));
  labels.push(d.label(x + w + 20, ys[3] + 26, "lifi_hardware", { size: 20, color: c.gray, mono: true }));

  if (step >= 1) {
    wires.push(d.arrow(cx, ys[2] + h, cx, ys[3], { color: c.green, width: 5 }));
    labels.push(d.label(x, 710, "allowed", { size: 32, color: c.green }));
    labels.push(d.label(x, 751, "only this layer knows which colour a symbol is", { size: 32, color: c.gray }));
  }
  if (step >= 2) {
    const rx = 1040, mitte = ys[3] + h / 2;
    wires.push(d.line(x + w, ys[0] + h / 2, rx, ys[0] + h / 2, { color: c.red, width: 5 }));
    wires.push(d.line(rx, ys[0] + h / 2, rx, mitte, { color: c.red, width: 5 }));
    wires.push(d.arrow(rx, mitte, x + w + 10, mitte, { color: c.red, width: 5 }));
    labels.push(d.label(1085, 270, "the shortcut", { size: 32, color: c.red }));
    labels.push(d.label(1085, 311, "colours end up in", { size: 32, color: c.gray }));
    labels.push(d.label(1085, 352, "send_text", { size: 32, color: c.gray, mono: true }));
  }
  return put("fig-calls", d.svg(1500, 790, ...d.layers(wires, boxes, labels)));
};

/* --- 6. unterste Schicht tauschen ----------------------------------------- */

window.drawSwap = function (_slide, step = 0) {
  const c = d.colors();
  const w = 460, h = 70, gap = 10, y0 = 60;
  const parts = [];
  const stapel = (x, unten, hell) => {
    SCHICHTEN.forEach((name, i) => {
      const y = y0 + i * (h + gap);
      const istUnten = i === 5;
      parts.push(d.box(x, y, w, h, istUnten ? unten : name, {
        size: 32,
        border: istUnten ? c.yellow : c.dark,
        color: istUnten ? c.yellow : (hell ? c.gray : c.light),
      }));
    });
    parts.push(d.label(x + w / 2, y0 - 22, hell ? "with sound" : "today", { size: 32, color: c.gray, anchor: "middle" }));
  };
  stapel(240, "light", false);
  if (step >= 1) {
    stapel(980, "sound", true);
    const mitte = (700 + 980) / 2;
    parts.push(d.label(mitte, y0 + 2 * (h + gap) + 20, "not one line", { size: 32, color: c.gray, anchor: "middle" }));
    parts.push(d.label(mitte, y0 + 2 * (h + gap) + 61, "changes", { size: 32, color: c.gray, anchor: "middle" }));
    parts.push(d.label(mitte, y0 + 2 * (h + gap) + 102, "up here", { size: 32, color: c.gray, anchor: "middle" }));
    const yUnten = y0 + 5 * (h + gap) + h / 2;
    parts.push(d.arrow(700, yUnten, 980, yUnten, { color: c.yellow, width: 4 }));
  }
  return put("fig-swap", d.svg(1680, y0 + 6 * (h + gap) + 20, ...parts));
};

/* --- 7. Alphabet von vier auf acht Farben --------------------------------- */

window.drawAlphabet = function (_slide, step = 0) {
  const c = d.colors();
  // derselbe Stapel wie ueberall: so ist sofort zu sehen, wo die aenderung sitzt
  const x = 420, w = 560, h = 80, gap = 12, y0 = 40;
  const parts = [];
  SCHICHTEN.forEach((name, i) => {
    const y = y0 + i * (h + gap);
    const betroffen = i === 4;
    const hervor = step >= 1 && betroffen;
    parts.push(d.box(x, y, w, h, name, {
      size: 32,
      border: hervor ? c.yellow : c.dark,
      color: hervor ? c.yellow : (step >= 1 ? c.gray : c.light),
    }));
  });
  if (step >= 1) {
    const mitte = y0 + 4 * (h + gap) + h / 2;
    parts.push(d.label(1080, 0, "colour table\ncalibration\nbits ↔ symbols",
                       { size: 32, color: c.yellow, centerY: mitte }));
    parts.push(d.label(x + w / 2, y0 + 6 * (h + gap) + 50, "every other layer: unchanged",
                       { size: 32, color: c.gray, anchor: "middle" }));
  }
  return put("fig-alphabet", d.svg(1680, y0 + 6 * (h + gap) + 90, ...parts));
};

/* --- 8. der Preis ---------------------------------------------------------- */

window.drawCost = function (_slide, step = 0) {
  const c = d.colors();
  const zeilen = [
    ["every layer adds its own data", "the frame costs bytes you cannot use"],
    ["every boundary hides a knob", "the one you need is always the hidden one"],
    ["you must learn where the boundaries are", "a wrong guess sends you looking in the wrong place"],
  ];
  const parts = [];
  for (let i = 0; i <= Math.min(2, step); i += 1) {
    const y = 70 + i * 175;
    // mittig zum zweizeiligen Block, sonst wirkt die Ziffer zu hoch
    parts.push(d.label(20, y + 27, String(i + 1), { size: 48, color: c.yellow, mono: true }));
    parts.push(d.label(110, y, zeilen[i][0], { size: 48, color: c.white }));
    parts.push(d.label(110, y + 55, zeilen[i][1], { size: 32, color: c.gray }));
  }
  return put("fig-cost", d.svg(1680, 490, ...parts));
};

/* --- 9. Fehler nach Schichten eingrenzen ---------------------------------- */

window.drawFault = function (_slide, step = 0) {
  const c = d.colors();
  const x = 200, w = 800, h = 150;
  const ys = [20, 190, 360];
  const parts = [];

  const oben = "meaning · code system · frame · bits";
  if (step >= 2) {
    // kein Fehlurteil, sondern der Bereich, der jetzt noch in Frage kommt
    parts.push(d.verdict(x, ys[0], w, h, oben, null, { size: 32, color: c.white, border: c.blue }));
    parts.push(d.label(1050, 0, "look here", { size: 32, color: c.blue, centerY: ys[0] + h / 2 - 20 }));
    parts.push(d.label(1050, 0, "the fault is above the tested layer", { size: 32, color: c.gray, centerY: ys[0] + h / 2 + 21 }));
  } else {
    parts.push(d.verdict(x, ys[0], w, h, oben, null, { size: 32, color: c.light, border: c.dark }));
  }

  if (step >= 1) {
    parts.push(d.verdict(x, ys[1], w, h, "symbols", true, { size: 32, color: c.white }));
    parts.push(d.label(1050, 0, "tested: 100 % of symbols\nrecognised correctly",
                       { size: 32, color: c.green, centerY: ys[1] + h / 2 }));
  } else {
    parts.push(d.verdict(x, ys[1], w, h, "symbols", null, { size: 32, color: c.light, border: c.dark }));
    parts.push(d.label(1050, 0, "?", { size: 48, color: c.gray, centerY: ys[1] + h / 2 }));
  }

  parts.push(d.verdict(x, ys[2], w, h, "carrier", null, { size: 32, color: c.light, border: c.dark }));
  return put("fig-fault", d.svg(1680, 540, ...parts));
};

/* --- 10. was eine gute Schnittstelle zeigt -------------------------------- */

window.drawInterface = function () {
  const c = d.colors();
  const x = 540, w = 600, y = 235, h = 170;
  const wires = [], boxes = [], labels = [];

  ["integration_time", "gain"].forEach((name, i) => {
    const bx = 470 + i * 400;
    boxes.push(d.box(bx, 60, 340, 100, name, { size: 32, mono: true, border: c.yellow, color: c.yellow }));
    wires.push(d.line(bx + 170, 160, bx + 170, y, { color: c.yellow, width: 3 }));
  });
  boxes.push(d.box(x, y, w, h, "lifi_hardware", { size: 32, mono: true, border: c.white }));

  const versteckt = ["usb", "tinkerforge protocol", "voltages", "led driver"];
  wires.push(d.line(x + w / 2, y + h, x + w / 2, 470, { color: c.dark, width: 3 }));
  boxes.push(d.box(440, 470, 800, 210, versteckt.join("\n"),
                   { size: 32, mono: true, border: c.dark, color: c.gray }));

  labels.push(d.label(440, 0, "shown to you", { size: 32, color: c.gray, anchor: "end", centerY: 110 }));
  labels.push(d.label(420, 0, "hidden from you", { size: 32, color: c.gray, anchor: "end", centerY: 575 }));
  return put("fig-interface", d.svg(1680, 700, ...d.layers(wires, boxes, labels)));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-grid")) {
  window.drawHiding();
  window.drawSeparate();
  window.drawInterface();
}

window.deck13 = {
  grid: window.drawGrid,
  hiding: window.drawHiding,
  stack: window.drawStack,
  separate: window.drawSeparate,
  calls: window.drawCalls,
  swap: window.drawSwap,
  alphabet: window.drawAlphabet,
  cost: window.drawCost,
  fault: window.drawFault,
  iface: window.drawInterface,
};
