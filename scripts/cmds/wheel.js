const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GIF_URLS = {
  loss: "https://i.imgur.com/1jkKESg.gif",
  "2x": "https://i.imgur.com/wGVdDKi.gif",
  "3x": "https://i.imgur.com/1EWNoe9.gif",
  "5x": "https://i.imgur.com/8thK7IV.gif",
  "7x": "https://i.imgur.com/bI428mz.gif"
};

module.exports = {
  config: {
    name: "wheel",
    version: "4.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 18,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData, api }) => {
    const { senderID, threadID } = event;

    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir))
      fs.mkdirSync(cacheDir, { recursive: true });

    // =========================
    // MONEY FORMAT
    // =========================
    const formatMoney = (num) => {
      const n = Number(num);

      if (n === Infinity || isNaN(n))
        return "∞";

      if (n < 1000)
        return n.toFixed(0);

      const units = [
        { v: 1e15, s: "Q" },
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" }
      ];

      for (const u of units) {
        if (n >= u.v) {
          return (
            (n / u.v)
              .toFixed(2)
              .replace(/\.00$/, "") + u.s
          );
        }
      }

      return n.toLocaleString();
    };

    // =========================
    // AMOUNT PARSER
    // =========================
    function parseAmount(input) {
      if (!input)
        return NaN;

      const a = input.toLowerCase().replace(/,/g, "");

      if (a.endsWith("k"))
        return parseFloat(a) * 1e3;

      if (a.endsWith("m"))
        return parseFloat(a) * 1e6;

      if (a.endsWith("b"))
        return parseFloat(a) * 1e9;

      if (a.endsWith("t"))
        return parseFloat(a) * 1e12;

      if (a.endsWith("q"))
        return parseFloat(a) * 1e15;

      return parseFloat(a);
    }

    // =========================
    // SETTINGS
    // =========================
    const minBet = 100;
    const maxBet = 1e15; // 1Q

    const maxSpins = 10;
    const resetTime = 12 * 60 * 60 * 1000; // 12 hours

    const winRate = 64;
    const lossRate = 35;

    // =========================
    // BET CHECK
    // =========================
    const betAmount = parseAmount(args[0]);

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(
        `🎡 𝗪𝗛𝗘𝗘𝗟 𝗦𝗣𝗜𝗡\n\n` +
        `❌ Minimum bet: ${formatMoney(minBet)}$\n` +
        `💡 Example: /wheel 1k`
      );
    }

    if (betAmount > maxBet) {
      return message.reply(
        `🚫 Maximum bet: ${formatMoney(maxBet)}$`
      );
    }

    // =========================
    // USER BALANCE
    // =========================
    let userData = await usersData.get(senderID);

    if (!userData)
      userData = { money: 0 };

    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(
        `💸 𝗡𝗢𝗧 𝗘𝗡𝗢𝗨𝗚𝗛 𝗕𝗔𝗟𝗔𝗡𝗖𝗘\n\n` +
        `💳 Balance: ${formatMoney(currentMoney)}$\n` +
        `🎯 Bet: ${formatMoney(betAmount)}$`
      );
    }

    // =========================
    // SPIN LIMIT
    // =========================
    if (!global.wheelLimit)
      global.wheelLimit = {};

    const now = Date.now();

    if (
      !global.wheelLimit[senderID] ||
      now - global.wheelLimit[senderID].lastReset >= resetTime
    ) {
      global.wheelLimit[senderID] = {
        count: 0,
        lastReset: now
      };
    }

    const limitData = global.wheelLimit[senderID];

    if (limitData.count >= maxSpins) {
      const remaining =
        resetTime - (now - limitData.lastReset);

      const hours = Math.floor(
        remaining / (60 * 60 * 1000)
      );

      const minutes = Math.floor(
        (remaining % (60 * 60 * 1000)) /
          (60 * 1000)
      );

      return message.reply(
        `🚫 𝗪𝗛𝗘𝗘𝗟 𝗟𝗜𝗠𝗜𝗧\n\n` +
        `🎲 Limit: ${maxSpins} spins\n` +
        `⏳ Reset: ${hours}h ${minutes}m\n\n` +
        `You can spin again after 12 hours.`
      );
    }

    // =========================
    // RESULT SYSTEM
    // 64% WIN
    // 35% LOSS
    // 1% REFUND / NEUTRAL
    // =========================
    const chance = Math.floor(Math.random() * 100);

    let resultType = "neutral";
    let multiplier = 0;

    if (chance < winRate) {
      // WIN: 0-63 = 64%
      const rewardChance =
        Math.floor(Math.random() * 100);

      if (rewardChance < 50) {
        resultType = "2x";
        multiplier = 2;
      } else if (rewardChance < 80) {
        resultType = "3x";
        multiplier = 3;
      } else if (rewardChance < 95) {
        resultType = "5x";
        multiplier = 5;
      } else {
        resultType = "7x";
        multiplier = 7;
      }
    } else if (chance < winRate + lossRate) {
      // LOSS: 64-98 = 35%
      resultType = "loss";
      multiplier = 0;
    } else {
      // NEUTRAL: 99 = 1%
      resultType = "neutral";
      multiplier = 0;
    }

    // =========================
    // BALANCE CALCULATION
    // =========================
    let finalMoney;
    let statusText;
    let payoutText;
    let outcomeEmoji;

    if (resultType === "loss") {
      finalMoney = currentMoney - betAmount;

      statusText = "NO MATCH FOUND";
      payoutText =
        `Lost: -${formatMoney(betAmount)}$`;
      outcomeEmoji = "💀";

    } else if (resultType === "neutral") {
      // 1% neutral = bet returned
      finalMoney = currentMoney;

      statusText = "REFUND";
      payoutText =
        `Returned: +${formatMoney(betAmount)}$`;
      outcomeEmoji = "🔄";

    } else {
      const bonus = betAmount * multiplier;

      finalMoney = currentMoney + bonus;

      statusText = `WIN (${multiplier}X)`;
      payoutText =
        `Won: +${formatMoney(bonus)}$`;
      outcomeEmoji = "🎉";
    }

    // =========================
    // SAVE BALANCE
    // =========================
    userData.money = finalMoney;

    await usersData.set(senderID, userData);

    // Count spin
    limitData.count++;

    // =========================
    // RESULT MESSAGE
    // =========================
    const msgBody =
      `🎡 𝗪𝗛𝗘𝗘𝗟 𝗦𝗣𝗜𝗡\n\n` +
      `${outcomeEmoji} Result: ${statusText}\n` +
      `💰 ${payoutText}\n` +
      `💳 Balance: ${formatMoney(finalMoney)}$\n\n` +
      `🎯 Win Rate: ${winRate}%\n` +
      `💔 Loss Rate: ${lossRate}%\n` +
      `🎲 Spins: ${limitData.count}/${maxSpins}\n` +
      `⏳ Limit resets: 12 hours`;

    // =========================
    // GIF
    // =========================
    const filePath = path.join(
      cacheDir,
      `wheel_${Date.now()}_${senderID}.gif`
    );

    api.setMessageReaction(
      "🌀",
      event.messageID,
      () => {},
      true
    );

    try {
      const imageResponse = await axios({
        url:
          GIF_URLS[resultType] ||
          GIF_URLS.loss,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        }
      });

      const writer =
        fs.createWriteStream(filePath);

      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return api.sendMessage(
        {
          body: msgBody,
          attachment:
            fs.createReadStream(filePath)
        },
        threadID,
        () => {
          api.setMessageReaction(
            resultType === "loss"
              ? "❌"
              : "✅",
            event.messageID,
            () => {},
            true
          );

          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch {}
          }
        },
        event.messageID
      );

    } catch (e) {
      console.error(e);

      api.setMessageReaction(
        resultType === "loss"
          ? "❌"
          : "✅",
        event.messageID,
        () => {},
        true
      );

      return message.reply(msgBody);
    }
  }
};