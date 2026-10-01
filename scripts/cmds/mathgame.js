module.exports = {
  config: {
    name: "mathgame",
    aliases: ["math"],
    version: "6.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    category: "GAMES"
  },

  onStart: async function ({ event, args, message, usersData }) {
    const axios = require("axios");
    const uid = event.senderID;

    if (!args[0]) {
      return message.reply(
`🧮 MATH GAME GUIDE
────────────
📌 Usage:
➤ /mathgame easy
➤ /mathgame medium
➤ /mathgame hard
➤ /math easy

🎮 Rules:
• সঠিক উত্তর: +300 Coins, +100 XP
• ভুল উত্তর: -100 Coins

⏱ সময়: 60 সেকেন্ড`
      );
    }

    const level = args[0].toLowerCase();
    if (!["easy", "medium", "hard"].includes(level)) {
      return message.reply(
`⚠️ Invalid Level!

✔ Use only:
• easy
• medium
• hard`
      );
    }

    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    const userData = await usersData.get(uid) || {};
    let mathHistory = userData.mathHistory || [];

    mathHistory = mathHistory.filter(t => now - t < ONE_HOUR);

    if (mathHistory.length >= 30) {
      const oldest = mathHistory[0];
      const remainingMs = (oldest + ONE_HOUR) - now;
      const remainingMin = Math.ceil(remainingMs / 60000);

      return message.reply(
`⛔ Hourly Limit Reached
────────────
🎮 Played: 30 / 30
⏳ Try again in ${remainingMin} minute(s)`
      );
    }

    mathHistory.push(now);
    await usersData.set(uid, { ...userData, mathHistory });

    try {
      const cfg = await axios.get(
        "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"
      );

      const baseUrl = cfg.data.math;
      const res = await axios.get(`${baseUrl}/api/game?level=${level}`);

      const { question, answer, options } = res.data;
      const correctIndex = options.indexOf(answer) + 1;

      const optText = options.map((o, i) => ` ${i + 1}. ${o}`).join("\n");

      const quizMsg =
`🧮 MATH QUIZ (${level.toUpperCase()})
────────────
❓ ${question} = ?

${optText}

⏱ Time: 60 seconds
✏️ Reply 1-4 only`;

      message.reply(quizMsg, (err, info) => {
        if (err) return;

        const timeout = setTimeout(() => {
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }, 60 * 1000);

        // ✅ FIXED (Alias + Main name both work)
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: uid,
          correctIndex,
          answer,
          quizMsgID: info.messageID,
          timeout
        });
      });

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Failed to load quiz.");
    }
  },

  onReply: async function ({ event, Reply, message, usersData }) {
    if (!Reply) return;

    const { author, correctIndex, answer, quizMsgID, timeout } = Reply;

    if (event.senderID !== author) return;

    clearTimeout(timeout);

    const userReply = event.body.trim();
    const userData = await usersData.get(author) || {};

    try {
      await message.unsend(quizMsgID);
    } catch {}

    try {
      await message.unsend(event.messageID);
    } catch {}

    if (userReply == correctIndex) {

      await usersData.set(author, {
        ...userData,
        money: (userData.money || 0) + 300,
        exp: (userData.exp || 0) + 100
      });

      message.reply(
`✅ Correct Answer!
🎯 ${answer}
💰 +300 Coins
⭐ +100 XP`
      );

    } else if (["1","2","3","4"].includes(userReply)) {

      await usersData.set(author, {
        ...userData,
        money: Math.max((userData.money || 0) - 100, 0)
      });

      message.reply(
`❌ Wrong Answer!
✔ Correct: ${answer}
💸 -100 Coins`
      );
    }

    global.GoatBot.onReply.delete(quizMsgID);
  }
};
