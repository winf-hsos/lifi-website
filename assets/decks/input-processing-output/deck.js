/* Zeichnungen für „solving problems with computers“.
 * Zeichenflächen: 1680 × 700, mit Punchline 1680 × 620.
 * Textgrößen ausschließlich 32 und 48; alle Werte aus dem Theme. */
"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const W = 1680, H = 700, HP = 620;

function card(x, y, w, h, text, o = {}) {
  const c = d.colors();
  return d.box(x, y, w, h, text, {
    size: 32, border: c.light, color: c.white, width: 3, rx: 10, ...o,
  });
}

function tick(x, y, col) {
  const c = d.colors();
  return `<path d="M${x - 22},${y} l17,18 l34,-42" fill="none" stroke="${col || c.green}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function cross(x, y, col) {
  const c = d.colors();
  return `<path d="M${x - 22},${y - 22} l44,44 M${x + 22},${y - 22} l-44,44" fill="none" stroke="${col || c.red}" stroke-width="7" stroke-linecap="round"/>`;
}

function ipoBase(opts = {}) {
  const c = d.colors();
  const x = opts.x ?? 600, y = opts.y ?? 220, w = opts.w ?? 480, h = opts.h ?? 220;
  const left = opts.left ?? 420, right = opts.right ?? 1260;
  const parts = [
    d.arrow(left, y + h / 2, x - 30, y + h / 2, { color: c.light, width: 4, head: 20 }),
    d.box(x, y, w, h, opts.inside || "", { border: opts.border || c.white, color: opts.color || c.white, size: opts.size || 48, mono: opts.mono, keepCase: opts.keepCase, width: 4, rx: 12 }),
    d.arrow(x + w + 30, y + h / 2, right, y + h / 2, { color: c.light, width: 4, head: 20 }),
  ];
  return { parts, x, y, w, h, left, right };
}

window.drawIpoReveal = function (slide, step) {
  const c = d.colors();
  const p = ipoBase({ inside: step >= 2 ? "processing" : "" });
  if (step >= 1) {
    p.parts.push(d.label(300, p.y + p.h / 2 + 16, "input", { size: 48, color: c.white, anchor: "middle" }));
    p.parts.push(d.label(1380, p.y + p.h / 2 + 16, "output", { size: 48, color: c.white, anchor: "middle" }));
  }
  if (step >= 3) {
    p.parts.push(d.label(W / 2, 570, "input  ·  processing  ·  output", { size: 32, color: c.gray, anchor: "middle" }));
    p.parts.push(d.label(W / 2, 650, "IPO", { size: 48, color: c.blue, anchor: "middle", mono: true, keepCase: true }));
  }
  const svg = d.svg(W, H, ...p.parts);
  if ($("fig-ipo-reveal")) $("fig-ipo-reveal").innerHTML = svg;
  return svg;
};

window.drawAddTest = function (slide, step) {
  const c = d.colors();
  const actual = step >= 3 ? "6" : step >= 2 ? "5" : "?";
  const p = ipoBase({ y: 165, h: 210, inside: "add()", mono: true });
  p.parts.push(d.label(300, 290, "2, 3", { size: 48, color: c.white, anchor: "middle", mono: true }));
  p.parts.push(d.label(1380, 290, actual, { size: 48, color: step >= 3 ? c.red : step >= 2 ? c.white : c.gray, anchor: "middle", mono: true }));
  p.parts.push(d.label(300, 455, "input", { size: 32, color: c.gray, anchor: "middle" }));
  p.parts.push(d.label(840, 455, "processing", { size: 32, color: c.gray, anchor: "middle" }));
  p.parts.push(d.label(1380, 455, "actual output", { size: 32, color: c.gray, anchor: "middle" }));
  if (step >= 1) p.parts.push(d.label(1380, 95, "expected: 5", { size: 32, color: c.yellow, anchor: "middle", mono: true }));
  if (step >= 2) {
    const pass = step < 3;
    p.parts.push(pass ? tick(1515, 270) : cross(1515, 270));
    p.parts.push(d.label(1570, 286, pass ? "pass" : "fail", { size: 32, color: pass ? c.green : c.red, mono: true }));
  }
  const svg = d.svg(W, HP, ...p.parts);
  if ($("fig-add-test")) $("fig-add-test").innerHTML = svg;
  return svg;
};

function colourSequence(x, y, radius = 34) {
  const c = d.colors();
  const colors = [c.red, c.blue, c.green, c.blue, c.red];
  return colors.map((col, i) => `<circle cx="${x + i * (radius * 2 + 22)}" cy="${y}" r="${radius}" fill="${col}" opacity="0.9"/>`).join("");
}

function drawSender() {
  const c = d.colors();
  const p = ipoBase({ inside: "encode()", mono: true, right: 1180 });
  p.parts.push(d.label(300, 350, '"hi"', { size: 48, color: c.white, anchor: "middle", mono: true }));
  p.parts.push(colourSequence(1240, 350, 28));
  p.parts.push(d.label(300, 520, "text", { size: 32, color: c.gray, anchor: "middle" }));
  p.parts.push(d.label(840, 520, "program", { size: 32, color: c.gray, anchor: "middle" }));
  p.parts.push(d.label(1380, 520, "colours", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(W, H, ...p.parts);
  if ($("fig-sender")) $("fig-sender").innerHTML = svg;
  return svg;
}

window.drawReceiver = function (slide, step) {
  const c = d.colors();
  const p = ipoBase({ inside: "classify()", mono: true, y: 165, h: 210 });
  p.parts.push(`<circle cx="300" cy="270" r="76" fill="${c.red}" opacity="0.9"/>`);
  p.parts.push(d.label(300, 430, step >= 1 ? "r=203  g=41" : "red?", { size: 32, color: step >= 1 ? c.white : c.gray, anchor: "middle", mono: step >= 1 }));
  if (step >= 1) p.parts.push(d.label(300, 475, "b=57  c=310", { size: 32, color: c.white, anchor: "middle", mono: true }));
  p.parts.push(d.label(1380, 286, '"red"', { size: 48, color: c.white, anchor: "middle", mono: true }));
  p.parts.push(d.label(840, 465, "a decision rule", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(W, HP, ...p.parts);
  if ($("fig-receiver")) $("fig-receiver").innerHTML = svg;
  return svg;
};

window.drawChain = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const y = 250, bh = 150;
  parts.push(d.label(80, y + 92, '"hi"', { size: 48, color: c.white, mono: true }));
  parts.push(d.arrow(200, y + 75, 285, y + 75, { color: step >= 2 ? c.yellow : c.light, width: 4, head: 18 }));
  parts.push(card(300, y, 270, bh, "encode()", { mono: true }));
  parts.push(d.arrow(585, y + 75, 680, y + 75, { color: step >= 2 ? c.yellow : c.light, width: 4, head: 18 }));
  parts.push(colourSequence(720, y + 75, 23));
  if (step >= 1) {
    parts.push(d.arrow(1050, y + 75, 1125, y + 75, { color: step >= 2 ? c.yellow : c.light, width: 4, head: 18 }));
    parts.push(card(1140, y, 270, bh, "decode()", { mono: true }));
    parts.push(d.arrow(1425, y + 75, 1500, y + 75, { color: step >= 2 ? c.yellow : c.light, width: 4, head: 18 }));
    parts.push(d.label(1530, y + 92, '"hi"', { size: 48, color: c.white, mono: true }));
  }
  parts.push(d.label(435, 485, "sender", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.label(875, 485, "light", { size: 32, color: c.gray, anchor: "middle" }));
  if (step >= 1) parts.push(d.label(1275, 485, "receiver", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(W, H, ...parts);
  if ($("fig-chain")) $("fig-chain").innerHTML = svg;
  return svg;
};

window.drawNestedSender = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const ox = 280, oy = 105, ow = 1120, oh = 390;
  parts.push(d.arrow(80, 300, ox - 25, 300, { color: c.light, width: 4, head: 20 }));
  parts.push(d.arrow(ox + ow + 25, 300, 1600, 300, { color: c.light, width: 4, head: 20 }));
  parts.push(d.box(ox, oy, ow, oh, "", { border: c.white, width: 4, rx: 14 }));
  parts.push(d.label(145, 280, "message", { size: 32, color: c.white, anchor: "middle" }));
  parts.push(d.label(1535, 280, "light", { size: 32, color: c.white, anchor: "middle" }));
  if (step === 0) {
    parts.push(d.label(W / 2, 320, "send()", { size: 48, color: c.white, anchor: "middle", mono: true }));
  } else {
    const xs = [350, 700, 1050];
    const names = ["encode()", "choose symbol", "drive LED"];
    xs.forEach((x, i) => parts.push(card(x, 220, 280, 160, names[i], { mono: i !== 1, keepCase: i === 2 })));
    parts.push(d.arrow(630, 300, 685, 300, { color: c.light, width: 3, head: 16 }));
    parts.push(d.arrow(980, 300, 1035, 300, { color: c.light, width: 3, head: 16 }));
    if (step >= 2) {
      ["text → symbols", "symbols → colour", "colour → voltage"].forEach((t, i) => {
        parts.push(d.label(xs[i] + 140, 445, t, { size: 32, color: c.gray, anchor: "middle", mono: i === 0 }));
      });
    }
  }
  const svg = d.svg(W, HP, ...parts);
  if ($("fig-nested-sender")) $("fig-nested-sender").innerHTML = svg;
  return svg;
};

function ipoRow(y, level, input, processing, output, active = true) {
  const c = d.colors();
  const col = active ? c.light : c.dark;
  const parts = [];
  parts.push(d.label(60, y + 76, level, { size: 32, color: active ? c.gray : c.dark }));
  parts.push(d.label(300, y + 76, input, { size: 32, color: col, anchor: "middle", mono: /[()01]/.test(input) }));
  parts.push(d.arrow(440, y + 65, 565, y + 65, { color: col, width: 3, head: 16 }));
  parts.push(d.box(580, y, 500, 130, processing, { border: col, color: col, size: 32, mono: /[()]/.test(processing), keepCase: processing === "AND", width: 3, rx: 10 }));
  parts.push(d.arrow(1095, y + 65, 1220, y + 65, { color: col, width: 3, head: 16 }));
  parts.push(d.label(1380, y + 76, output, { size: 32, color: col, anchor: "middle", mono: /[()01]/.test(output) }));
  return parts;
}

window.drawLevels = function (slide, step) {
  const parts = [];
  parts.push(...ipoRow(35, "system", "message", "sender", "light"));
  if (step >= 1) parts.push(...ipoRow(275, "function", "text", "encode()", "symbols"));
  if (step >= 2) parts.push(...ipoRow(515, "gate", "1, 1", "AND", "1"));
  const svg = d.svg(W, H, ...parts);
  if ($("fig-levels")) $("fig-levels").innerHTML = svg;
  return svg;
};

function drawRelations() {
  const c = d.colors();
  const parts = [];
  parts.push(d.label(390, 70, "boxes in a row", { size: 48, color: c.white, anchor: "middle" }));
  parts.push(d.label(390, 130, "where do the data go next?", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(card(90, 285, 240, 150, "a"));
  parts.push(d.arrow(345, 360, 435, 360, { color: c.light, width: 4, head: 18 }));
  parts.push(card(450, 285, 240, 150, "b"));
  parts.push(d.label(390, 550, "data flow", { size: 32, color: c.blue, anchor: "middle" }));

  parts.push(d.line(820, 40, 820, 640, { color: c.dark, width: 2 }));
  parts.push(d.label(1240, 70, "boxes inside boxes", { size: 48, color: c.white, anchor: "middle" }));
  parts.push(d.label(1240, 130, "what smaller work happens inside?", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.box(930, 220, 620, 300, "", { border: c.light, width: 4, rx: 12 }));
  parts.push(card(990, 300, 220, 140, "a"));
  parts.push(card(1270, 300, 220, 140, "b"));
  parts.push(d.label(1240, 590, "hierarchy", { size: 32, color: c.blue, anchor: "middle" }));
  const svg = d.svg(W, H, ...parts);
  if ($("fig-relations")) $("fig-relations").innerHTML = svg;
  return svg;
}

window.drawTwoQuestions = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const p = ipoBase({ y: 235, h: 180, inside: "processing" });
  p.parts.push(d.label(300, 345, "input", { size: 48, color: c.white, anchor: "middle" }));
  p.parts.push(d.label(1380, 345, "output", { size: 48, color: c.white, anchor: "middle" }));
  parts.push(...p.parts);
  if (step >= 1) {
    parts.push(d.arrow(840, 220, 840, 125, { color: c.light, width: 3, head: 16 }));
    parts.push(d.label(840, 75, "how does the box do its work?", { size: 32, color: c.white, anchor: "middle" }));
  }
  if (step >= 2) {
    parts.push(d.arrow(300, 430, 300, 535, { color: c.light, width: 3, head: 16 }));
    parts.push(d.arrow(1380, 430, 1380, 535, { color: c.light, width: 3, head: 16 }));
    parts.push(d.label(840, 600, "how are things written so a machine can work with them?", { size: 32, color: c.white, anchor: "middle" }));
  }
  if (step >= 3) {
    parts.push(d.label(1215, 75, "program", { size: 32, color: c.yellow, anchor: "middle", mono: true }));
    parts.push(d.label(840, 670, "representation", { size: 32, color: c.yellow, anchor: "middle", mono: true }));
  }
  const svg = d.svg(W, H, ...parts);
  if ($("fig-two-questions")) $("fig-two-questions").innerHTML = svg;
  return svg;
};

function drawRoadmap() {
  const c = d.colors();
  const parts = [];
  parts.push(d.label(500, 70, "representation", { size: 48, color: c.white, anchor: "middle" }));
  parts.push(d.label(1250, 70, "processing", { size: 48, color: c.white, anchor: "middle" }));
  const rep = ["measurement", "symbols & information", "code systems", "number systems"];
  rep.forEach((t, i) => parts.push(card(210, 150 + i * 125, 580, 92, t, { border: c.dark, color: c.light })));
  parts.push(d.arrow(825, 335, 980, 335, { color: c.light, width: 4, head: 18 }));
  parts.push(card(1000, 245, 500, 180, "algorithms &\nprograms", { border: c.blue, color: c.white, size: 48 }));
  parts.push(d.label(1250, 500, "next", { size: 32, color: c.yellow, anchor: "middle" }));
  parts.push(d.label(840, 665, "the box stays. the question moves.", { size: 32, color: c.gray, anchor: "middle" }));
  const svg = d.svg(W, H, ...parts);
  if ($("fig-roadmap")) $("fig-roadmap").innerHTML = svg;
  return svg;
}

window.drawAgent = function (slide, step) {
  const c = d.colors();
  const parts = [];
  const axis = 275;
  parts.push(d.arrow(300, axis, 440, axis, { color: c.light, width: 4, head: 20 }));
  parts.push(d.box(470, 135, 740, 280, "AI agent", { border: c.gray, color: c.white, size: 48, mono: true, keepCase: true, dashed: true, width: 4, rx: 12 }));
  parts.push(d.arrow(1240, axis, 1380, axis, { color: c.light, width: 4, head: 20 }));
  parts.push(d.label(250, axis + 11, "your task", { size: 32, color: c.white, anchor: "end" }));
  parts.push(d.label(1430, axis + 11, "code", { size: 32, color: c.white, mono: true }));
  if (step >= 1) parts.push(d.label(260, 465, "clear example", { size: 32, color: c.yellow, anchor: "middle" }));
  if (step >= 2) parts.push(d.label(1410, 465, "expected result", { size: 32, color: c.yellow, anchor: "middle" }));
  if (step >= 3) {
    parts.push(tick(1315, 535));
    parts.push(d.label(1370, 547, "compare", { size: 32, color: c.green, mono: true }));
  }
  const svg = d.svg(W, HP, ...parts);
  if ($("fig-agent")) $("fig-agent").innerHTML = svg;
  return svg;
};

// Statische Zeichnungen. Die Hook-Funktionen werden von stagekit beim Anzeigen aufgerufen.
if ($("fig-sender")) {
  drawSender();
  drawRelations();
  drawRoadmap();
}

window.deck03 = { drawIpoReveal, drawAddTest, drawReceiver, drawChain, drawNestedSender, drawLevels, drawTwoQuestions, drawAgent, drawSender, drawRelations, drawRoadmap };
