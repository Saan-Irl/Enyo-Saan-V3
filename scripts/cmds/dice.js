module.exports = {
  config: {
    name: "dice",
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 5,
    category: "GAMES",
    guide: {
      en: "{pn} <amount> [guess]  | guess: 2-12 (optional, random if not given)"
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
    const maxBet = 100000000000;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎲 Minimum bet is 100$\nExample: /dice 1k 7`);
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

    let guess = parseInt(args[1]);
    if (isNaN(guess) || guess < 2 || guess > 12) {
      guess = Math.floor(Math.random() * 11) + 2;
    }

    if (!global.diceLimit) global.diceLimit = {};
    const now = Date.now();
    if (!global.diceLimit[senderID] || (now - global.diceLimit[senderID].lastReset > 3600000)) {
      global.diceLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxPlays = 100;
    if (global.diceLimit[senderID].count >= maxPlays) {
      return message.reply(`🚫 Daily limit reached (${maxPlays} plays)`);
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;

    const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const display = `${diceEmojis[dice1-1]} ${diceEmojis[dice2-1]} = ${sum}`;

    const win = guess === sum;

    let multiplier = 0;
    if (win) {
      const probabilities = {
        2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36,
        6: 5/36, 7: 6/36, 8: 5/36, 9: 4/36,
        10: 3/36, 11: 2/36, 12: 1/36
      };
      const prob = probabilities[sum] || 0;
      if (prob > 0) {
        multiplier = Math.round(1 / prob);
      }
    }

    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    global.diceLimit[senderID].count++;

    const status = win ? `WIN ${multiplier}x 🎉` : "LOSE 💀";
    const resultMsg = win ? `🎯 You guessed ${guess} and it matched!` : `❌ You guessed ${guess}, but the sum was ${sum}.`;

    const replyMsg = `🎲 𝗗𝗜𝗖𝗘 𝗚𝗔𝗠𝗘
──────────────
🎲 ${display}
📢 ${status}
${resultMsg}
💰 ${win ? "Won: " + formatMoney(bonus) : "Lost: " + formatMoney(betAmount)}$
💳 Balance: ${formatMoney(finalMoney)}$
📊 Usage: ${global.diceLimit[senderID].count}/${maxPlays}`;

    return message.reply(replyMsg);
  }
};
