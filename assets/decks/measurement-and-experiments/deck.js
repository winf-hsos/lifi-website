"use strict";

const d = window.draw;
const $ = (id) => document.getElementById(id);
const put = (id, svg) => { const el = $(id); if (el) el.innerHTML = svg; return svg; };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function rect(x, y, w, h, fill, rx = 0, stroke = "none", sw = 0, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function circle(x, y, r, fill, stroke = "none", sw = 0) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function check(x, y, color) {
  return `<path d="M${x},${y} l18,20 l38,-48" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

window.drawAuthorities = function (_slide, step = 0) {
  const c = d.colors();
  const xs = [50, 610, 1170];
  const titles = ["it sounds right", "the assistant predicts it", "the series shows it"];
  const bodies = [
    "longer readings\ncollect more light",
    "double the\nintegration time",
    "41 / 50  →  47 / 50\nrecognised correctly",
  ];
  const visible = Math.min(2, step);
  const parts = [];
  for (let i = 0; i <= visible; i += 1) {
    const border = i === 2 ? c.green : c.dark;
    parts.push(d.label(xs[i], 125, titles[i], { size: 32, color: c.gray }));
    parts.push(d.box(xs[i], 165, 460, 300, bodies[i], {
      size: 32, color: i === 2 ? c.white : c.light, border, mono: i > 0,
    }));
    if (i === 2) {
      parts.push(check(xs[i] + 382, 245, c.green));
      parts.push(d.label(xs[i] + 230, 535, "evidence from your setup", { size: 32, color: c.green, anchor: "middle" }));
    }
  }
  return put("fig-authorities", d.svg(1680, 640, ...parts));
};

window.drawExperimentLoop = function (_slide, step = 0) {
  const c = d.colors();
  const xs = [35, 455, 875, 1295];
  const names = ["question", "prediction", "measurement", "decision"];
  const bodies = [
    "does a longer window\nimprove recognition?",
    "recognition should\nimprove",
    "41  44  45  47  46\ncorrect out of 50",
    "supported\nor refuted",
  ];
  const sizes = [32, 32, 20, 32];
  const monos = [false, false, true, false];
  const visible = Math.min(3, step);
  const wires = [];
  for (let i = 0; i < visible; i += 1) {
    wires.push(d.arrow(xs[i] + 330, 305, xs[i + 1], 305, { color: c.gray, width: 3 }));
  }
  const boxes = [];
  const labels = [];
  for (let i = 0; i <= visible; i += 1) {
    labels.push(d.label(xs[i] + 165, 120, names[i], { size: 32, color: c.gray, anchor: "middle" }));
    boxes.push(d.box(xs[i], 190, 330, 230, bodies[i], {
      size: sizes[i], color: i === visible ? c.white : c.light,
      border: i === visible ? c.white : c.dark, mono: monos[i],
    }));
  }
  return put("fig-experiment-loop", d.svg(1680, 620, ...d.layers(wires, boxes, labels)));
};

function drawIpoMap() {
  const c = d.colors();
  const axis = 300;
  const wires = [
    d.arrow(315, axis, 585, axis, { color: c.blue, width: 5 }),
    d.arrow(1095, axis, 1365, axis, { color: c.gray, width: 3 }),
  ];
  const boxes = [d.box(585, 165, 510, 270, "classify()", { size: 48, mono: true, border: c.light })];
  const labels = [
    d.label(265, axis + 11, "light", { size: 32, color: c.blue, anchor: "end" }),
    d.label(1415, axis + 11, '"red"', { size: 32, color: c.gray, mono: true }),
    d.label(450, 510, "today we live here", { size: 32, color: c.blue, anchor: "middle" }),
    d.line(450, 475, 450, 350, { color: c.blue, width: 3 }),
  ];
  return put("fig-ipo-map", d.svg(1680, 600, ...d.layers(wires, boxes, labels)));
}

window.drawSensor = function (_slide, step = 0) {
  const c = d.colors();
  const rows = [
    ["r", "203", 205],
    ["g", "41", 285],
    ["b", "57", 365],
    ["c", "310", 445],
  ];
  const count = step >= 1 ? 4 : 3;
  const wires = [];
  const labels = [];
  rows.slice(0, count).forEach(([name, value, y]) => {
    const color = name === "c" ? c.yellow : c.light;
    wires.push(d.arrow(615, y, 895, y, { color, width: name === "c" ? 4 : 2.5 }));
    labels.push(d.label(945, y + 11, `${name} = ${value}`, { size: 32, color, mono: true }));
  });
  const boxes = [d.box(235, 155, 380, 340, "sensor", { size: 48, border: c.light })];
  if (step >= 2) {
    labels.push(d.label(1210, 410, "clear", { size: 32, color: c.yellow, mono: true }));
    labels.push(d.label(1210, 460, "no colour filter", { size: 32, color: c.gray }));
    labels.push(d.label(1210, 510, "most sensitive", { size: 32, color: c.gray }));
  }
  return put("fig-sensor", d.svg(1680, 620, ...d.layers(wires, boxes, labels)));
};

function drawSentMeasured() {
  const c = d.colors();
  const parts = [
    d.label(365, 105, "what you send", { size: 32, color: c.gray, anchor: "middle" }),
    d.label(1245, 105, "what arrives", { size: 32, color: c.gray, anchor: "middle" }),
    d.box(80, 155, 570, 330, "r = 255\ng =   0\nb =   0", { size: 48, mono: true, border: c.dark, lineHeight: 1.35 }),
    d.box(950, 155, 590, 330, "r = 203\ng =  41\nb =  57\nc = 310", { size: 48, mono: true, border: c.light, lineHeight: 1.2 }),
    d.arrow(700, 320, 900, 320, { color: c.gray, width: 3 }),
    d.label(810, 565, "filters overlap · distance matters · the room measures with you", { size: 32, color: c.gray, anchor: "middle" }),
  ];
  return put("fig-sent-measured", d.svg(1680, 620, ...parts));
}

window.drawDark = function (_slide, step = 0) {
  const c = d.colors();
  const baseline = 515;
  const ambientY = 385;
  const parts = [
    d.line(180, baseline, 1470, baseline, { color: c.dark, width: 3 }),
    rect(330, ambientY, 260, baseline - ambientY, c.dark),
    d.line(210, ambientY, 1450, ambientY, { color: c.gray, width: 3, dashed: true }),
    d.label(460, 590, "LED off", { size: 32, color: c.gray, anchor: "middle", mono: true, keepCase: true }),
    d.label(1490, ambientY + 11, "ambient light", { size: 32, color: c.gray }),
  ];
  if (step >= 1) {
    parts.push(rect(900, 145, 260, baseline - 145, c.red));
    parts.push(d.label(1030, 590, "LED red", { size: 32, color: c.gray, anchor: "middle", mono: true, keepCase: true }));
  }
  if (step >= 2) {
    parts.push(d.line(1195, 155, 1195, ambientY - 10, { color: c.yellow, width: 4 }));
    parts.push(d.line(1178, 155, 1212, 155, { color: c.yellow, width: 4 }));
    parts.push(d.line(1178, ambientY - 10, 1212, ambientY - 10, { color: c.yellow, width: 4 }));
    parts.push(d.label(1245, 270, "what the LED adds", { size: 32, color: c.yellow, keepCase: true }));
  }
  if (step >= 3) {
    parts.push(d.label(840, 650, "reading = ambient + LED + noise", { size: 32, color: c.white, anchor: "middle", mono: true, keepCase: true }));
  }
  return put("fig-dark", d.svg(1680, 680, ...parts));
};

window.drawFiveReadings = function (_slide, step = 0) {
  const c = d.colors();
  const vals = [198, 205, 201, 195, 206];
  const parts = [];
  vals.forEach((v, i) => parts.push(d.label(260 + i * 290, 285, String(v), {
    size: 48, color: i === vals.length - 1 ? c.yellow : c.white, anchor: "middle", mono: true,
  })));
  if (step >= 1) {
    parts.push(d.label(840, 405, "same LED · same settings · five readings", { size: 32, color: c.gray, anchor: "middle", keepCase: true }));
  }
  if (step >= 2) {
    parts.push(d.label(840, 535, "all of them are measurements", { size: 48, color: c.white, anchor: "middle" }));
  }
  return put("fig-five-readings", d.svg(1680, 620, ...parts));
};

window.drawSpread = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 210, w = 1250;
  const top = [0.08, 0.19, 0.25, 0.37, 0.44, 0.52, 0.61, 0.73, 0.82, 0.94];
  const bottom = [0.39, 0.43, 0.46, 0.48, 0.50, 0.52, 0.55, 0.57, 0.60, 0.62];
  const parts = [
    d.label(x0, 100, "individual readings", { size: 32, color: c.gray }),
    d.label(x0, 395, "averages of five", { size: 32, color: c.gray }),
    d.line(x0, 250, x0 + w, 250, { color: c.dark, width: 3 }),
    d.line(x0, 530, x0 + w, 530, { color: c.dark, width: 3 }),
  ];
  top.forEach((p, i) => parts.push(circle(x0 + p * w, 250 + ((i % 3) - 1) * 22, 10, c.light)));
  bottom.forEach((p, i) => parts.push(circle(x0 + p * w, 530 + ((i % 3) - 1) * 22, 10, c.light)));
  if (step >= 1) {
    parts.push(d.arrow(x0 + top[0] * w, 330, x0 + top[top.length - 1] * w, 330, { color: c.gray, width: 3, head: 12 }));
    parts.push(d.arrow(x0 + top[top.length - 1] * w, 330, x0 + top[0] * w, 330, { color: c.gray, width: 3, head: 12 }));
    parts.push(d.label(x0 + top[0] * w + 10, 315, "spread", { size: 32, color: c.gray }));
  }
  if (step >= 2) {
    const meanX = x0 + 0.51 * w;
    parts.push(d.line(meanX, 170, meanX, 590, { color: c.blue, width: 5 }));
    parts.push(d.label(meanX + 28, 160, "mean", { size: 32, color: c.blue }));
  }
  return put("fig-spread", d.svg(1680, 650, ...parts));
};

window.drawIntegration = function (_slide, step = 0) {
  const c = d.colors();
  const rows = [
    { label: "few long readings", y: 80, points: [[0.12, 0], [0.38, 8], [0.64, -6], [0.88, 4]], out: [] },
    { label: "more, shorter readings", y: 285, points: [[0.08, 18], [0.18, -20], [0.29, 25], [0.41, -8], [0.53, 18], [0.65, -24], [0.77, 10], [0.90, -14]], out: [] },
    { label: "many short readings", y: 490, points: [[0.05, 25], [0.14, -38], [0.22, 32], [0.31, -18], [0.43, 26], [0.52, -35], [0.61, 18], [0.71, -22], [0.82, 34], [0.93, -28]], out: [[0.36, -70], [0.76, 72]] },
  ];
  const x = 75, w = 1230, h = 125, visible = Math.min(2, step);
  const parts = [];
  rows.slice(0, visible + 1).forEach((row) => {
    parts.push(d.label(x, row.y - 18, row.label, { size: 32, color: c.gray }));
    parts.push(d.box(x, row.y, w, h, "", { border: c.dark, fill: c.bg, rounded: false }));
    parts.push(rect(x + 2, row.y + 39, w - 4, 47, c.dark));
    row.points.forEach(([p, off]) => parts.push(rect(x + p * w - 24, row.y + 62 + off - 6, 48, 12, c.white)));
    row.out.forEach(([p, off]) => parts.push(rect(x + p * w - 24, row.y + 62 + off - 6, 48, 12, c.red)));
  });
  // die waagerechte Achse ist Zeit: ohne diese Angabe sind die drei Zeilen nicht lesbar
  const lastY = rows[Math.min(visible, 2)].y + h;
  parts.push(d.arrow(x, lastY + 45, x + w, lastY + 45, { color: c.dark, width: 2, head: 12 }));
  parts.push(d.arrow(x + w, lastY + 45, x, lastY + 45, { color: c.dark, width: 2, head: 12 }));
  parts.push(d.label(x + w / 2, lastY + 90, "one second", { size: 32, color: c.gray, anchor: "middle" }));
  if (step >= 2) {
    parts.push(d.label(1345, 340, "the band that still", { size: 32, color: c.gray }));
    parts.push(d.label(1345, 390, "reads correctly", { size: 32, color: c.gray }));
    parts.push(d.line(1330, 365, 1310, 365, { color: c.gray, width: 3 }));
    parts.push(d.label(1345, 560, "these land in the", { size: 32, color: c.red }));
    parts.push(d.label(1345, 610, "wrong colour", { size: 32, color: c.red }));
  }
  return put("fig-integration", d.svg(1680, 780, ...parts));
};

window.drawTeams = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.label(100, 105, "team a", { size: 32, color: c.gray }),
    d.label(890, 105, "team b", { size: 32, color: c.gray }),
    d.box(100, 155, 690, 300, "changed distance and\nintegration time\n\nrecognition improved", { size: 32, color: c.light, border: c.dark }),
    d.box(890, 155, 690, 300, "changed only distance\n\nrecognition improved", { size: 32, color: c.white, border: c.light }),
  ];
  if (step >= 1) {
    parts.push(d.label(445, 545, "what caused it?", { size: 32, color: c.gray, anchor: "middle" }));
    parts.push(d.label(1235, 545, "distance", { size: 32, color: c.green, anchor: "middle", mono: true }));
    parts.push(check(1500, 210, c.green));
  }
  return put("fig-teams", d.svg(1680, 620, ...parts));
};

window.drawSeries = function (_slide, step = 0) {
  const c = d.colors();
  const xs = [35, 590, 1145];
  const titles = ["before", "during", "after"];
  const bodies = [
    "write conditions\nwrite the expectation",
    "change one variable\ntake a control reading\nrepeat enough times",
    "keep every value\ncompare with expectation\nrecord the outcome",
  ];
  const visible = Math.min(2, step);
  const wires = [];
  for (let i = 0; i < visible; i += 1) wires.push(d.arrow(xs[i] + 500, 330, xs[i + 1] - 20, 330, { color: c.gray, width: 3 }));
  const boxes = [], labels = [];
  for (let i = 0; i <= visible; i += 1) {
    labels.push(d.label(xs[i] + 250, 125, titles[i], { size: 32, color: c.gray, anchor: "middle" }));
    boxes.push(d.box(xs[i], 175, 500, 330, bodies[i], { size: 32, border: i === visible ? c.white : c.dark, color: i === visible ? c.white : c.light }));
  }
  return put("fig-series", d.svg(1680, 620, ...d.layers(wires, boxes, labels)));
};

window.drawLuck = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.box(120, 100, 610, 390, "5 / 5", { size: 80, mono: true, border: c.dark, color: c.light }),
    d.box(950, 100, 610, 390, "50 / 50", { size: 80, mono: true, border: step >= 2 ? c.green : c.light, color: c.white }),
    d.label(425, 570, "guessing succeeds about once in 32 attempts", { size: 32, color: c.gray, anchor: "middle" }),
  ];
  if (step >= 1) parts.push(d.label(1255, 570, "guessing: about 1 in 1,125,899,906,842,624", { size: 32, color: c.gray, anchor: "middle", mono: true }));
  if (step >= 2) {
    parts.push(check(1450, 165, c.green));
    parts.push(d.label(1255, 650, "evidence", { size: 32, color: c.green, anchor: "middle" }));
  }
  return put("fig-luck", d.svg(1680, 680, ...parts));
};

window.drawCalibration = function (_slide, step = 0) {
  const c = d.colors();
  const x0 = 245, y0 = 570, xMax = 1490, yTop = 85;
  const px = (r) => x0 + (r / 255) * (xMax - x0);
  const py = (b) => y0 - (b / 255) * (y0 - yTop);
  const red = [[188, 50], [195, 62], [198, 58], [200, 55], [205, 70], [210, 48]];
  const blue = [[30, 195], [35, 210], [40, 215], [45, 220], [50, 205], [55, 198]];
  const nr = [170, 80];
  const parts = [
    d.arrow(x0, y0, xMax + 45, y0, { color: c.light, width: 3 }),
    d.arrow(x0, y0, x0, yTop - 35, { color: c.light, width: 3 }),
    d.label(xMax + 70, y0 + 11, "r", { size: 48, color: c.white, mono: true }),
    d.label(x0 - 22, yTop - 35, "b", { size: 48, color: c.white, mono: true, anchor: "end" }),
    d.label(1510, 125, "g is roughly constant here", { size: 32, color: c.gray, anchor: "end", mono: true }),
  ];
  red.forEach(([r, b]) => parts.push(circle(px(r), py(b), 13, c.red)));
  blue.forEach(([r, b]) => parts.push(circle(px(r), py(b), 13, c.blue)));
  parts.push(d.label(1400, 430, "red references", { size: 32, color: c.gray, anchor: "middle" }));
  parts.push(d.label(520, 175, "blue references", { size: 32, color: c.gray }));
  parts.push(d.label(840, 645, "measure known colours many times", { size: 32, color: c.gray, anchor: "middle" }));
  if (step >= 1) {
    parts.push(circle(px(nr[0]), py(nr[1]), 16, c.white));
    parts.push(d.label(px(nr[0]) - 40, py(nr[1]) + 12, "new: r=170  b=80", { size: 32, color: c.white, anchor: "end", mono: true }));
  }
  if (step >= 2) {
    // beide Abstaende gleich gezeichnet; nur die Farbe sagt, welcher gewinnt
    parts.unshift(d.line(px(nr[0]), py(nr[1]), px(198), py(58), { color: c.yellow, width: 4, dashed: true }));
    parts.unshift(d.line(px(nr[0]), py(nr[1]), px(45), py(210), { color: c.dark, width: 3, dashed: true }));
  }
  if (step >= 3) parts.push(d.label(1230, 300, "nearest match wins", { size: 32, color: c.yellow, mono: true }));
  return put("fig-calibration", d.svg(1680, 680, ...parts));
};

window.drawAssistant = function (_slide, step = 0) {
  const c = d.colors();
  const parts = [
    d.label(80, 80, "assistant suggestion", { size: 32, color: c.gray }),
    d.label(925, 80, "your measurement series", { size: 32, color: c.gray }),
    d.box(80, 120, 700, 230, '"increase the gain —\nrecognition will improve"', { size: 32, border: c.dark, color: c.light }),
    d.box(925, 120, 675, 230, "gain ↑\nrecognition: 94% → 82%", { size: 32, border: c.light, color: c.white, mono: true }),
  ];
  if (step >= 1) {
    ["one variable", "enough repetitions", "control reading"].forEach((t, i) => {
      parts.push(d.label(960 + i * 215, 420, `✓ ${t}`, { size: 20, color: c.gray }));
    });
  }
  if (step >= 2) {
    parts.push(check(1510, 160, c.green));
    parts.push(d.label(1260, 475, "ground truth for your setup", { size: 32, color: c.green, anchor: "middle" }));
  }
  if (step >= 3) {
    const y = 585, xs = [300, 735, 1170], names = ["suggestion", "measurement", "outcome"];
    parts.push(d.arrow(500, y, 625, y, { color: c.gray, width: 3 }));
    parts.push(d.arrow(935, y, 1060, y, { color: c.gray, width: 3 }));
    names.forEach((name, i) => parts.push(d.box(xs[i], y - 55, 200, 110, name, { size: 20, border: c.dark, mono: true })));
    parts.push(d.label(190, y + 7, "error log", { size: 32, color: c.yellow, anchor: "end", mono: true }));
  }
  return put("fig-assistant", d.svg(1680, 670, ...parts));
};

if ($("fig-ipo-map")) drawIpoMap();
if ($("fig-sent-measured")) drawSentMeasured();

window.deck04 = {
  drawAuthorities, drawExperimentLoop, drawIpoMap, drawSensor, drawSentMeasured,
  drawDark, drawFiveReadings, drawSpread, drawIntegration, drawTeams, drawSeries,
  drawLuck, drawCalibration, drawAssistant,
};
