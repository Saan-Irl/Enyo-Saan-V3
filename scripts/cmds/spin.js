const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GIF_URLS = {
  loss: "https://i.imgur.com/GDNNKbs.gif",
  "1x": "https://i.imgur.com/oQExgHx.gif",
  "2x": "https://i.imgur.com/0AmSYWc.gif",
  "3x": "https://i.imgur.com/urR3V6F.gif",
  "4x": "https://i.imgur.com/RGDTCQ8.gif"
};

const parseAmount = (input) => {
  if (!input) return NaN;

  input = input.toString().toLowerCase().replace(/,/g, "").trim();

  const suffixes = {
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12
  };

  const lastChar = input.slice(-1);

  if (suffixes[lastChar]) {
    const number = parseFloat(input.slice(0, -1));
    return isNaN(number) ? NaN : number * suffixes[lastChar];
  }

  return parseFloat(input);
};

const formatMoney = (amount) => {
  amount = Math.floor(amount);

  if (amount >= 1e12)
    return (amount / 1e12).toFixed(2).replace(/\.00$/, "") + "T";

  if (amount >= 1e9)
    return (amount / 1e9).toFixed(2).replace(/\.00$/, "") + "B";

  if (amount >= 1e6)
    return (amount / 1e6).toFixed(2).replace(/\.00$/, "") + "M";

  if (amount >= 1e3)
    return (amount / 1e3).toFixed(2).replace(/\.00$/, "") + "K";

  return amount.toLocaleString();
};

module.exports = {
  config: {
    name: "spin",
    version: "7.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 16,
    role: 0,
    shortDescription: "Spin the wheel",
    category: "games",
    guide: "{pn} <amount>"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const senderID = event.senderID;

    const minBet = 100;
    const maxBet = 1000000000000; // 1T
    const winRate = 63;

    const maxSpins = 12; // 12 spins
    const spinResetTime = 12 * 60 * 60 * 1000; // 12 hours

    if (!global.spinLimit)
      global.spinLimit = {};

    if (!global.spinLimit[senderID]) {
      global.spinLimit[senderID] = {
        count: 0,
        resetAt: Date.now() + spinResetTime
      };
    }

    const limitData = global.spinLimit[senderID];

    // Reset after 12 hours
    if (Date.now() >= limitData.resetAt) {
      limitData.count = 0;
      limitData.resetAt = Date.now() + spinResetTime;
    }

    // Spin limit check
    if (limitData.count >= maxSpins) {
      const remaining = limitData.resetAt - Date.now();
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor(
        (remaining % (60 * 60 * 1000)) / (60 * 1000)
      );

      return api.sendMessage(
        `🎡 𝗦𝗣𝗜𝗡 𝗟𝗜𝗠𝗜𝗧\n\n` +
        `❌ You have used all ${maxSpins} spins.\n` +
        `⏳ Try again in ${hours}h ${minutes}m.\n\n` +
        `🎯 Limit: ${maxSpins} spins / 12 hours`,
        event.threadID,
        event.messageID
      );
    }

    const betAmount = parseAmount(args[0]);

    if (isNaN(betAmount)) {
      return api.sendMessage(
        `🎡 𝗦𝗣𝗜𝗡 𝗪𝗛𝗘𝗘𝗟\n\n` +
        `❌ Please enter a valid amount.\n` +
        `Example: ${this.config.guide}`,
        event.threadID,
        event.messageID
      );
    }

    if (betAmount < minBet) {
      return api.sendMessage(
        `❌ Minimum bet: ${formatMoney(minBet)}$`,
        event.threadID,
        event.messageID
      );
    }

    if (betAmount > maxBet) {
      return api.sendMessage(
        `❌ Maximum bet: ${formatMoney(maxBet)}$`,
        event.threadID,
        event.messageID
      );
    }

    const userData = await usersData.get(senderID);
    const currentMoney = userData.money || 0;

    if (currentMoney < betAmount) {
      return api.sendMessage(
        `💳 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗕𝗔𝗟𝗔𝗡𝗖𝗘\n\n` +
        `💰 Balance: ${formatMoney(currentMoney)}$\n` +
        `🎯 Bet: ${formatMoney(betAmount)}$`,
        event.threadID,
        event.messageID
      );
    }

    limitData.count++;

    api.setMessageReaction("🌀", event.messageID, () => {}, true);

    const spinChance = Math.floor(Math.random() * 100);

    let multiplier = 0;
    let outcome = "loss";

    // 63% win rate
    if (spinChance < winRate) {
      const rewardChance = Math.floor(Math.random() * 100);

      if (rewardChance < 40) {
        multiplier = 1;
      } else if (rewardChance < 70) {
        multiplier = 2;
      } else if (rewardChance < 90) {
        multiplier = 3;
      } else {
        multiplier = 4;
      }

      outcome = `${multiplier}x`;
    }

    let finalMoney;
    let payoutText;
    let statusText;
    let outcomeEmoji;

    if (outcome === "loss") {
      finalMoney = currentMoney - betAmount;
      statusText = "𝗟𝗢𝗦𝗦";
      outcomeEmoji = "💀";
      payoutText = `-${formatMoney(betAmount)}$`;
    } else {
      const winAmount = betAmount * multiplier;
      finalMoney = currentMoney + winAmount;

      statusText = `𝗪𝗜𝗡𝗡𝗘𝗥 • ${multiplier}X`;
      outcomeEmoji = "🏆";
      payoutText = `+${formatMoney(winAmount)}$`;
    }

    await usersData.set(senderID, {
      money: finalMoney
    });

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const gifPath = path.join(
      cacheDir,
      `spin_${Date.now()}_${senderID}.gif`
    );

    try {
      const gifUrl = GIF_URLS[outcome];

      const response = await axios.get(gifUrl, {
        responseType: "arraybuffer",
        timeout: 15000
      });

      await fs.writeFile(gifPath, response.data);

      await api.sendMessage(
        {
          body:
            `🎡 𝗦𝗣𝗜𝗡 𝗪𝗛𝗘𝗘𝗟\n` +
            `╭──────────────╮\n` +
            `│ ${outcomeEmoji} ${statusText}\n` +
            `│ 💰 ${payoutText}\n` +
            `│ 💳 Balance: ${formatMoney(finalMoney)}$\n` +
            `╰──────────────╯\n\n` +
            `🎯 Win Rate: ${winRate}%\n` +
            `🎲 Spins: ${limitData.count}/${maxSpins}\n` +
            `⏳ Limit resets every 12 hours`,
          attachment: fs.createReadStream(gifPath)
        },
        event.threadID,
        () => {
          api.setMessageReaction(
            outcome === "loss" ? "❌" : "✅",
            event.messageID,
            () => {},
            true
          );

          setTimeout(() => {
            fs.remove(gifPath).catch(() => {});
          }, 10000);
        },
        event.messageID
      );
    } catch (error) {
      // GIF download fail হলেও result দেখাবে
      await api.sendMessage(
        `🎡 𝗦𝗣𝗜𝗡 𝗪𝗛𝗘𝗘𝗟\n` +
        `╭──────────────╮\n` +
        `│ ${outcomeEmoji} ${statusText}\n` +
        `│ 💰 ${payoutText}\n` +
        `│ 💳 Balance: ${formatMoney(finalMoney)}$\n` +
        `╰──────────────╯\n\n` +
        `🎯 Win Rate: ${winRate}%\n` +
        `🎲 Spins: ${limitData.count}/${maxSpins}\n` +
        `⏳ Limit resets every 12 hours`,
        event.threadID,
        event.messageID
      );

      api.setMessageReaction(
        outcome === "loss" ? "❌" : "✅",
        event.messageID,
        () => {},
        true
      );

      fs.remove(gifPath).catch(() => {});
    }
  }
};