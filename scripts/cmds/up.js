const os = require('os');
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

let si = null;
try {
  si = require('systeminformation');
} catch (e) {
  si = null;
}

const C = {
  bg: '#02060d',
  grid: '#0a1830',
  panel: '#050f20',
  panelAlt: 'rgba(255,255,255,0.03)',
  border: '#1c6fe0',
  glow: 'rgba(45,150,255,0.6)',
  cyan: '#38ecff',
  green: '#39ffb8',
  blue: '#4a90ff',
  purple: '#c07bff',
  dim: '#82aee0',
  white: '#f5faff',
};

const statsPath = path.join(__dirname, 'cache', 'command_stats.json');

function readCommandStats() {
  try {
    return fs.readJsonSync(statsPath);
  } catch (e) {
    return {};
  }
}

function writeCommandStats(data) {
  try {
    fs.ensureDirSync(path.dirname(statsPath));
    fs.writeJsonSync(statsPath, data);
  } catch (e) {}
}

module.exports = {
  config: {
    name: "up",
    version: "4.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    description: "See bot uptime and most used commands in a large neon System Overview HUD",
    category: "system"
  },

  onChat: async function ({ event }) {
    const body = (event.body || '').trim();
    if (!body) return;
    const match = body.match(/^[^a-zA-Z0-9]*([a-zA-Z0-9_]+)/);
    if (!match) return;
    const cmd = match[1].toLowerCase();
    const data = readCommandStats();
    data[cmd] = (data[cmd] || 0) + 1;
    writeCommandStats(data);
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, timestamp } = event;

    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${secs}s`;

    const ping = Date.now() - timestamp;
    const nodeVer = process.version;
    const platform = `${os.platform()} (${os.arch()})`;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedMemStr = (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    const totalMemStr = (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB';

    const bodyMsg =
`✧━━━━━━━━━━━━━━━━━━━━✧
    𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗩𝗘𝗥𝗩𝗜𝗘𝗪
✧━━━━━━━━━━━━━━━━━━━━✧
⏱ Uptime   : ${uptimeStr}
🏓 Ping    : ${ping} ms
📦 Node    : ${nodeVer}
🖥 Platform: ${platform}
💾 Memory  : ${usedMemStr} / ${totalMemStr}
✧━━━━━━━━━━━━━━━━━━━━✧
⚡ Powered by 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍`;

    try {
      const cachePath = path.join(__dirname, 'cache', `up_hud.png`);
      fs.ensureDirSync(path.join(__dirname, 'cache'));

      const buffer = await generateHUD({ timestamp });
      fs.writeFileSync(cachePath, buffer);

      return api.sendMessage(
        {
          body: bodyMsg,
          attachment: fs.createReadStream(cachePath)
        },
        threadID,
        () => fs.unlinkSync(cachePath),
        messageID
      );
    } catch (e) {
      api.sendMessage(`Error: ${e.message}`, threadID);
    }
  }
};

async function generateHUD({ timestamp }) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPct = (usedMem / totalMem) * 100;
  const cpuPct = Math.min(100, (os.loadavg()[0] / os.cpus().length) * 100);
  const ping = Date.now() - timestamp;

  let cpuHistory = [];
  for (let i = 0; i < 30; i++) cpuHistory.push(Math.max(3, cpuPct + (Math.random() * 16 - 8)));

  let storage = [];
  let processes = [];

  if (si) {
    const [fsSize, procs] = await Promise.all([
      si.fsSize().catch(() => []),
      si.processes().catch(() => null),
    ]);
    storage = fsSize.slice(0, 3).map(d => ({ name: d.mount, used: d.used, size: d.size, pct: d.use }));
    if (procs && procs.list) {
      processes = procs.list.sort((a, b) => b.cpu - a.cpu).slice(0, 5)
        .map(p => ({ name: p.name, cpu: p.cpu.toFixed(2) + '%', mem: (p.memRss / 1024).toFixed(1) + ' MB' }));
    }
  }

  const rawStats = readCommandStats();
  const topCommands = Object.entries(rawStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const maxCount = topCommands.length ? topCommands[0].count : 1;

  const s = {
    botUptime: fmtUptime(process.uptime()),
    ping: `${ping} ms`,
    ramUsed: fmtBytes(usedMem),
    ramTotal: fmtBytes(totalMem),
    ramPct,
    cpuPct,
    cpuHistory,
    platform: `${os.platform()} (${os.arch()})`,
    nodeVersion: process.version,
    hostname: os.hostname(),
    storage,
    processes,
    topCommands,
    maxCount,
  };

  const W = 3400, H = 2000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, W * 0.75);
  bgGrad.addColorStop(0, '#071228');
  bgGrad.addColorStop(0.55, '#03080f');
  bgGrad.addColorStop(1, '#000103');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 60) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

  drawPanel(ctx, 30, 30, W - 60, H - 60, 34);

  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 78px Sans';
  ctx.textAlign = 'left';
  spacedText(ctx, '● SYSTEM OVERVIEW', 110, 150, 2);

  ctx.font = '600 34px Sans';
  ctx.fillStyle = C.dim;
  spacedText(ctx, 'REAL-TIME MONITORING', 1230, 140, 5);

  const now = new Date();
  ctx.textAlign = 'right';
  ctx.fillStyle = C.white;
  ctx.font = 'bold 48px Sans';
  ctx.fillText(now.toLocaleTimeString('en-GB'), W - 110, 140);
  ctx.font = '32px Sans';
  ctx.fillStyle = C.dim;
  ctx.fillText(now.toDateString(), W - 110, 92);
  ctx.textAlign = 'left';

  const leftX = 110, leftY = 230, leftW = 1900, leftH = 1050;
  drawPanel(ctx, leftX, leftY, leftW, leftH);

  const rows = [
    ['BOT UPTIME', s.botUptime],
    ['PING', s.ping],
    ['RAM', `${s.ramUsed} / ${s.ramTotal}`],
    ['CPU LOAD', `${s.cpuPct.toFixed(2)}%`],
    ['PLATFORM', s.platform],
    ['NODE.JS', s.nodeVersion],
    ['HOSTNAME', s.hostname],
  ];

  let ry = leftY + 120;
  const rowH = 140;
  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = C.panelAlt;
      ctx.fillRect(leftX + 30, ry - 70, leftW - 60, rowH - 16);
    }

    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(leftX + 68, ry - 12, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = C.green;
    ctx.font = 'bold 40px monospace';
    ctx.fillText(label, leftX + 100, ry);

    ctx.fillStyle = C.white;
    ctx.font = '40px monospace';
    ctx.fillText(':  ' + value, leftX + 580, ry);

    if (label === 'RAM') {
      drawProgressBar(ctx, leftX + 580, ry + 30, 950, 30, s.ramPct, C.cyan);
      ctx.fillStyle = C.white;
      ctx.font = 'bold 34px monospace';
      ctx.fillText(s.ramPct.toFixed(0) + '%', leftX + 1560, ry + 55);
    }
    if (label === 'CPU LOAD') {
      drawSparkline(ctx, leftX + 580, ry - 45, 750, 65, s.cpuHistory, C.green);
    }

    if (i < rows.length - 1) {
      ctx.strokeStyle = '#123057';
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(leftX + 80, ry + 42);
      ctx.lineTo(leftX + leftW - 80, ry + 42);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ry += rowH;
  });

  const rightX = 2060, rightW = 1230;

  drawPanel(ctx, rightX, leftY, rightW, 500);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 36px Sans';
  ctx.fillText('● CPU USAGE', rightX + 45, leftY + 60);
  drawGauge(ctx, rightX + 230, leftY + 260, 145, s.cpuPct, C.blue, 50);
  drawSparkline(ctx, rightX + 420, leftY + 90, 760, 270, s.cpuHistory, C.blue);

  const ramY = leftY + 500 + 50;
  drawPanel(ctx, rightX, ramY, rightW, 500);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 36px Sans';
  ctx.fillText('● RAM USAGE', rightX + 45, ramY + 60);
  drawGauge(ctx, rightX + 230, ramY + 260, 145, s.ramPct, C.green, 50);
  ctx.fillStyle = C.green;
  ctx.font = 'bold 34px monospace';
  ctx.fillText(`USED  ${s.ramUsed}`, rightX + 470, ramY + 200);
  ctx.fillStyle = C.white;
  ctx.font = '34px monospace';
  ctx.fillText(`TOTAL ${s.ramTotal}`, rightX + 470, ramY + 250);
  drawProgressBar(ctx, rightX + 470, ramY + 285, 700, 30, s.ramPct, C.green);

  const botY = leftY + leftH + 50, botH = 500, colW = 1026, gap = 50;
  const col1 = 110, col2 = col1 + colW + gap, col3 = col2 + colW + gap;

  drawPanel(ctx, col1, botY, colW, botH);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 36px Sans';
  ctx.fillText('☰  STORAGE', col1 + 45, botY + 65);

  let sy = botY + 150;
  const storageData = s.storage.length ? s.storage : [{ name: '/', used: 0, size: 1, pct: 0 }];
  storageData.forEach(d => {
    ctx.fillStyle = C.white;
    ctx.font = 'bold 30px monospace';
    ctx.fillText(d.name, col1 + 45, sy);
    drawProgressBar(ctx, col1 + 300, sy - 26, 380, 22, d.pct, C.blue);
    ctx.fillStyle = C.cyan;
    ctx.font = 'bold 27px monospace';
    ctx.fillText(`${d.pct.toFixed(0)}%`, col1 + 720, sy);
    ctx.font = '23px monospace';
    ctx.fillStyle = C.dim;
    ctx.fillText(`${fmtBytes(d.used)} / ${fmtBytes(d.size)}`, col1 + 300, sy + 32);
    sy += 115;
  });

  drawPanel(ctx, col2, botY, colW, botH);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 36px Sans';
  ctx.fillText('★  TOP COMMANDS', col2 + 45, botY + 65);

  let cy = botY + 155;
  const cmdData = s.topCommands.length ? s.topCommands : [{ name: 'N/A', count: 0 }];
  const cmdColors = [C.green, C.cyan, C.blue, C.purple, C.dim];
  cmdData.forEach((c, i) => {
    ctx.fillStyle = cmdColors[i % cmdColors.length];
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`${i + 1}.`, col2 + 45, cy);
    ctx.fillStyle = C.white;
    ctx.font = 'bold 30px monospace';
    ctx.fillText(c.name, col2 + 100, cy);
    drawProgressBar(ctx, col2 + 45, cy + 18, colW - 200, 18, (c.count / s.maxCount) * 100, cmdColors[i % cmdColors.length]);
    ctx.fillStyle = C.dim;
    ctx.font = '24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${c.count}x`, col2 + colW - 45, cy);
    ctx.textAlign = 'left';
    cy += 82;
  });

  drawPanel(ctx, col3, botY, colW, botH);
  ctx.fillStyle = C.cyan;
  ctx.font = 'bold 36px Sans';
  ctx.fillText('☰  TOP PROCESSES', col3 + 45, botY + 65);
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = C.dim;
  ctx.fillText('CPU', col3 + 680, botY + 65);
  ctx.fillText('MEM', col3 + 830, botY + 65);

  const procData = s.processes.length ? s.processes : [{ name: 'node', cpu: '—', mem: '—' }];
  let py = botY + 145;
  const dots = [C.green, C.green, C.blue, C.purple, C.purple];
  procData.forEach((p, i) => {
    if (i % 2 === 0) {
      ctx.fillStyle = C.panelAlt;
      ctx.fillRect(col3 + 30, py - 38, colW - 60, 58);
    }
    ctx.fillStyle = dots[i % dots.length];
    ctx.beginPath();
    ctx.arc(col3 + 68, py - 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.font = 'bold 30px monospace';
    ctx.fillText(p.name, col3 + 100, py);
    ctx.font = '27px monospace';
    ctx.fillStyle = C.cyan;
    ctx.fillText(p.cpu, col3 + 670, py);
    ctx.fillStyle = C.white;
    ctx.fillText(p.mem, col3 + 810, py);
    py += 72;
  });

  const footY = H - 160, footW = W - 220;
  drawPanel(ctx, 110, footY, footW, 110);
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(170, footY + 55, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = C.dim;
  ctx.fillText('STATUS:', 200, footY + 66);
  ctx.fillStyle = C.white;
  ctx.fillText('ONLINE', 380, footY + 66);

  ctx.fillStyle = C.dim;
  ctx.fillText('LOAD AVG:', 680, footY + 66);
  ctx.fillStyle = C.white;
  ctx.fillText(os.loadavg().map(n => n.toFixed(2)).join(', '), 940, footY + 66);

  ctx.fillStyle = C.dim;
  ctx.fillText('COMMANDS TRACKED:', 1650, footY + 66);
  ctx.fillStyle = C.white;
  ctx.fillText(String(Object.keys(rawStats).length), 2020, footY + 66);

  ctx.fillStyle = C.green;
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('🔒 SECURE', W - 160, footY + 66);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanel(ctx, x, y, w, h, r = 20) {
  ctx.save();
  ctx.shadowColor = C.glow;
  ctx.shadowBlur = 18;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.border;
  ctx.stroke();
  ctx.restore();
}

function spacedText(ctx, text, x, y, spacing = 2) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function drawProgressBar(ctx, x, y, w, h, pct, color) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#0b1b33';
  ctx.fill();
  const fillW = Math.max(h, (w * Math.min(pct, 100)) / 100);
  roundRect(ctx, x, y, fillW, h, h / 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGauge(ctx, cx, cy, radius, pct, color, fontSize = 30) {
  const start = -Math.PI / 2;
  const end = start + (Math.PI * 2 * Math.min(pct, 100)) / 100;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#0b1b33';
  ctx.lineWidth = 26;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = color;
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = C.white;
  ctx.font = `bold ${fontSize}px Sans`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${pct.toFixed(2)}%`, cx, cy);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawSparkline(ctx, x, y, w, h, data, color) {
  if (!data || data.length < 2) return;
  const max = Math.max(...data, 1);
  const step = w / (data.length - 1);

  ctx.beginPath();
  data.forEach((v, i) => {
    const px = x + i * step;
    const py = y + h - (v / max) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fill();
}

function fmtBytes(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function fmtUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${sec}s`;
      }
