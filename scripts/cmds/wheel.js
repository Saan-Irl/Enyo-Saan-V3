const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const GIFEncoder = require("gif-encoder-2");

module.exports = {
  config: {
    name: "wheel",
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 6,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData, api }) => {
    const { senderID, threadID } = event;

    const formatMoney = (num) => {
      const n = Number(num);
      if (n === Infinity || isNaN(n)) return "∞";
      if (n < 1000) return n.toFixed(0);
      const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" }
      ];
      for (let u of units) {
        if (n >= u.v)
          return (n / u.v).toFixed(2).replace(/\.00$/, "") + u.s;
      }
      return n.toLocaleString();
    };

    function parseAmount(input) {
      if (!input) return NaN;
      let a = input.toLowerCase();
      if (a.endsWith("k")) return parseFloat(a) * 1e3;
      if (a.endsWith("m")) return parseFloat(a) * 1e6;
      if (a.endsWith("b")) return parseFloat(a) * 1e9;
      if (a.endsWith("t")) return parseFloat(a) * 1e12;
      return parseInt(a);
    }

    const betAmount = parseAmount(args[0]);
    const minBet = 100;
    const maxBet = 1e12;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is 100$\nExample: /wheel 1k`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Max bet: ${formatMoney(maxBet)}$`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(`💸 Not enough balance!\nBalance: ${formatMoney(currentMoney)}$`);
    }

    if (!global.wheelLimit) global.wheelLimit = {};
    const now = Date.now();
    if (!global.wheelLimit[senderID] || (now - global.wheelLimit[senderID].lastReset > 3600000)) {
      global.wheelLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 15;
    if (global.wheelLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily limit reached (${maxSpins} spins)`);
    }

    const segments = [
      { label: "1x", value: 1, weight: 0.31, color: "#FF6B6B" },
      { label: "2x", value: 2, weight: 0.28, color: "#4ECDC4" },
      { label: "3x", value: 3, weight: 0.20, color: "#FFE66D" },
      { label: "5x", value: 5, weight: 0.12, color: "#A8E6CF" },
      { label: "7x", value: 7, weight: 0.06, color: "#FF8A5C" },
      { label: "10x", value: 10, weight: 0.03, color: "#6C5B7B" }
    ];

    const rand = Math.random();
    let cumulative = 0;
    let resultIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      cumulative += segments[i].weight;
      if (rand < cumulative) {
        resultIndex = i;
        break;
      }
    }

    const resultSegment = segments[resultIndex];
    const multiplier = resultSegment.value;
    const win = multiplier > 1;
    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    global.wheelLimit[senderID].count++;

    const status = win ? `WIN ${multiplier}x 🎉` : "LOSE 💀";

    const sent = await message.reply("🌀 Spinning the wheel...");

    const W = 600;
    const H = 600;
    const centerX = W / 2;
    const centerY = H / 2;
    const radius = 240;

    const totalSegments = segments.length;
    const segmentAngle = (2 * Math.PI) / totalSegments;

    const frames = 50;
    const encoder = new GIFEncoder(W, H);
    encoder.setDelay(50);
    encoder.setRepeat(0);
    encoder.setQuality(1);
    encoder.start();

    for (let f = 0; f < frames; f++) {
      const canvas = Canvas.createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx.fill();
      }

      const progress = f / frames;
      const eased = 1 - Math.pow(1 - progress, 3);
      const totalRotation = (2 * Math.PI) * 3;
      const finalAngle = -Math.PI / 2 - (resultIndex * segmentAngle + segmentAngle / 2);
      const angle = eased * totalRotation + finalAngle;

      for (let i = 0; i < totalSegments; i++) {
        const start = i * segmentAngle + angle;
        const end = start + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();

        ctx.shadowBlur = 20;
        ctx.shadowColor = "rgba(255,215,0,0.2)";
        ctx.fillStyle = segments[i].color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 4;
        ctx.stroke();

        const midAngle = start + segmentAngle / 2;
        const textX = centerX + Math.cos(midAngle) * (radius * 0.65);
        const textY = centerY + Math.sin(midAngle) * (radius * 0.65);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#000000";
        ctx.fillText(segments[i].label, textX, textY);
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#d4af37";
      ctx.fillStyle = "#d4af37";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#ff0000";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ff0000";
      ctx.beginPath();
      ctx.moveTo(W / 2 - 24, 22);
      ctx.lineTo(W / 2 + 24, 22);
      ctx.lineTo(W / 2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 14, 0, 2 * Math.PI);
      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(212,175,55,0.6)";
      ctx.strokeStyle = "rgba(212,175,55,0.7)";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      encoder.addFrame(ctx);
    }

    encoder.finish();
    const buffer = encoder.out.getData();

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `wheel_${Date.now()}.gif`);
    fs.writeFileSync(filePath, buffer);

    await api.unsendMessage(sent.messageID);

    const msg = `🎡 𝗪𝗛𝗘𝗘𝗟 𝗦𝗣𝗜𝗡

${win ? "🎉" : "💀"} ${status}
🎯 Result: ${resultSegment.label}
💰 ${win ? "Won: " + formatMoney(bonus) : "Lost: " + formatMoney(betAmount)}$
💳 Balance: ${formatMoney(finalMoney)}$
📊 Usage: ${global.wheelLimit[senderID].count}/${maxSpins}`;

    return api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => {
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }
      }
    );
  }
};
