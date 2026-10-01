module.exports = {
  config: {
    name: "slot",
    version: "8.2",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 10,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData }) => {
    const { senderID } = event;

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

      for (const u of units) {
        if (n >= u.v) {
          return (
            (n / u.v)
              .toFixed(2)
              .replace(/\.00$/, "")
              .replace(/(\.\d)0$/, "$1") +
            u.s
          );
        }
      }

      return n.toLocaleString();
    };

    function parseAmount(input) {
      if (!input) return NaN;

      const a = input.toLowerCase().trim();

      if (a.endsWith("k")) return parseFloat(a) * 1e3;
      if (a.endsWith("m")) return parseFloat(a) * 1e6;
      if (a.endsWith("b")) return parseFloat(a) * 1e9;
      if (a.endsWith("t")) return parseFloat(a) * 1e12;

      return parseInt(a);
    }

    const betAmount = parseAmount(args[0]);

    const minBet = 100;
    const maxBet = 500000000000;
    const winRate = 60;

    // BET VALIDATION
    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(
        `⚠️ Minimum bet: ${formatMoney(minBet)}$\n` +
        `Example: /slot 1k`
      );
    }

    if (betAmount > maxBet) {
      return message.reply(
        `🚫 Maximum bet: ${formatMoney(maxBet)}$`
      );
    }

    // USER DATA
    let userData = await usersData.get(senderID);

    if (!userData) {
      userData = { money: 0 };
    }

    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(
        `💸 Insufficient funds!\n` +
        `💳 Balance: ${formatMoney(currentMoney)}$`
      );
    }

    // SPIN LIMIT
    if (!global.slotLimit) {
      global.slotLimit = {};
    }

    const now = Date.now();

    if (
      !global.slotLimit[senderID] ||
      now - global.slotLimit[senderID].lastReset > 3600000
    ) {
      global.slotLimit[senderID] = {
        count: 0,
        lastReset: now
      };
    }

    const maxSpins = 15;

    if (global.slotLimit[senderID].count >= maxSpins) {
      return message.reply(
        `🚫 Spin quota exhausted (${maxSpins}/${maxSpins})`
      );
    }

    // SLOT SYMBOLS
    const hearts = [
      "❤️",
      "💙",
      "💚",
      "💛",
      "💜",
      "🧡",
      "🖤",
      "🤍"
    ];

    let s = [];

    // 60% WIN RATE
    const rollChance = Math.floor(Math.random() * 100);
    const isWinSpin = rollChance < winRate;

    let matchCount = 0;

    if (isWinSpin) {
      const winTypeRoll = Math.floor(Math.random() * 100);

      // Win distribution
      if (winTypeRoll < 10) {
        matchCount = 4;
      } else if (winTypeRoll < 40) {
        matchCount = 3;
      } else {
        matchCount = 2;
      }

      const chosenHeart =
        hearts[Math.floor(Math.random() * hearts.length)];

      s = Array(4).fill(null);

      // Matching symbols
      for (let i = 0; i < matchCount; i++) {
        s[i] = chosenHeart;
      }

      // Different symbols
      for (let i = matchCount; i < 4; i++) {
        let randomHeart;

        do {
          randomHeart =
            hearts[Math.floor(Math.random() * hearts.length)];
        } while (
          randomHeart === chosenHeart &&
          matchCount < 4
        );

        s[i] = randomHeart;
      }

      // Shuffle result
      s.sort(() => Math.random() - 0.5);

    } else {
      // Guaranteed no matching pair
      const shuffled = [...hearts].sort(
        () => Math.random() - 0.5
      );

      s = shuffled.slice(0, 4);
    }

    // COUNT SPIN
    global.slotLimit[senderID].count++;

    // CHECK MATCH
    const counts = {};

    s.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });

    const maxMatch = Math.max(
      ...Object.values(counts)
    );

    const win = maxMatch >= 2;

    // MULTIPLIER
    let multiplier = 0;

    if (maxMatch === 4) {
      multiplier = 5;
    } else if (maxMatch === 3) {
      multiplier = 3;
    } else if (maxMatch === 2) {
      multiplier = 1.5;
    }

    // MONEY CALCULATION
    const winAmount = win
      ? betAmount * multiplier
      : 0;

    const finalMoney = win
      ? currentMoney - betAmount + winAmount
      : currentMoney - betAmount;

    userData.money = finalMoney;

    await usersData.set(senderID, userData);

    // PREMIUM RESULT
    const resultMessage =
      `🎰 𝗦𝗟𝗢𝗧 𝗠𝗔𝗖𝗛𝗜𝗡𝗘\n` +
      `╭──────────────╮\n` +
      `│  ${s[0]}  ${s[1]}  ${s[2]}  ${s[3]}  │\n` +
      `╰──────────────╯\n` +
      (
        win
          ? `🏆 𝗪𝗜𝗡𝗡𝗘𝗥 • ${multiplier}X\n` +
            `💰 Won: +${formatMoney(winAmount)}$`
          : `💔 𝗡𝗢 𝗠𝗔𝗧𝗖𝗛\n` +
            `💸 Lost: -${formatMoney(betAmount)}$`
      ) +
      `\n💳 Balance: ${formatMoney(finalMoney)}$` +
      `\n🎯 Win Rate: ${winRate}%` +
      `\n🎲 Spins: ${global.slotLimit[senderID].count}/${maxSpins}`;

    return message.reply(resultMessage);
  }
};