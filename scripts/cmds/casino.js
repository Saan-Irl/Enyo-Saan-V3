async function emojiEdit(api, threadID, emojis, delay = 700) {
  return new Promise(async (resolve) => {
    api.sendMessage(emojis[0], threadID, async (err, info) => {
      if (err) return resolve(null);
      const msgID = info.messageID;
      for (let i = 1; i < emojis.length; i++) {
        await new Promise(r => setTimeout(r, delay));
        api.editMessage(emojis[i], msgID);
      }
      resolve(msgID);
    });
  });
}

module.exports = {
  config: {
    name: "casino",
    version: "3.1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    category: "GAMES",
    shortDescription: "Casino games — big/small, even/odd, lottery, difference, slot",
    guide: "{p}casino [game] [args] [amount]"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const moneyUser = await usersData.get(senderID, "money") || 0;
    const prefix = global.GoatBot.config.prefix;
    const choose = (args[0] || "").toLowerCase();

    // MENU — no animation, single sendMessage
    if (!choose) {
      return api.sendMessage(
`🎰 WELCOME TO CASINO 🎰

🎲 1. Big / Small → ${prefix}casino big/small [amount]
🎴 2. Even / Odd → ${prefix}casino even/odd [amount]
💸 3. Lottery → ${prefix}casino lottery [guess 0-99] [amount]
🎫 4. Difference → ${prefix}casino diff [guess 1-6] [amount]
🍒 5. Slot → ${prefix}casino slot [amount]

💰 Minimum bet: 50$
💵 Your balance: ${moneyUser.toLocaleString()}$`,
        threadID, messageID
      );
    }

    // BIG / SMALL
    if (choose === "big" || choose === "small") {
      const bet = parseInt(args[1]);
      if (!bet || bet < 50) return api.sendMessage("❌ Minimum bet is 50$", threadID, messageID);
      if (moneyUser < bet) return api.sendMessage(`❌ Not enough money!\n💵 Balance: ${moneyUser.toLocaleString()}$`, threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎲", "🎲 🎲", "🎲 🎲 🎲"], 500);
      if (!loadID) return;

      const dice = Math.floor(Math.random() * 6) + 1;
      const result = dice >= 4 ? "big" : "small";
      const win = choose === result;

      if (win) await usersData.addMoney(senderID, bet);
      else await usersData.subtractMoney(senderID, bet);

      return api.editMessage(
`🎲 BIG / SMALL 🎲

🎯 You chose: ${choose.toUpperCase()}
🎲 Dice: ${dice} → ${result.toUpperCase()}

${win ? `🎉 YOU WON!\n💰 +${bet.toLocaleString()}$` : `😢 YOU LOST!\n💸 -${bet.toLocaleString()}$`}
💵 Balance: ${(moneyUser + (win ? bet : -bet)).toLocaleString()}$`,
        loadID
      );
    }

    // EVEN / ODD
    if (choose === "even" || choose === "odd") {
      const bet = parseInt(args[1]);
      if (!bet || bet < 50) return api.sendMessage("❌ Minimum bet is 50$", threadID, messageID);
      if (moneyUser < bet) return api.sendMessage(`❌ Not enough money!\n💵 Balance: ${moneyUser.toLocaleString()}$`, threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎴", "🎴 ➡️", "🎴 ➡️ 🎴"], 500);
      if (!loadID) return;

      const num = Math.floor(Math.random() * 100);
      const result = num % 2 === 0 ? "even" : "odd";
      const win = choose === result;

      if (win) await usersData.addMoney(senderID, bet);
      else await usersData.subtractMoney(senderID, bet);

      return api.editMessage(
`🎴 EVEN / ODD 🎴

🎯 You chose: ${choose.toUpperCase()}
🔢 Number: ${num} → ${result.toUpperCase()}

${win ? `🎉 YOU WON!\n💰 +${bet.toLocaleString()}$` : `😢 YOU LOST!\n💸 -${bet.toLocaleString()}$`}
💵 Balance: ${(moneyUser + (win ? bet : -bet)).toLocaleString()}$`,
        loadID
      );
    }

    // LOTTERY
    if (choose === "lottery") {
      const guess = parseInt(args[1]);
      const bet = parseInt(args[2]);
      if (isNaN(guess) || guess < 0 || guess > 99)
        return api.sendMessage("❌ Guess a number 0–99\nUsage: casino lottery [0-99] [amount]", threadID, messageID);
      if (!bet || bet < 50) return api.sendMessage("❌ Minimum bet is 50$", threadID, messageID);
      if (moneyUser < bet) return api.sendMessage(`❌ Not enough money!\n💵 Balance: ${moneyUser.toLocaleString()}$`, threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["💸", "💸 💸", "💸 💸 💸"], 400);
      if (!loadID) return;

      const result = Math.floor(Math.random() * 100);
      const win = guess === result;

      if (win) await usersData.addMoney(senderID, bet * 9);
      else await usersData.subtractMoney(senderID, bet);

      return api.editMessage(
`💸 LOTTERY 💸

🎯 Your guess: ${guess}
🎲 Result: ${result}

${win ? `🎉 JACKPOT!\n💰 +${(bet * 10).toLocaleString()}$ (10x)` : `😢 YOU LOST!\n💸 -${bet.toLocaleString()}$`}
💵 Balance: ${(moneyUser + (win ? bet * 9 : -bet)).toLocaleString()}$`,
        loadID
      );
    }

    // DIFFERENCE
    if (choose === "diff" || choose === "difference") {
      const guess = parseInt(args[1]);
      const bet = parseInt(args[2]);
      if (isNaN(guess) || guess < 1 || guess > 6)
        return api.sendMessage("❌ Guess a number 1–6\nUsage: casino diff [1-6] [amount]", threadID, messageID);
      if (!bet || bet < 50) return api.sendMessage("❌ Minimum bet is 50$", threadID, messageID);
      if (moneyUser < bet) return api.sendMessage(`❌ Not enough money!\n💵 Balance: ${moneyUser.toLocaleString()}$`, threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎫", "🎫 🎲", "🎫 🎲 🎫"], 500);
      if (!loadID) return;

      const result = Math.floor(Math.random() * 6) + 1;
      const win = guess === result;

      if (win) await usersData.addMoney(senderID, bet * 5);
      else await usersData.subtractMoney(senderID, bet);

      return api.editMessage(
`🎫 DIFFERENCE 🎫

🎯 Your guess: ${guess}
🎲 Dice: ${result}

${win ? `🎉 YOU WON!\n💰 +${(bet * 5).toLocaleString()}$ (5x)` : `😢 YOU LOST!\n💸 -${bet.toLocaleString()}$`}
💵 Balance: ${(moneyUser + (win ? bet * 5 : -bet)).toLocaleString()}$`,
        loadID
      );
    }

    // SLOT
    if (choose === "slot") {
      const bet = parseInt(args[1]);
      if (!bet || bet < 50) return api.sendMessage("❌ Minimum bet is 50$", threadID, messageID);
      if (moneyUser < bet) return api.sendMessage(`❌ Not enough money!\n💵 Balance: ${moneyUser.toLocaleString()}$`, threadID, messageID);

      const loadID = await emojiEdit(api, threadID, ["🎰", "🎰 🎲", "🎰 🎲 🎰", "🎰 🎲 🎰 🎲"], 600);
      if (!loadID) return;

      const items = ["🍒", "🍉", "🍊", "🍏", "🍓", "🍌", "⭐", "💎"];
      const a = items[Math.floor(Math.random() * items.length)];
      const b = items[Math.floor(Math.random() * items.length)];
      const c = items[Math.floor(Math.random() * items.length)];

      const jackpot = a === b && b === c;
      const partial = !jackpot && (a === b || b === c || a === c);

      if (jackpot) await usersData.addMoney(senderID, bet * 4);
      else if (partial) await usersData.addMoney(senderID, bet);
      else await usersData.subtractMoney(senderID, bet);

      return api.editMessage(
`🍒 SLOT MACHINE 🍒

${a} ${b} ${c}

${jackpot
  ? `🎰 JACKPOT! ALL MATCH!\n💰 +${(bet * 5).toLocaleString()}$ (5x)`
  : partial
  ? `✨ PARTIAL MATCH!\n💰 +${bet.toLocaleString()}$ (2x)`
  : `😢 NO MATCH!\n💸 -${bet.toLocaleString()}$`}
💵 Balance: ${(moneyUser + (jackpot ? bet * 4 : partial ? bet : -bet)).toLocaleString()}$`,
        loadID
      );
    }

    return api.sendMessage(
      `❓ Unknown game.\n\n🎰 Games: big, small, even, odd, lottery, diff, slot\nType ${prefix}casino to see the menu.`,
      threadID, messageID
    );
  }
};
