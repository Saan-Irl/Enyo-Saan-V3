const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");
const GIFEncoder = require("gif-encoder-2");

module.exports = {
  config: {
    name: "spin",
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 9,
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
    const maxBet = 1000000000000;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is 100$\nExample: /spin 1k`);
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

    if (!global.spinLimit) global.spinLimit = {};
    const now = Date.now();
    if (!global.spinLimit[senderID] || (now - global.spinLimit[senderID].lastReset > 3600000)) {
      global.spinLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 10;
    if (global.spinLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily limit reached (${maxSpins} spins)`);
    }

    const segments = [
      { emoji: "🍎", multiplier: 0 },
      { emoji: "🍐", multiplier: 0 },
      { emoji: "🍑", multiplier: 1 },
      { emoji: "🍒", multiplier: 2 },
      { emoji: "🍓", multiplier: 3 },
      { emoji: "🍇", multiplier: 4 },
      { emoji: "🍉", multiplier: 5 },
      { emoji: "🍊", multiplier: 10 }
    ];

    const totalSegments = segments.length;
    const segmentAngle = (2 * Math.PI) / totalSegments;

    const spinResult = Math.floor(Math.random() * totalSegments);
    const resultSegment = segments[spinResult];
    const multiplier = resultSegment.multiplier;
    const win = multiplier > 0;
    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    global.spinLimit[senderID].count++;

    const status = win ? `WIN ${multiplier}x 🎉` : "LOSE 💀";

    const sent = await message.reply("🌀 Spinning the wheel...");

    const W = 400;
    const H = 400;
    const centerX = W / 2;
    const centerY = H / 2;
    const radius = 160;

    const frames = 30;
    const encoder = new GIFEncoder(W, H);
    encoder.setDelay(80);
    encoder.setRepeat(0);
    encoder.start();

    for (let f = 0; f < frames; f++) {
      const canvas = Canvas.createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#1a0a2e";
      ctx.fillRect(0, 0, W, H);

      const progress = f / frames;
      const totalRotation = (2 * Math.PI) * 2.5;
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentAngle = eased * totalRotation;

      const finalAngle = spinResult * segmentAngle;
      const rotation = currentAngle + finalAngle;

      for (let i = 0; i < totalSegments; i++) {
        const start = i * segmentAngle + rotation;
        const end = start + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? "#2d1b4e" : "#3d2b5e";
        ctx.fill();
        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 2;
        ctx.stroke();

        const midAngle = start + segmentAngle / 2;
        const textX = centerX + Math.cos(midAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(midAngle) * (radius * 0.7);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "32px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#000000";
        ctx.fillText(segments[i].emoji, textX, textY);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#d4af37";
        ctx.fillText(segments[i].multiplier + "x", textX, textY + 30);
      }

      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#d4af37";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.moveTo(W / 2 - 20, 20);
      ctx.lineTo(W / 2 + 20, 20);
      ctx.lineTo(W / 2, 5);
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("SPIN", W / 2, H - 10);

      encoder.addFrame(ctx);
    }

    encoder.finish();
    const buffer = encoder.out.getData();

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const filePath = path.join(cacheDir, `spin_${Date.now()}.gif`);
    fs.writeFileSync(filePath, buffer);

    await api.unsendMessage(sent.messageID);

    const msg = `🎡 𝗦𝗣𝗜𝗡 𝗪𝗛𝗘𝗘𝗟

${win ? "🎉" : "💀"} ${status}
📊 Result: ${resultSegment.emoji} (${multiplier}x)
💰 ${win ? "Won: " + formatMoney(bonus) : "Lost: " + formatMoney(betAmount)}$
💳 Balance: ${formatMoney(finalMoney)}$
📊 Usage: ${global.spinLimit[senderID].count}/${maxSpins}`;

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
