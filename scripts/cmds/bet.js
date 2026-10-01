module.exports = {
  config: {
    name: "bet",
    version: "12.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    shortDescription: {
      en: "Random multiplier bet game with 5-hour limit"
    },
    longDescription: {
      en: "Place a bet and win. 55% normal win, 2% normal loss, 2% jackpot and 41% draw. 12 plays per 5 hours with 12 seconds cooldown."
    },
    category: "GAMES",
  },

  langs: {
    en: {
      invalid_amount:
        "❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗔𝗠𝗢𝗨𝗡𝗧\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "⚠️ Minimum bet: 1,000৳\n" +
        "💡 Usage: /bet 100k | all",

      not_enough_money:
        "🚫 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "💵 Balance: %1৳\n" +
        "💸 You need more money to play!",

      max_bet:
        "🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🚫 Max bet limit: 500M\n" +
        "⚠️ High stakes blocked by system!",

      cooldown:
        "⏳ 𝗖𝗢𝗢𝗟𝗗𝗢𝗪𝗡\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "⚠️ Please wait %1 seconds before betting again.",

      limit_reached:
        "🚫 𝗟𝗜𝗠𝗜𝗧 𝗥𝗘𝗔𝗖𝗛𝗘𝗗\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "⚠️ You've played 12 times in 5 hours.\n" +
        "⏳ Try again in %1 minutes.",

      win:
        "✨ 𝗪𝗜𝗡𝗡𝗘𝗥 𝗗𝗘𝗖𝗟𝗔𝗥𝗘𝗗 ✨\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "💰 𝗦𝘁𝗮𝘁𝘂𝘀: SUCCESS\n" +
        "📈 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿: %1×\n" +
        "💵 𝗣𝗿𝗼𝗳𝗶𝘁: +%2৳\n" +
        "💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %3৳\n" +
        "📊 𝗨𝘀𝗮𝗴𝗲: %4/12\n" +
        "━━━━━━━━━━━━━━━━━━",

      jackpot:
        "🔥 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 𝗕𝗢𝗡𝗨𝗦 🔥\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "💎 𝗥𝗮𝗿𝗶𝘁𝘆: LEGENDARY\n" +
        "🎰 𝗥𝗲𝘄𝗮𝗿𝗱: 50× Multiplier\n" +
        "💰 𝗔𝗺𝗼𝘂𝗻𝘁: +%1৳\n" +
        "💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n" +
        "📊 𝗨𝘀𝗮𝗴𝗲: %3/12\n" +
        "━━━━━━━━━━━━━━━━━━",

      lose:
        "💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥 💀\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🔻 𝗦𝘁𝗮𝘁𝘂𝘀: FAILED\n" +
        "📉 𝗟𝘂𝗰𝗸: EXPIRED\n" +
        "💸 𝗟𝗼𝘀𝘁: -%1৳\n" +
        "💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n" +
        "📊 𝗨𝘀𝗮𝗴𝗲: %3/12\n" +
        "━━━━━━━━━━━━━━━━━━",

      draw:
        "⚖️ 𝗗𝗥𝗔𝗪 𝗥𝗘𝗦𝗨𝗟𝗧\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "🔄 𝗦𝘁𝗮𝘁𝘂𝘀: DRAW\n" +
        "💰 𝗣𝗿𝗼𝗳𝗶𝘁: +0৳\n" +
        "💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %1৳\n" +
        "📊 𝗨𝘀𝗮𝗴𝗲: %2/12\n" +
        "━━━━━━━━━━━━━━━━━━"
    },
  },

  onStart: async function ({
    args,
    message,
    event,
    usersData,
    getLang
  }) {
    const { senderID } = event;

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;
    const input = args[0]?.toLowerCase();

    if (!input) {
      return message.reply(
        "❓ Syntax: /bet <amount/all/max>"
      );
    }

    // ==============================
    // BET SETTINGS
    // ==============================

    const MIN_BET = 1000;
    const MAX_BET = 500000000; // 500M

    const PLAY_LIMIT = 12;
    const RESET_TIME = 5 * 60 * 60 * 1000; // 5 hours
    const COOLDOWN = 12 * 1000; // 12 seconds

    // ==============================
    // GLOBAL BET DATA
    // ==============================

    if (!global.betLimit) {
      global.betLimit = {};
    }

    const now = Date.now();

    if (!global.betLimit[senderID]) {
      global.betLimit[senderID] = {
        count: 0,
        lastReset: now,
        lastPlay: 0
      };
    }

    const userLimit = global.betLimit[senderID];

    // ==============================
    // RESET AFTER 5 HOURS
    // ==============================

    if (now - userLimit.lastReset >= RESET_TIME) {
      userLimit.count = 0;
      userLimit.lastReset = now;
    }

    // ==============================
    // 12 SECOND COOLDOWN
    // ==============================

    const timeSinceLastPlay =
      now - userLimit.lastPlay;

    if (
      userLimit.lastPlay > 0 &&
      timeSinceLastPlay < COOLDOWN
    ) {
      const remaining = Math.ceil(
        (COOLDOWN - timeSinceLastPlay) / 1000
      );

      return message.reply(
        getLang("cooldown", remaining)
      );
    }

    // ==============================
    // 12 PLAYS / 5 HOURS
    // ==============================

    if (userLimit.count >= PLAY_LIMIT) {
      const timeLeft = Math.ceil(
        (RESET_TIME -
          (now - userLimit.lastReset)) /
        (1000 * 60)
      );

      return message.reply(
        getLang("limit_reached", timeLeft)
      );
    }

    // ==============================
    // FORCE WIN
    // ==============================

    const isForceWin = input.endsWith(".win");

    const cleanInput = isForceWin
      ? input.replace(".win", "")
      : input;

    // ==============================
    // AMOUNT PARSER
    // ==============================

    function parseAmount(str, userBal) {
      if (str === "all") {
        return userBal;
      }

      if (str === "max") {
        return MAX_BET;
      }

      const units = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12
      };

      const match = str.match(
        /^(\d+(\.\d+)?)([kmbt])?$/
      );

      if (!match) {
        return null;
      }

      const num = parseFloat(match[1]);
      const unit = match[3];

      return unit
        ? num * units[unit]
        : num;
    }

    const bet = parseAmount(
      cleanInput,
      balance
    );

    // ==============================
    // VALIDATION
    // ==============================

    if (
      bet === null ||
      isNaN(bet) ||
      !isFinite(bet) ||
      bet < MIN_BET
    ) {
      return message.reply(
        getLang("invalid_amount")
      );
    }

    if (bet > MAX_BET) {
      return message.reply(
        getLang("max_bet")
      );
    }

    if (balance < bet) {
      return message.reply(
        getLang(
          "not_enough_money",
          format(balance)
        )
      );
    }

    // ==============================
    // COUNT PLAY
    // ==============================

    userLimit.count++;
    userLimit.lastPlay = now;

    const currentUsage = userLimit.count;

    // ==============================
    // RESULT SYSTEM
    // ==============================

    let finalBal = balance;
    let outMsg = "";

    const rand = Math.random();

    /*
      Probability:

      0%   -  2% = JACKPOT  (2%)
      2%   - 57% = WIN      (55%)
      57%  - 59% = LOSS     (2%)
      59%  -100% = DRAW     (41%)
    */

    if (rand < 0.02 && !isForceWin) {

      // ==========================
      // JACKPOT — 2%
      // ==========================

      const jackpot = bet * 50;

      finalBal += jackpot;

      outMsg = getLang(
        "jackpot",
        format(jackpot),
        format(finalBal),
        currentUsage
      );

    } else if (
      rand < 0.57 ||
      isForceWin
    ) {

      // ==========================
      // NORMAL WIN — 55%
      // ==========================

      const multi = (
        Math.random() * (2.0 - 1.2) + 1.2
      ).toFixed(1);

      const win = Math.floor(
        bet * (parseFloat(multi) - 1)
      );

      finalBal += win;

      outMsg = getLang(
        "win",
        multi,
        format(win),
        format(finalBal),
        currentUsage
      );

    } else if (rand < 0.59) {

      // ==========================
      // NORMAL LOSS — 2%
      // ==========================

      finalBal -= bet;

      outMsg = getLang(
        "lose",
        format(bet),
        format(finalBal),
        currentUsage
      );

    } else {

      // ==========================
      // DRAW — 41%
      // ==========================

      outMsg = getLang(
        "draw",
        format(finalBal),
        currentUsage
      );
    }

    // ==============================
    // SAVE BALANCE
    // ==============================

    await usersData.set(senderID, {
      money: finalBal
    });

    // ==============================
    // DIRECT RESULT
    // No loading message
    // No editMessage
    // ==============================

    return message.reply(outMsg);

    // ==============================
    // MONEY FORMAT
    // ==============================

    function format(n) {
      if (n >= 1e12) {
        return (
          (n / 1e12).toFixed(2) + "T"
        );
      }

      if (n >= 1e9) {
        return (
          (n / 1e9).toFixed(2) + "B"
        );
      }

      if (n >= 1e6) {
        return (
          (n / 1e6).toFixed(2) + "M"
        );
      }

      if (n >= 1e3) {
        return (
          (n / 1e3).toFixed(2) + "K"
        );
      }

      return Math.floor(n).toLocaleString();
    }
  },
};