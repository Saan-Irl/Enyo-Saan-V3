module.exports = {
  config: {
    name: "bet",
    version: "11.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍", // cmd main author tanil full system modified by 𝐒𝐀𝐀𝐍 
    shortDescription: { en: "Random multiplier bet game with hourly limit" },
    longDescription: { en: "Place a bet and win. 50% win rate and 50 plays per hour limit." },
    category: "GAMES",
  },

  langs: {
    en: {
      invalid_amount: "❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗔𝗠𝗢𝗨𝗡𝗧\n━━━━━━━━━━━━━━━━━━\n⚠️ Minimum bet: 1,000৳\n💡 Usage: /bet 100k | all",
      not_enough_money: "🚫 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦\n━━━━━━━━━━━━━━━━━━\n💵 Balance: %1৳\n💸 You need more money to play!",
      max_bet: "🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧\n━━━━━━━━━━━━━━━━━━\n🚫 Max bet limit: 500M\n⚠️ High stakes blocked by system!",
      limit_reached: "🚫 𝗟𝗜𝗠𝗜𝗧 𝗥𝗘𝗔𝗖𝗛𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n⚠️ You've played 50 times this hour.\n⏳ Try again in %1 minutes.",
      spinning: "🎰 𝗕𝗘𝗧𝗧𝗜𝗡𝗚 𝗠𝗔𝗖𝗛𝗜𝗡𝗘\n━━━━━━━━━━━━━━━━━━\n   [ 🔄 𝗦𝗣𝗜𝗡𝗡𝗜𝗡𝗚... 🔄 ]\n━━━━━━━━━━━━━━━━━━\n📡 Connecting to server...",
      win: "✨ 𝗪𝗜𝗡𝗡𝗘𝗥 𝗗𝗘𝗖𝗟𝗔𝗥𝗘𝗗 ✨\n━━━━━━━━━━━━━━━━━━\n💰 𝗦𝘁𝗮𝘁𝘂𝘀: SUCCESS\n📈 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿: %1×\n💵 𝗣𝗿𝗼𝗳𝗶𝘁: +%2৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %3৳\n📊 𝗨𝘀𝗮𝗴𝗲: %4/50\n━━━━━━━━━━━━━━━━━━",
      jackpot: "🔥 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 𝗕𝗢𝗡𝗨𝗦 🔥\n━━━━━━━━━━━━━━━━━━\n💎 𝗥𝗮𝗿𝗶𝘁𝘆: LEGENDARY\n🎰 𝗥𝗲𝘄𝗮𝗿𝗱: 50× Multiplier\n💰 𝗔𝗺𝗼𝘂𝗻𝘁: +%1৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n📊 𝗨𝘀𝗮𝗴𝗲: %3/50\n━━━━━━━━━━━━━━━━━━",
      lose: "💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘─ 💀\n━━━━━━━━━━━━━━━━━━\n🔻 𝗦𝘁𝗮𝘁𝘂𝘀: FAILED\n📉 𝗟𝘂𝗰𝗸: EXPIRED\n💸 𝗟𝗼𝘀𝘁: -%1৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n📊 𝗨𝘀𝗮𝗴𝗲: %3/50\n━━━━━━━━━━━━━━━━━━"
    },
  },

  onStart: async function ({ args, message, event, usersData, api, getLang }) {
    const { senderID, threadID } = event;
    const userData = await usersData.get(senderID);
    let balance = userData.money || 0;
    const input = args[0]?.toLowerCase();

    if (!input) return message.reply("❓ Syntax: /bet <amount/all/max>");

    if (!global.betLimit) global.betLimit = {};
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!global.betLimit[senderID]) {
        global.betLimit[senderID] = { count: 0, lastReset: now };
    }

    if (now - global.betLimit[senderID].lastReset > oneHour) {
        global.betLimit[senderID] = { count: 0, lastReset: now };
    }

    if (global.betLimit[senderID].count >= 50) {
        const timeLeft = Math.ceil((oneHour - (now - global.betLimit[senderID].lastReset)) / (1000 * 60));
        return message.reply(getLang("limit_reached", timeLeft));
    }

    const isForceWin = input.endsWith(".win");
    const cleanInput = isForceWin ? input.replace(".win", "") : input;

    function parseAmount(str, userBal) {
      if (str === "all") return userBal;
      const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
      const match = str.match(/^(\d+(\.\d+)?)([kmbt])?$/);
      if (!match) return null;
      const num = parseFloat(match[1]);
      const unit = match[3];
      return unit ? num * units[unit] : num;
    }

    const bet = parseAmount(cleanInput, balance);
    const max_limit = 500000000;

    if (bet === null || isNaN(bet) || bet < 1000) return message.reply(getLang("invalid_amount"));
    if (bet > max_limit) return message.reply(getLang("max_bet"));
    if (balance < bet) return message.reply(getLang("not_enough_money", format(balance)));

    global.betLimit[senderID].count++;

    const loader = await message.reply(getLang("spinning"));
    const msgID = loader.messageID;

    await new Promise(r => setTimeout(r, 1600));

    let finalBal = balance;
    let outMsg = "";
    const rand = Math.random();
    const currentUsage = global.betLimit[senderID].count;

    if (rand < 0.01 && !isForceWin) { 
      const jackpot = bet * 50;
      finalBal += jackpot;
      outMsg = getLang("jackpot", format(jackpot), format(finalBal), currentUsage);
    } else if (rand < 0.51 || isForceWin) { 
      const multi = (Math.random() * (2.0 - 1.2) + 1.2).toFixed(1);
      const win = Math.floor(bet * (parseFloat(multi) - 1)); 
      finalBal += win;
      outMsg = getLang("win", multi, format(win), format(finalBal), currentUsage);
    } else { 
      finalBal -= bet;
      outMsg = getLang("lose", format(bet), format(finalBal), currentUsage);
    }

    await usersData.set(senderID, { money: finalBal });
    return api.editMessage(outMsg, msgID, threadID);

    function format(n) {
      if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
      return Math.floor(n).toLocaleString();
    }
  },
};
