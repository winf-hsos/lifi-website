/* Zeichnungen fuer „say it shorter" (Kompression).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 * Die Zeichnungen zu „die sonne", den Lauflaengen und dem Abzaehlargument
 * kommen aus Deck 14 (erste Fassung, 12.09.2026). */

"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };

/* Ein waagerechter Balken aus Abschnitten: [anteil, farbe, deckkraft]. */
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

/* Verweise auf andere Konzepte: nie ueber eine Decknummer, sondern ueber den
 * Konzeptnamen als Link auf die Seite (Regel vom 14.09.2026). Blau verweist. */
const SEITE = (konzept) => `https://docs.lifi-project.de/concepts/${konzept}.html`;
const verweis = (konzept, label) => `<a href="${SEITE(konzept)}" target="_blank">${label}</a>`;

const SATZ = "die sonne scheint und die sonne waermt und die sonne geht unter";
const WORT = "die sonne";

/* Alle Vorkommen von WORT im Satz, als [start, laenge]. */
function treffer() {
  const out = [];
  for (let i = SATZ.indexOf(WORT); i >= 0; i = SATZ.indexOf(WORT, i + WORT.length)) out.push([i, WORT.length]);
  return out;
}

/* --- Teil 1: why anything shrinks ------------------------------------------ */

/* Warum sich ueberhaupt etwas komprimieren laesst. */
window.drawWhyCompress = function () {
  const c = d.colors();
  const x0 = 120, y = 160, zw = 24;
  const parts = [];
  const tr = treffer();
  [...SATZ].forEach((z, i) => {
    const markiert = tr.some(([von, len]) => i >= von && i < von + len);
    if (markiert) {
      parts.push(`<rect x="${x0 + i * zw - 3}" y="${y - 40}" width="${zw}" height="60" rx="3" fill="${c.yellow}" fill-opacity="0.2"/>`);
    }
    parts.push(d.label(x0 + i * zw + zw / 2, 0, z === " " ? "" : z,
                       { size: 32, mono: true, color: markiert ? c.yellow : c.light, anchor: "middle", centerY: y }));
  });
  parts.push(d.label(x0, 0, "the same nine characters, three times", { size: 20, color: c.yellow, centerY: y + 80 }));
  parts.push(d.label(x0, 0, "and german text uses e and n constantly, q and x almost never",
                     { size: 20, color: c.gray, centerY: y + 130 }));
  parts.push(d.label(x0, 0, "every regularity is room the usual notation gives away",
                     { size: 32, color: c.white, centerY: y + 210 }));
  return put("fig-why-compress", d.svg(1680, 400, ...parts));
};

/* Morse aus Deck 06 und die feste Laenge aus Deck 08, nebeneinander. */
window.drawSeenBefore = function () {
  const c = d.colors();
  const parts = [];
  // links: Morse, das Haeufige kurz
  const lx = 200;
  parts.push(verweis("symbols-and-information", d.label(lx, 0, "symbols and information: morse", { size: 20, color: c.blue, centerY: 80 })));
  const zeichen = [["e", "·", "the most frequent letter"], ["t", "−", ""], ["q", "− − · −", "one of the rarest"], ["j", "· − − −", ""]];
  zeichen.forEach(([b, m, hinweis], i) => {
    const y = 160 + i * 84;
    parts.push(d.label(lx, 0, b, { size: 48, mono: true, color: c.white, centerY: y }));
    // Kein Gelb fuer das e: der Punkt ist kein Bit und nichts Aktuelles, und
    // neben der roten Zeile rechts laese man ihn als 1. Die Kuerze sieht man.
    parts.push(d.label(lx + 90, 0, m, { size: 48, mono: true, color: b === "e" ? c.white : c.light, centerY: y }));
    if (hinweis) parts.push(d.label(lx + 330, 0, hinweis, { size: 20, color: c.gray, centerY: y }));
  });
  // rechts: die feste Laenge und ihr Preis
  const rx = 920;
  parts.push(verweis("code-systems", d.label(rx, 0, "code systems: three ways out", { size: 20, color: c.blue, centerY: 80 })));
  parts.push(d.label(rx, 0, "fixed length", { size: 48, color: c.white, centerY: 160 }));
  parts.push(d.label(rx, 0, "easy to read: every letter is three bits", { size: 32, color: c.light, centerY: 230 }));
  parts.push(d.label(rx, 0, "and the e pays as much as the q", { size: 32, color: c.red, centerY: 300 }));
  parts.push(d.label(rx, 0, "what we left open: a rule for the short codes", { size: 20, color: c.gray, centerY: 400 }));
  return put("fig-seen-before", d.svg(1680, 480, ...parts));
};

/* --- Teil 2: two tricks, and a zip ----------------------------------------- */

/* Trick eins: Wiederholtes einmal sagen, danach nur noch zurueckzeigen. */
window.drawPointBack = function () {
  const c = d.colors();
  const x0 = 100, zw = 24;
  const parts = [];
  const tr = treffer();
  // Zeile 1: der Satz, alle Vorkommen markiert
  const y1 = 120;
  [...SATZ].forEach((z, i) => {
    const markiert = tr.some(([von, len]) => i >= von && i < von + len);
    parts.push(d.label(x0 + i * zw + zw / 2, 0, z === " " ? "" : z,
                       { size: 32, mono: true, color: markiert ? c.yellow : c.light, anchor: "middle", centerY: y1 }));
  });
  parts.push(d.label(x0, 0, `${SATZ.length} characters`, { size: 20, color: c.gray, centerY: y1 + 50 }));
  // Zeile 2: das erste Vorkommen bleibt, die weiteren werden Verweise
  const y2 = 300;
  let x = x0, zeichen = 0, verweise = 0;
  let i = 0;
  while (i < SATZ.length) {
    const t = tr.find(([von]) => von === i);
    if (t && t[0] > 0) {
      const zurueck = i - tr[tr.findIndex(([von]) => von === i) - 1][0];
      const text = `(${zurueck} back, ${t[1]} long)`;
      const w = text.length * 12.5 + 16;
      parts.push(`<rect x="${x}" y="${y2 - 26}" width="${w}" height="52" rx="6" fill="${c.yellow}" fill-opacity="0.18" stroke="${c.yellow}" stroke-width="2"/>`);
      parts.push(d.label(x + 8, 0, text, { size: 20, mono: true, color: c.yellow, centerY: y2 }));
      x += w + 10;
      i += t[1];
      verweise += 1;
    } else {
      const z = SATZ[i];
      parts.push(d.label(x + zw / 2, 0, z === " " ? "" : z, { size: 32, mono: true, color: c.light, anchor: "middle", centerY: y2 }));
      x += zw;
      zeichen += 1;
      i += 1;
    }
  }
  parts.push(d.label(x0, 0, `${zeichen} characters and ${verweise} pointers`, { size: 20, color: c.yellow, centerY: y2 + 50 }));
  parts.push(d.label(x0, 0, "a pointer costs about as much as two characters.\nthe packer keeps the last few thousand characters in mind and looks for repeats.",
                     { size: 20, color: c.gray, centerY: y2 + 130 }));
  return put("fig-point-back", d.svg(1680, 470, ...parts));
};

/* Lauflaengen: ein Bild mit Flaechen gegen ein Schachbrett. */
function bildGitter(x0, y0, zell, muster) {
  const c = d.colors();
  const teile = [];
  for (let r = 0; r < 8; r++) {
    for (let s = 0; s < 8; s++) {
      const an = muster(r, s);
      // Die Zellfarben sind der Bildinhalt, ein echtes Schwarz-Weiss-Bild, und
      // deshalb keine Palettenfarben. Der duenne Rahmen in Grau gehoert nicht
      // zum Bild, sondern macht das Raster zaehlbar: ohne ihn verschwinden die
      // hellen Zellen auf hellem Grund (figures.py, --theme light) im Papier.
      // Grau hat in beiden Paletten denselben Wert, der Rahmen traegt also
      // keine Bedeutung. Die Zellen stossen buendig aneinander, ohne runde
      // Ecken: Nachbarn teilen sich dadurch eine Rasterlinie.
      teile.push(`<rect x="${x0 + s * zell}" y="${y0 + r * zell}" width="${zell}" height="${zell}" ` +
                 `fill="${an ? "#ffffff" : "#2a2f35"}" stroke="${c.gray}" stroke-width="1"/>`);
    }
  }
  return teile;
}

// Beide Lauflaengen-Folien liegen hintereinander und zeigen dasselbe Gitter an
// derselben Stelle: gleiches Textraster, gleiche viewBox, sonst springt das Bild.
window.drawRunGood = function () {
  const c = d.colors();
  const zell = 46, x0 = 200, y0 = 120;
  const muster = (r, s) => (r < 3 ? s >= 2 && s <= 5 : r < 6 ? s >= 1 && s <= 6 : false);
  const parts = bildGitter(x0, y0, zell, muster);
  parts.push(d.label(x0 + 4 * zell, 0, "8 x 8 points, one bit each: 8 bytes",
                     { size: 20, color: c.gray, anchor: "middle", centerY: y0 - 40 }));
  const rx = 820;
  parts.push(d.label(rx, 0, "row by row, count equal points:", { size: 32, color: c.white, centerY: 180 }));
  ["2 dark, 4 light, 2 dark", "1 dark, 6 light, 1 dark", "8 dark"].forEach((z, i) => {
    parts.push(d.label(rx, 0, z, { size: 32, mono: true, color: c.light, centerY: 260 + i * 56 }));
  });
  parts.push(d.label(rx, 0, "one byte per run: 1 bit colour, 7 bits length", { size: 20, color: c.gray, centerY: 460 }));
  parts.push(d.label(rx, 0, "6 bytes instead of 8", { size: 48, mono: true, color: c.green, centerY: 540 }));
  return put("fig-run-good", d.svg(1680, 582, ...parts));
};

window.drawRunBad = function () {
  const c = d.colors();
  const zell = 46, x0 = 200, y0 = 120;
  const parts = bildGitter(x0, y0, zell, (r, s) => (r + s) % 2 === 0);
  parts.push(d.label(x0 + 4 * zell, 0, "the same 8 bytes", { size: 20, color: c.gray, anchor: "middle", centerY: y0 - 40 }));
  const rx = 820;
  parts.push(d.label(rx, 0, "every point differs from its neighbour:", { size: 32, color: c.white, centerY: 180 }));
  parts.push(d.label(rx, 0, "64 runs of length one", { size: 32, mono: true, color: c.light, centerY: 260 }));
  parts.push(d.label(rx, 0, "one byte each", { size: 32, mono: true, color: c.light, centerY: 316 }));
  parts.push(d.label(rx, 0, "a byte that described eight points now describes one",
                     { size: 20, color: c.gray, centerY: 460 }));
  parts.push(d.label(rx, 0, "64 bytes instead of 8", { size: 48, mono: true, color: c.red, centerY: 540 }));
  return put("fig-run-bad", d.svg(1680, 582, ...parts));
};

/* Trick zwei, Schritt eins: zaehlen. */
const ZAUBER = "abracadabra";
const HAEUFIG = [["a", 5], ["b", 2], ["r", 2], ["c", 1], ["d", 1]];
const CODES = { a: "0", b: "100", r: "101", c: "110", d: "111" };

window.drawCountFirst = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 120, zw = 60, y = 130;
  [...ZAUBER].forEach((z, i) => {
    parts.push(d.label(x0 + i * zw + zw / 2, 0, z, { size: 80, mono: true, color: z === "a" ? c.yellow : c.white, anchor: "middle", centerY: y }));
  });
  parts.push(d.label(x0, 0, "11 letters, 5 different", { size: 20, color: c.gray, centerY: y + 80 }));
  HAEUFIG.forEach(([b, n], i) => {
    const bx = x0 + i * 150;
    parts.push(d.label(bx, 0, b, { size: 48, mono: true, color: b === "a" ? c.yellow : c.white, centerY: 320 }));
    parts.push(d.label(bx + 50, 0, `× ${n}`, { size: 32, mono: true, color: c.light, centerY: 320 }));
  });
  const rx = 1000;
  parts.push(d.label(rx, 0, "fixed length, as in", { size: 20, color: c.gray, centerY: 260 }));
  parts.push(verweis("code-systems", d.label(rx + 162, 0, "code systems:", { size: 20, color: c.blue, centerY: 260 })));
  parts.push(d.formula(rx, 0, "5 letters -> 3 bits each", { size: 32, color: c.light, centerY: 320 }));
  parts.push(d.formula(rx, 0, "11 * 3 = 33 bit", { size: 48, color: c.white, centerY: 400 }));
  return put("fig-count-first", d.svg(1680, 460, ...parts));
};

/* Der Huffman-Baum fuer abracadabra. Knoten mit festen Plaetzen; `step` sagt,
 * wie viele Zusammenfassungen schon passiert sind (0 bis 4). Mit `codes`
 * bekommen die Kanten ihre 0 und 1. Dieselbe Zeichnung dient dem Aufbau und
 * dem Ablesen, damit zwischen den beiden Folien nichts springt. */
function baum(step, codes) {
  const c = d.colors();
  const wires = [], nodes = [], labels = [];
  // Blaetter: Buchstabe und Haeufigkeit; innere Knoten: Summe
  const blatt = { a: [320, 300], b: [600, 580], r: [760, 580], c: [900, 580], d: [1060, 580] };
  const innen = {
    cd: { xy: [980, 440], n: 2, kinder: ["c", "d"], ab: 1 },
    br: { xy: [680, 440], n: 4, kinder: ["b", "r"], ab: 2 },
    n6: { xy: [830, 300], n: 6, kinder: ["br", "cd"], ab: 3 },
    root: { xy: [575, 160], n: 11, kinder: ["a", "n6"], ab: 4 },
  };
  const pos = (k) => blatt[k] || innen[k].xy;
  const neu = (k) => innen[k].ab === step;                // gerade entstanden: gelb
  const da = (k) => innen[k].ab <= step;                  // schon da
  const verbunden = new Set();                            // Blaetter, die schon einen Elternknoten haben
  Object.entries(innen).forEach(([k, v]) => {
    if (!da(k)) return;
    const farbe = neu(k) ? c.yellow : c.light;
    v.kinder.forEach((kind, idx) => {
      const [x1, y1] = v.xy, [x2, y2] = pos(kind);
      wires.push(d.line(x1, y1, x2, y2, { color: farbe, width: neu(k) ? 4 : 3 }));
      if (codes) {
        labels.push(d.label((x1 + x2) / 2 + (idx === 0 ? -26 : 26), 0, String(idx),
                            { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: (y1 + y2) / 2 }));
      }
      verbunden.add(kind);
    });
    nodes.push(`<circle cx="${v.xy[0]}" cy="${v.xy[1]}" r="38" fill="${c.bg}" stroke="${farbe}" stroke-width="${neu(k) ? 4 : 3}"/>`);
    labels.push(d.label(v.xy[0], 0, String(v.n), { size: 32, mono: true, color: farbe, anchor: "middle", centerY: v.xy[1] }));
  });
  HAEUFIG.forEach(([b, n]) => {
    const [x, y] = blatt[b];
    // Blaetter, die im aktuellen Schritt zusammengefasst werden, leuchten mit
    const eltern = Object.entries(innen).find(([, v]) => v.kinder.includes(b));
    const aktiv = eltern && innen[eltern[0]].ab === step;
    const farbe = aktiv ? c.yellow : c.light;
    nodes.push(d.box(x - 70, y - 36, 140, 72, "", { border: farbe }));
    labels.push(d.label(x - 24, 0, b, { size: 32, mono: true, color: farbe, anchor: "middle", centerY: y }));
    labels.push(d.label(x + 28, 0, String(n), { size: 32, mono: true, color: c.gray, anchor: "middle", centerY: y }));
  });
  return d.layers(wires, nodes, labels);
}

window.drawTree = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [baum(step, false)];
  // rechts die Regel, Schritt fuer Schritt; alle Zeilen stehen fest, die aktuelle leuchtet
  const rx = 1200;
  parts.push(d.label(rx, 0, "join the two rarest, write the sum:", { size: 20, color: c.gray, centerY: 120 }));
  const zeilen = ["c 1 + d 1 = 2", "b 2 + r 2 = 4", "2 + 4 = 6", "a 5 + 6 = 11"];
  zeilen.forEach((z, i) => {
    const s = i + 1;
    const farbe = s === step ? c.yellow : s < step ? c.light : c.dark;
    parts.push(d.label(rx, 0, z, { size: 32, mono: true, color: farbe, centerY: 190 + i * 70 }));
  });
  parts.push(d.label(rx, 0, step >= 4 ? "11 letters: the root counts the whole word" : "",
                     { size: 20, color: c.gray, centerY: 500 }));
  return put("fig-tree", d.svg(1680, 640, ...parts));
};

/* Die Codes vom Baum ablesen: links 0, rechts 1. */
window.drawReadCodes = function () {
  const c = d.colors();
  const parts = [baum(4, true)];
  const rx = 1200;
  parts.push(d.label(rx, 0, "left 0, right 1:", { size: 20, color: c.gray, centerY: 100 }));
  HAEUFIG.forEach(([b], i) => {
    const y = 160 + i * 56;
    parts.push(d.label(rx, 0, b, { size: 32, mono: true, color: b === "a" ? c.yellow : c.white, centerY: y }));
    parts.push(d.label(rx + 60, 0, CODES[b], { size: 32, mono: true, color: b === "a" ? c.yellow : c.light, centerY: y }));
  });
  const bits = [...ZAUBER].map((z) => CODES[z]).join("");
  parts.push(d.label(rx, 0, bits.match(/.{1,4}/g).join(" "), { size: 20, mono: true, color: c.light, centerY: 470 }));
  parts.push(d.formula(rx, 0, "5*1 + 6*3 = 23 bit", { size: 32, color: c.green, centerY: 540 }));
  return put("fig-read-codes", d.svg(1680, 640, ...parts));
};

/* Warum die Bitfolge ohne Trennzeichen lesbar ist. */
window.drawReadsItself = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 120, zw = 56, y = 140;
  const folge = "0100101";
  const stuecke = [["0", "a"], ["100", "b"], ["101", "r"]];
  [...folge].forEach((b, i) => {
    parts.push(d.label(x0 + i * zw + zw / 2, 0, b, { size: 80, mono: true, color: c.white, anchor: "middle", centerY: y }));
  });
  let i = 0;
  stuecke.forEach(([code, buchstabe]) => {
    const x1 = x0 + i * zw + 6, x2 = x0 + (i + code.length) * zw - 6;
    parts.push(d.line(x1, y + 60, x2, y + 60, { color: c.yellow, width: 4 }));
    parts.push(d.label((x1 + x2) / 2, 0, buchstabe, { size: 48, mono: true, color: c.yellow, anchor: "middle", centerY: y + 120 }));
    i += code.length;
  });
  parts.push(d.label(x0, 0, "read from the left. as soon as a code is complete, the next one starts.",
                     { size: 20, color: c.gray, centerY: y + 200 }));
  // rechts der Grund
  const rx = 760;
  parts.push(d.label(rx, 0, "letters sit on leaves only", { size: 32, color: c.white, centerY: 110 }));
  parts.push(d.label(rx, 0, "so no code is the beginning of another", { size: 32, color: c.white, centerY: 165 }));
  parts.push(d.label(rx, 0, "0 is a leaf: nothing else starts with 0", { size: 20, color: c.gray, centerY: 225 }));
  // unten das Gegenbeispiel aus Deck 08
  parts.push(d.box(rx, 300, 780, 130, "", { border: c.red }));
  parts.push(d.label(rx + 30, 0, "the prefix trap:  a = 0,  b = 01", { size: 32, mono: true, color: c.red, centerY: 340 }));
  parts.push(d.label(rx + 30, 0, "01 reads as b, or as a followed by something. a is not a leaf there.",
                     { size: 20, color: c.red, centerY: 395 }));
  return put("fig-reads-itself", d.svg(1680, 460, ...parts));
};

/* Was ein ZIP tut, und was dabei herauskommt: gemessen am 13.09.2026. */
window.drawZip = function () {
  const c = d.colors();
  const parts = [];
  // links: das Paar aus zwei Tricks
  parts.push(d.box(120, 100, 560, 300, "", { border: c.light }));
  parts.push(d.label(400, 0, "zip", { size: 48, mono: true, color: c.white, anchor: "middle", centerY: 160 }));
  parts.push(d.label(160, 0, "1  point back", { size: 32, color: c.yellow, centerY: 240 }));
  parts.push(d.label(160, 0, "lempel and ziv, 1977", { size: 20, color: c.gray, centerY: 276 }));
  parts.push(d.label(160, 0, "2  count first", { size: 32, color: c.yellow, centerY: 336 }));
  parts.push(d.label(160, 0, "huffman, 1952", { size: 20, color: c.gray, centerY: 372 }));
  parts.push(d.label(120, 0, "the pair is called deflate. png is the same pair with a picture in front.",
                     { size: 20, color: c.gray, centerY: 450 }));
  // rechts: fuenf Messungen
  const x0 = 1000, breite = 480, h = 56;
  const zeile = (i, name, anteil) => {
    const y = 90 + i * 84;
    parts.push(d.label(x0 - 30, 0, name, { size: 20, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    const voll = Math.min(anteil, 100);
    parts.push(...balken(x0, y, breite, h, [[voll, anteil > 100 ? c.red : c.yellow, 0.85], [100 - voll, c.dark, 0.9]]));
    parts.push(d.label(x0 + breite + 30, 0, `${anteil} %`, { size: 32, mono: true, color: anteil > 100 ? c.red : c.yellow, centerY: y + h / 2 }));
  };
  zeile(0, "a log file", 19);
  zeile(1, "plain text", 45);
  zeile(2, "the photo, raw", 68);
  zeile(3, "the photo, png", 100);
  zeile(4, "random bytes", 101);
  return put("fig-zip", d.svg(1680, 520, ...parts));
};

/* Das Abzaehlargument: acht Dateien, sieben kuerzere Faecher. */
window.drawCounting = function () {
  const c = d.colors();
  const parts = [];
  const drei = [];
  for (let i = 0; i < 8; i++) drei.push(i.toString(2).padStart(3, "0"));
  const kurz = ["", "0", "1", "00", "01", "10", "11"];
  parts.push(d.label(300, 0, "every file of 3 bits", { size: 20, color: c.gray, anchor: "middle", centerY: 100 }));
  drei.forEach((b, i) => {
    parts.push(d.box(180, 140 + i * 74, 240, 62, b, { border: c.light, size: 32, mono: true }));
  });
  parts.push(d.label(1180, 0, "every file shorter than 3 bits", { size: 20, color: c.gray, anchor: "middle", centerY: 100 }));
  kurz.forEach((b, i) => {
    parts.push(d.box(1060, 140 + i * 74, 240, 62, b === "" ? "(empty)" : b,
                     { border: c.light, size: 32, mono: b !== "" }));
  });
  parts.push(d.label(740, 0, "8", { size: 80, mono: true, color: c.yellow, anchor: "middle", centerY: 330 }));
  parts.push(d.label(740, 0, "into", { size: 20, color: c.gray, anchor: "middle", centerY: 400 }));
  parts.push(d.label(740, 0, "7", { size: 80, mono: true, color: c.red, anchor: "middle", centerY: 470 }));
  parts.push(d.label(840, 0, "two of them have to share one shorter file, and then unpacking cannot be unambiguous",
                     { size: 20, color: c.gray, anchor: "middle", centerY: 776 }));
  return put("fig-counting", d.svg(1680, 820, ...parts));
};

/* --- Teil 3: the picture --------------------------------------------------- */

/* Der Papagei in Bytes, und was das bei 10 bit/s an Zeit heisst. */
window.drawParrotHonest = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 420, breite = 800, h = 70, max = 196608;
  const zeile = (i, name, bytes, zeit, farbe) => {
    const y = 100 + i * 130;
    parts.push(d.label(x0 - 40, 0, name, { size: 32, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    const w = Math.max(6, (bytes / max) * breite);
    parts.push(`<rect x="${x0}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="4" fill="${farbe}" fill-opacity="0.85"/>`);
    parts.push(d.label(x0 + breite + 40, 0, bytes.toLocaleString("en").replace(/,/g, " ") + " bytes",
                       { size: 32, mono: true, color: farbe, centerY: y + h / 2 }));
    parts.push(d.label(x0 + breite + 40, 0, `${zeit} at 10 bit/s`, { size: 20, color: c.gray, centerY: y + h + 26 }));
  };
  zeile(0, "raw, 256 × 256 × 3", 196608, "44 hours", c.light);
  zeile(1, "png, lossless", 93107, "21 hours", c.light);
  zeile(2, "your payload", 2048, "27 minutes", c.yellow);
  parts.push(d.label(x0, 0, "the sliver at the bottom is what you are allowed to send", { size: 20, color: c.gray, centerY: 470 }));
  return put("fig-parrot-honest", d.svg(1680, 500, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-why-compress")) {
  window.drawWhyCompress();
  window.drawSeenBefore();
  window.drawPointBack();
  window.drawRunGood();
  window.drawRunBad();
  window.drawCountFirst();
  window.drawTree();
  window.drawReadCodes();
  window.drawReadsItself();
  window.drawZip();
  window.drawCounting();
  window.drawParrotHonest();
}

window.deck15 = {
  whyCompress: window.drawWhyCompress,
  seenBefore: window.drawSeenBefore,
  pointBack: window.drawPointBack,
  runGood: window.drawRunGood,
  runBad: window.drawRunBad,
  countFirst: window.drawCountFirst,
  tree: window.drawTree,
  readCodes: window.drawReadCodes,
  readsItself: window.drawReadsItself,
  zip: window.drawZip,
  counting: window.drawCounting,
  parrotHonest: window.drawParrotHonest,
};
