/* Zeichnungen fuer „say it shorter" (Kompression).
 *
 * Jede Funktion gibt ihr SVG zurueck und schreibt es nur dann in ein Element,
 * wenn es das gibt; so laeuft die Datei auch ohne Folien, etwa wenn
 * tools/figures.py die Abbildungen fuer die Website rendert.
 * Die Zeichnungen zum Beispielsatz, den Lauflaengen und dem Abzaehlargument
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

// Englisch wie alles auf den Folien; drei Vorkommen von "the sun" bei 0, 19 und 37.
const SATZ = "the sun shines and the sun warms and the sun sets";
const WORT = "the sun";

/* Alle Vorkommen von WORT im Satz, als [start, laenge]. */
function treffer() {
  const out = [];
  for (let i = SATZ.indexOf(WORT); i >= 0; i = SATZ.indexOf(WORT, i + WORT.length)) out.push([i, WORT.length]);
  return out;
}

/* Kompression als IPO, zweimal: packen und entpacken. Das Modell aus Deck 03,
 * an den Anfang gestellt, damit klar ist, was hinein- und was herausgeht. */
window.drawIpo = function () {
  const c = d.colors();
  const parts = [];
  parts.push(d.ipo(60, "a file", "pack()", "a smaller file", { level: "pack", monoBox: true }));
  parts.push(d.ipo(280, "the smaller file", "unpack()", "the same file", { level: "unpack", monoBox: true }));
  parts.push(d.label(300, 0, "what goes in here", { size: 20, color: c.gray, anchor: "middle", centerY: 180 }));
  parts.push(d.label(1380, 0, "must come out here, bit for bit", { size: 20, color: c.gray, anchor: "middle", centerY: 400 }));
  return put("fig-ipo", d.svg(1680, 420, ...parts));
};

/* --- Teil 1: why anything shrinks ------------------------------------------ */

/* Warum sich ueberhaupt etwas komprimieren laesst, erste Sorte Luft: ganze
 * Stuecke kommen wieder. Nur die Beobachtung; wie man sie nutzt, zeigt Teil 2. */
window.drawWhyCompress = function () {
  const c = d.colors();
  const x0 = 120, y = 150, zw = 24;
  const parts = [];
  const tr = treffer();
  tr.forEach(([von, len]) => parts.push(d.highlight(x0 + von * zw, len * zw, y, 32)));
  [...SATZ].forEach((z, i) => {
    const markiert = tr.some(([von, len]) => i >= von && i < von + len);
    parts.push(d.label(x0 + i * zw + zw / 2, 0, z === " " ? "" : z,
                       { size: 32, mono: true, color: markiert ? c.yellow : c.light, anchor: "middle", centerY: y }));
  });
  parts.push(d.label(x0, 0, "the same seven characters, three times, and a file written the usual way spells them out three times: contextual redundancy.",
                     { size: 20, color: c.gray, centerY: y + 70 }));
  return put("fig-why-compress", d.svg(1680, 250, ...parts));
};

/* Zweite Sorte Luft: Buchstaben sind ungleich haeufig. Die Haeufigkeiten im
 * Englischen nach Lewand, Cryptological Mathematics (2000), in Prozent. */
const HAEUFIGKEIT = [["e", 12.7], ["t", 9.06], ["a", 8.17], ["o", 7.51], ["i", 6.97], ["n", 6.75], ["s", 6.33], ["h", 6.09],
  ["r", 5.99], ["d", 4.25], ["l", 4.03], ["c", 2.78], ["u", 2.76], ["m", 2.41], ["w", 2.36], ["f", 2.23], ["g", 2.02],
  ["y", 1.97], ["p", 1.93], ["b", 1.29], ["v", 0.98], ["k", 0.77], ["j", 0.15], ["x", 0.15], ["q", 0.1], ["z", 0.07]];

window.drawFrequency = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 120, breite = 52, hmax = 360, y0 = 440;
  HAEUFIGKEIT.forEach(([b, p], i) => {
    const x = x0 + i * 60;
    const h = (p / 12.7) * hmax;
    const hell = i < 2 || i >= HAEUFIGKEIT.length - 2;      // e, t und q, z: die beiden Enden
    parts.push(`<rect x="${x}" y="${(y0 - h).toFixed(1)}" width="${breite}" height="${h.toFixed(1)}" rx="3" fill="${hell ? c.yellow : c.light}" fill-opacity="${hell ? 0.9 : 0.5}"/>`);
    parts.push(d.label(x + breite / 2, 0, b, { size: 32, mono: true, color: hell ? c.yellow : c.light, anchor: "middle", centerY: y0 + 30 }));
  });
  parts.push(d.label(x0, 0, "12.7 %", { size: 20, mono: true, color: c.yellow, centerY: y0 - hmax - 24 }));
  parts.push(d.label(x0 + 25 * 60 + breite, 0, "0.07 %", { size: 20, mono: true, color: c.yellow, anchor: "end", centerY: y0 - 30 }));
  parts.push(d.label(x0, 0, "how often each letter appears in english text. the e comes round 180 times as often as the z: alphabetic redundancy.",
                     { size: 20, color: c.gray, centerY: y0 + 90 }));
  return put("fig-frequency", d.svg(1680, 560, ...parts));
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
  // Morse ist nicht praefixfrei (e = ., i = .., s = ...) und braucht deshalb
  // die Pause als drittes Zeichen; genau das erspart sich Huffman.
  parts.push(d.label(lx, 0, "but it needs a pause after every letter: · · could be i, or e e", { size: 20, color: c.gray, centerY: 500 }));
  // rechts: die variable Laenge aus Code Systems
  const rx = 920;
  parts.push(verweis("code-systems", d.label(rx, 0, "code systems: variable length", { size: 20, color: c.blue, centerY: 80 })));
  parts.push(d.label(rx, 0, "codes may differ in length", { size: 48, color: c.white, centerY: 160 }));
  parts.push(d.label(rx, 0, "and still read without separators,", { size: 32, color: c.light, centerY: 230 }));
  parts.push(d.label(rx, 0, "as long as no code starts another", { size: 32, color: c.light, centerY: 285 }));
  parts.push(d.label(rx, 0, "what we left open: who gets the short codes, and why", { size: 20, color: c.gray, centerY: 400 }));
  return put("fig-seen-before", d.svg(1680, 530, ...parts));
};

/* --- Teil 2: two tricks, and a zip ----------------------------------------- */

/* Trick eins: Wiederholtes einmal sagen, danach nur noch zurueckzeigen.
 * Schritt 0: der Satz mit den drei Vorkommen. Schritt 1: das zweite und
 * dritte werden zu einem Platzhalter mit Pfeil zurueck, die Zeile wird
 * kuerzer. Schritt 2: der Platzhalter bekommt seine zwei Zahlen. */
window.drawPointBack = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 100, zw = 24;
  const parts = [];
  const tr = treffer();
  // Zeile 1: der Satz, alle Vorkommen markiert
  const y1 = 110;
  tr.forEach(([von, len]) => parts.push(d.highlight(x0 + von * zw, len * zw, y1, 32)));
  [...SATZ].forEach((z, i) => {
    const markiert = tr.some(([von, len]) => i >= von && i < von + len);
    parts.push(d.label(x0 + i * zw + zw / 2, 0, z === " " ? "" : z,
                       { size: 32, mono: true, color: markiert ? c.yellow : c.light, anchor: "middle", centerY: y1 }));
  });
  parts.push(d.label(x0, 0, `${SATZ.length} characters`, { size: 20, color: c.gray, centerY: y1 + 50 }));

  // Eine gepackte Zeile: das erste Vorkommen bleibt, die weiteren werden zu
  // einem Kasten; `inhalt(k)` sagt, was im Kasten steht (Pfeil oder Zahlen).
  const gepackt = (y, inhalt, breiteVon) => {
    const kaesten = [];
    let x = x0, i = 0, zeichen = 0;
    while (i < SATZ.length) {
      const k = tr.findIndex(([von]) => von === i);
      if (k > 0) {
        const text = inhalt(k), w = breiteVon(text);
        parts.push(`<rect x="${x}" y="${y - 26}" width="${w}" height="52" rx="6" fill="${c.yellow}" fill-opacity="0.18" stroke="${c.yellow}" stroke-width="2"/>`);
        parts.push(d.label(x + w / 2, 0, text, { size: text.length > 1 ? 20 : 32, mono: true, color: c.yellow, anchor: "middle", centerY: y }));
        kaesten.push(x + w / 2);
        x += w + 10;
        i += tr[k][1];
      } else {
        if (k === 0) parts.push(d.highlight(x, tr[0][1] * zw, y, 32));
        const ende = k === 0 ? i + tr[0][1] : i + 1;
        for (; i < ende; i++) {
          parts.push(d.label(x + zw / 2, 0, SATZ[i] === " " ? "" : SATZ[i], { size: 32, mono: true, color: k === 0 ? c.yellow : c.light, anchor: "middle", centerY: y }));
          x += zw;
          zeichen += 1;
        }
      }
    }
    return { kaesten, zeichen };
  };

  if (step >= 1) {
    const y2 = 300;
    const { kaesten } = gepackt(y2, () => "\u2190", () => 2 * zw);
    // Pfeile von den Platzhaltern zurueck auf das erste Vorkommen: unter der
    // Zeile entlang, schraeg von unten rechts am Kasten ankommend
    const tx = x0 + tr[0][0] * zw + tr[0][1] * zw * 0.7, ty = y2 + 24;
    kaesten.forEach((px, k) => {
      const tiefe = 56 + k * 36;
      parts.push(`<path d="M${px},${y2 + 24} C${px},${y2 + 24 + tiefe} ${tx + 80},${y2 + 24 + tiefe} ${tx + 22},${ty + 22}" fill="none" stroke="${c.yellow}" stroke-width="3"/>`);
      parts.push(d.arrow(tx + 22, ty + 22, tx, ty, { color: c.yellow, width: 3 }));
    });
  }
  if (step >= 2) {
    const y3 = 500;
    const { zeichen } = gepackt(y3, (k) => `(${tr[k][0] - tr[k - 1][0]} back, ${tr[k][1]} long)`, (t) => t.length * 12.5 + 16);
    parts.push(d.label(x0, 0, `${zeichen} characters and ${tr.length - 1} pointers. a pointer costs about as much as two characters.`,
                       { size: 20, color: c.gray, centerY: y3 + 50 }));
  }
  return put("fig-point-back", d.svg(1680, 580, ...parts));
};

/* Wie die gepackte Datei aussieht: zwei Hex-Ansichten, roh und gepackt.
 * Ein Verweis ist hier drei Byte: die Marke ff, Abstand, Laenge. */
window.drawInFile = function () {
  const c = d.colors();
  const parts = [];
  const hex = (n) => n.toString(16).padStart(2, "0");
  const roh = [...SATZ].map((z) => ({ hex: hex(z.charCodeAt(0)), z, ptr: false }));
  const gepackt = [];
  let i = 0;
  const tr = treffer();
  while (i < SATZ.length) {
    const t = tr.find(([von]) => von === i);
    if (t && t[0] > 0) {
      const zurueck = i - tr[tr.findIndex(([von]) => von === i) - 1][0];
      gepackt.push({ hex: "ff", z: "", ptr: true }, { hex: hex(zurueck), z: "", ptr: true }, { hex: hex(t[1]), z: "", ptr: true });
      i += t[1];
    } else {
      gepackt.push({ hex: hex(SATZ.charCodeAt(i)), z: SATZ[i], ptr: false });
      i += 1;
    }
  }
  // Eine Hex-Ansicht: 16 Byte je Zeile, rechts die Zeichen wie im Hex-Editor
  const ansicht = (x, y, titel, bytes, farbe) => {
    parts.push(d.label(x, 0, titel, { size: 20, color: c.gray, centerY: y }));
    parts.push(d.label(x + 1200, 0, `${bytes.length} bytes`, { size: 32, mono: true, color: farbe, anchor: "end", centerY: y }));
    for (let r = 0; r * 16 < bytes.length; r++) {
      const zeile = bytes.slice(r * 16, r * 16 + 16);
      const yy = y + 60 + r * 44;
      zeile.forEach((b, k) => {
        parts.push(d.label(x + k * 44, 0, b.hex, { size: 20, mono: true, color: b.ptr ? c.yellow : c.light, centerY: yy }));
      });
      const text = zeile.map((b) => (b.ptr ? "\u00b7" : b.z === " " ? "\u00b7" : b.z)).join("");
      parts.push(d.label(x + 16 * 44 + 30, 0, text, { size: 20, mono: true, color: c.gray, centerY: yy }));
    }
  };
  ansicht(100, 50, "raw: one byte per character", roh, c.light);
  ansicht(100, 330, "packed: pointers in yellow", gepackt, c.yellow);
  parts.push(d.label(100, 0, "ff 13 07 = marker, 19 back, 7 long   \u00b7   ff 12 07 = marker, 18 back, 7 long",
                     { size: 20, color: c.yellow, centerY: 550 }));
  return put("fig-in-file", d.svg(1680, 580, ...parts));
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
  // die Haeufigkeiten als Balken, wie bei den englischen Buchstaben in Teil 1
  const basis = 440, hmax = 170, bw = 60;
  HAEUFIG.forEach(([b, n], i) => {
    const bx = x0 + i * 120;
    const h = (n / 5) * hmax;
    const hell = b === "a";
    parts.push(`<rect x="${bx}" y="${basis - h}" width="${bw}" height="${h}" rx="3" fill="${hell ? c.yellow : c.light}" fill-opacity="${hell ? 0.9 : 0.5}"/>`);
    parts.push(d.label(bx + bw / 2, 0, String(n), { size: 20, mono: true, color: hell ? c.yellow : c.light, anchor: "middle", centerY: basis - h - 20 }));
    parts.push(d.label(bx + bw / 2, 0, b, { size: 48, mono: true, color: hell ? c.yellow : c.white, anchor: "middle", centerY: basis + 36 }));
  });
  const rx = 1000;
  parts.push(d.label(rx, 0, "fixed length, as in", { size: 20, color: c.gray, centerY: 260 }));
  parts.push(verweis("code-systems", d.label(rx + 162, 0, "code systems:", { size: 20, color: c.blue, centerY: 260 })));
  parts.push(d.formula(rx, 0, "5 letters -> 3 bits each", { size: 32, color: c.light, centerY: 320 }));
  parts.push(d.formula(rx, 0, "11 * 3 = 33 bit", { size: 48, color: c.white, centerY: 400 }));
  return put("fig-count-first", d.svg(1680, 512, ...parts));
};

/* Der Huffman-Baum fuer abracadabra. Knoten mit festen Plaetzen; `step` sagt,
 * wie viele Zusammenfassungen schon passiert sind (0 bis 4). Mit `codes`
 * bekommen die Kanten ihre 0 und 1. Dieselbe Zeichnung dient dem Aufbau und
 * dem Ablesen, damit zwischen den beiden Folien nichts springt. */
function baum(step, codes) {
  const c = d.colors();
  const wires = [], nodes = [], labels = [];
  // Blaetter: Buchstabe und Haeufigkeit; innere Knoten: Summe
  const blatt = { a: [320, 300], b: [580, 580], r: [740, 580], c: [920, 580], d: [1080, 580] };
  const innen = {
    cd: { xy: [1000, 440], n: 2, kinder: ["c", "d"], ab: 1 },
    br: { xy: [660, 440], n: 4, kinder: ["b", "r"], ab: 2 },
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
        // die 0 oder 1 sitzt neben der Kante, nicht auf ihr: 40 px zur Seite
        labels.push(d.label((x1 + x2) / 2 + (idx === 0 ? -40 : 40), 0, String(idx),
                            { size: 32, mono: true, color: c.yellow, anchor: "middle", centerY: (y1 + y2) / 2 - 4 }));
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
  // das Rezept, drei Zeilen, immer sichtbar; darunter die Summen Schritt fuer Schritt
  parts.push(d.label(rx, 0, "the recipe", { size: 20, color: c.gray, centerY: 70 }));
  ["1  count every letter", "2  join the two rarest into one node, count = sum", "3  repeat until one node is left"].forEach((z, i) => {
    parts.push(d.label(rx, 0, z, { size: 20, color: c.white, centerY: 110 + i * 34 }));
  });
  const zeilen = ["c 1 + d 1 = 2", "b 2 + r 2 = 4", "2 + 4 = 6", "a 5 + 6 = 11"];
  zeilen.forEach((z, i) => {
    const s = i + 1;
    const farbe = s === step ? c.yellow : s < step ? c.light : c.dark;
    parts.push(d.label(rx, 0, z, { size: 32, mono: true, color: farbe, centerY: 280 + i * 64 }));
  });
  parts.push(d.label(rx, 0, step >= 4 ? "11: the root counts the whole word" : "",
                     { size: 20, color: c.gray, centerY: 560 }));
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
  // Das Gegenbeispiel (a = 0, b = 01) steht nicht mehr auf der Folie: Die
  // Punchline nennt die Falle, erklaert wird sie muendlich (14.09.2026).
  return put("fig-reads-itself", d.svg(1680, 360, ...parts));
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

/* --- Teil 3: when redundancy runs out -------------------------------------- */

/* Was PNG vor dem Packen tut: jeden Punkt aus dem linken Nachbarn vorhersagen
 * und nur die Abweichung speichern. Zwei echte Zeilen aus den Dateien: der
 * Rotkanal von zwoelf Punkten aus parrot.png und aus noise.png, jeweils Zeile
 * 150 ab Spalte 150 (gelesen am 14.09.2026). */
const ZEILE_PAPAGEI = [251, 250, 249, 249, 251, 251, 251, 250, 249, 249, 248, 249];
const ZEILE_RAUSCHEN = [208, 213, 184, 203, 181, 229, 178, 181, 102, 159, 225, 101];

window.drawPngFilter = function () {
  const c = d.colors();
  const parts = [];
  const x0 = 380, zw = 100;
  const block = (y, titel, werte) => {
    const diff = werte.map((v, i) => (i === 0 ? v : v - werte[i - 1]));
    parts.push(d.label(120, 0, titel, { size: 20, color: c.gray, centerY: y }));
    parts.push(d.label(x0 - 40, 0, "red values", { size: 20, color: c.gray, anchor: "end", centerY: y + 60 }));
    parts.push(d.label(x0 - 40, 0, "minus left neighbour", { size: 20, color: c.gray, anchor: "end", centerY: y + 130 }));
    werte.forEach((v, i) => {
      parts.push(d.label(x0 + i * zw + zw / 2, 0, String(v), { size: 32, mono: true, color: c.light, anchor: "middle", centerY: y + 60 }));
      const dv = diff[i];
      const text = i === 0 ? String(dv) : (dv > 0 ? "+" + dv : String(dv));
      const klein = i > 0 && Math.abs(dv) <= 2;
      parts.push(d.label(x0 + i * zw + zw / 2, 0, text, { size: 32, mono: true, color: i === 0 ? c.light : klein ? c.yellow : c.red, anchor: "middle", centerY: y + 130 }));
    });
  };
  block(60, "twelve points from the parrot, one row", ZEILE_PAPAGEI);
  parts.push(d.label(x0, 0, "small numbers, mostly the same few: contextual redundancy between neighbouring points, air for both tricks", { size: 20, color: c.yellow, centerY: 250 }));
  block(330, "twelve points from the noise, the same row", ZEILE_RAUSCHEN);
  parts.push(d.label(x0, 0, "the differences are as random as the values: nothing gained", { size: 20, color: c.red, centerY: 520 }));
  return put("fig-png-filter", d.svg(1680, 560, ...parts));
};


/* Der Papagei in Bytes: roh, verlustfrei gepackt (PNG), verlustbehaftet (JPG),
 * und was das bei 10 bit/s an Zeit heisst. Links das Bild selbst, damit klar
 * ist, worum es geht; figures.py laesst es weg (mitBild = false), weil die
 * Seite den Papagei daneben ohnehin zeigt. */
window.drawParrotHonest = function (_slide, _step, mitBild = true) {
  const c = d.colors();
  const parts = [];
  if (mitBild) parts.push(`<image href="img/parrot.png" x="100" y="70" width="360" height="360"/>`);
  const x0 = mitBild ? 760 : 420, breite = 560, h = 70, max = 196608;
  const zeile = (i, name, bytes, zeit, farbe) => {
    const y = 70 + i * 130;
    parts.push(d.label(x0 - 40, 0, name, { size: 32, color: c.gray, anchor: "end", centerY: y + h / 2 }));
    const w = Math.max(6, (bytes / max) * breite);
    parts.push(`<rect x="${x0}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="4" fill="${farbe}" fill-opacity="0.85"/>`);
    parts.push(d.label(x0 + breite + 40, 0, bytes.toLocaleString("en").replace(/,/g, " ") + " bytes",
                       { size: 32, mono: true, color: farbe, centerY: y + h / 2 }));
    parts.push(d.label(x0 + breite + 40, 0, `${zeit} at 10 bit/s`, { size: 20, color: c.gray, centerY: y + h + 26 }));
  };
  zeile(0, "raw", 196608, "44 hours", c.light);
  zeile(1, "png, lossless", 93107, "21 hours", c.light);
  zeile(2, "jpg, lossy", 10587, "2.4 hours", c.yellow);
  // Unter dem Bild, rechtsbuendig an dessen Kante; ohne Bild (Website) linksbuendig am Balkenanfang
  parts.push(d.label(mitBild ? x0 - 40 : x0, 0, "the same 256 × 256 points, three ways of writing them down", { size: 20, color: c.gray, anchor: mitBild ? "end" : "start", centerY: 470 }));
  return put("fig-parrot-honest", d.svg(1680, 500, ...parts));
};

/* Was JPG weglaesst, Schritt fuer Schritt: derselbe 8x8-Block aus dem Schnabel
 * (Helligkeit, Spalte 72 bis 79, Zeile 120 bis 127 von parrot.png), aufgebaut
 * aus seinen Kacheln, die staerkste zuerst. Je Schritt: die Kachel, ihre
 * Menge, die Summe bis hierher. Gerechnet am 14.09.2026. */
const BLOCK_ROH = [[0, 1, 14, 80, 130, 96, 57, 69], [103, 123, 139, 120, 71, 92, 90, 78], [66, 77, 90, 84, 100, 166, 140, 92],
  [22, 33, 43, 63, 77, 155, 145, 68], [26, 27, 27, 32, 53, 101, 119, 88], [25, 23, 22, 23, 26, 50, 75, 94],
  [25, 21, 19, 20, 17, 17, 37, 48], [21, 19, 18, 19, 20, 20, 17, 18]];
const AUFBAU = [
  { n: 1, u: 0, v: 0, amount: -543, sum: [[60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60], [60, 60, 60, 60, 60, 60, 60, 60]] },
  { n: 2, u: 0, v: 1, amount: 193, sum: [[94, 94, 94, 94, 94, 94, 94, 94], [88, 88, 88, 88, 88, 88, 88, 88], [79, 79, 79, 79, 79, 79, 79, 79], [67, 67, 67, 67, 67, 67, 67, 67], [54, 54, 54, 54, 54, 54, 54, 54], [41, 41, 41, 41, 41, 41, 41, 41], [32, 32, 32, 32, 32, 32, 32, 32], [27, 27, 27, 27, 27, 27, 27, 27]] },
  { n: 3, u: 1, v: 0, amount: -132, sum: [[71, 74, 81, 89, 98, 107, 113, 117], [66, 69, 75, 84, 93, 101, 108, 111], [56, 60, 66, 75, 84, 92, 99, 102], [44, 47, 54, 62, 71, 80, 86, 90], [31, 34, 41, 49, 58, 67, 73, 76], [18, 22, 28, 37, 46, 54, 61, 64], [9, 12, 19, 27, 36, 45, 51, 55], [4, 7, 14, 22, 31, 40, 46, 50]] },
  { n: 4, u: 0, v: 2, amount: -87, sum: [[56, 60, 66, 75, 84, 92, 99, 102], [60, 63, 70, 78, 87, 96, 102, 106], [62, 66, 72, 80, 90, 98, 104, 108], [58, 62, 68, 77, 86, 94, 101, 104], [45, 48, 55, 63, 72, 81, 87, 91], [24, 28, 34, 43, 52, 60, 67, 70], [3, 7, 13, 21, 31, 39, 45, 49], [0, 0, 0, 8, 17, 26, 32, 35]] },
  { n: 5, u: 1, v: 2, amount: 80, sum: [[74, 75, 77, 78, 80, 82, 83, 84], [67, 69, 74, 79, 86, 91, 96, 98], [55, 59, 68, 79, 91, 102, 111, 115], [40, 46, 58, 73, 89, 104, 116, 122], [27, 33, 45, 60, 76, 91, 103, 109], [17, 21, 30, 41, 53, 64, 73, 78], [10, 13, 17, 23, 29, 35, 39, 41], [8, 8, 10, 12, 13, 15, 17, 17]] },
  { n: 6, u: 0, v: 3, amount: -74, sum: [[64, 64, 66, 68, 69, 71, 73, 73], [70, 72, 76, 82, 88, 94, 98, 101], [67, 72, 80, 92, 104, 115, 124, 128], [47, 54, 65, 80, 96, 112, 123, 129], [20, 26, 37, 52, 69, 84, 95, 102], [4, 9, 17, 28, 40, 52, 60, 65], [8, 10, 15, 20, 27, 32, 37, 39], [18, 19, 21, 22, 24, 26, 27, 28]] },
  { n: 15, u: 0, v: 5, amount: -41, sum: [[36, 8, 23, 79, 99, 70, 59, 80], [103, 111, 122, 124, 107, 84, 73, 75], [43, 86, 109, 98, 103, 132, 140, 123], [4, 36, 49, 47, 79, 131, 139, 110], [28, 34, 35, 39, 62, 90, 97, 86], [23, 21, 27, 38, 40, 44, 65, 91], [29, 19, 16, 19, 14, 10, 29, 57], [32, 11, 0, 0, 13, 25, 35, 44]] },
  { n: 64, u: 7, v: 5, amount: 1, sum: BLOCK_ROH },
];

/* Eine Kachel (u Wellen waagerecht, v senkrecht) als Bild, Zellgroesse px. */
function kachel(x0, y0, u, v, px) {
  const teile = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const w = Math.cos((2 * x + 1) * u * Math.PI / 16) * Math.cos((2 * y + 1) * v * Math.PI / 16);
      const g = Math.round(128 + 110 * w).toString(16).padStart(2, "0");
      teile.push(`<rect x="${x0 + x * px}" y="${y0 + y * px}" width="${px}" height="${px}" fill="#${g}${g}${g}"/>`);
    }
  }
  return teile.join("");
}

/* Ein Block als Bild: das Grau ist die echte Helligkeit, keine Palettenfarbe. */
function blockBild(x0, y0, block, px) {
  return block.map((zeile, j) => zeile.map((v, i) => {
    const g = v.toString(16).padStart(2, "0");
    return `<rect x="${x0 + i * px}" y="${y0 + j * px}" width="${px}" height="${px}" fill="#${g}${g}${g}"/>`;
  }).join("")).join("");
}

/* Was die Sinne nicht erfassen: zwei Spalten, Auge und Ohr, je drei Dinge, die
 * ein verlustbehaftetes Verfahren deshalb weglassen darf. Keine Technik, nur
 * die Idee (JPG und MP3 im Einzelnen sind fuer diesen Kurs zu viel). */
// Pfade woertlich, damit sync_decks.py die Bilder findet und mitkopiert
const FOTOS = { eye: "img/eye.png", ear: "img/ear.png" };

window.drawSenses = function (_slide, _step, mitBild = true) {
  const c = d.colors();
  const parts = [];
  // Symbolfoto links vom Titel (KI-erzeugt, Fussnote auf der Folie); figures.py
  // laesst es weg (mitBild = false), die Seite kommt ohne aus.
  const spalte = (x, bild, titel, zeilen, format) => {
    if (mitBild) parts.push(`<image href="${FOTOS[bild]}" x="${x}" y="20" width="170" height="170"/>`);
    parts.push(d.label(x + (mitBild ? 200 : 0), 0, titel, { size: 48, color: c.white, centerY: 105 }));
    zeilen.forEach(([was, warum], i) => {
      parts.push(d.label(x, 0, was, { size: 32, color: c.light, centerY: 250 + i * 100 }));
      parts.push(d.label(x, 0, warum, { size: 20, color: c.gray, centerY: 250 + i * 100 + 40 }));
    });
    parts.push(d.label(x, 0, format, { size: 20, color: c.yellow, centerY: 560 }));
  };
  spalte(120, "eye", "the eye misses", [
    ["fine differences in colour", "it sees edges in brightness sharply, edges in colour blurred"],
    ["small detail in a busy area", "feathers, grass, gravel: the texture is noticed, not the single point"],
    ["tiny steps in brightness", "250 and 251 look the same"],
  ], "jpg keeps what you would see and rounds the rest away");
  spalte(900, "ear", "the ear misses", [
    ["a quiet tone while a loud one plays", "at the same time and close in pitch: the loud one masks it"],
    ["very high frequencies", "above what the ear can hear at all"],
    ["a quiet sound just after a loud one", "in any pitch: the ear needs a moment to recover"],
  ], "mp3 keeps what you would hear and rounds the rest away");
  return put("fig-senses", d.svg(1680, 600, ...parts));
};

/* --- Start ---------------------------------------------------------------- */

if ($("fig-why-compress")) {
  window.drawIpo();
  window.drawWhyCompress();
  window.drawFrequency();
  window.drawSeenBefore();
  window.drawPointBack();
  window.drawInFile();
  window.drawRunGood();
  window.drawRunBad();
  window.drawCountFirst();
  window.drawTree();
  window.drawReadCodes();
  window.drawReadsItself();
  window.drawZip();
  window.drawCounting();
  window.drawPngFilter();
  window.drawParrotHonest();
  window.drawSenses();
}

window.deck15 = {
  ipo: window.drawIpo,
  whyCompress: window.drawWhyCompress,
  frequency: window.drawFrequency,
  seenBefore: window.drawSeenBefore,
  pointBack: window.drawPointBack,
  inFile: window.drawInFile,
  runGood: window.drawRunGood,
  runBad: window.drawRunBad,
  countFirst: window.drawCountFirst,
  tree: window.drawTree,
  readCodes: window.drawReadCodes,
  readsItself: window.drawReadsItself,
  zip: window.drawZip,
  counting: window.drawCounting,
  pngFilter: window.drawPngFilter,
  parrotHonest: window.drawParrotHonest,
  senses: window.drawSenses,
};
