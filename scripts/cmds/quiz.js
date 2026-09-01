const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "5.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 9,
    role: 0,
    description: "Play a random quiz with auto-unsend and user restriction",
    category: "GAMES",
    guide: "{pn} | {pn} list"
  },

  onStart: async function ({ event, message, args, api }) {
    const { senderID } = event;
    const BASE_URL = "https://xalman-apis.vercel.app/api/quiz";

    if (args[0] === "list" || args[0] === "total") {
      try {
        const res = await axios.get(`${BASE_URL}?list=true`);
        return message.reply(`📝 𝗤𝗨𝗜𝗭 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘\n━━━━━━━━━━━━━━━━━━\nTotal Questions: ${res.data.total_questions}\nAuthor: ${res.data.author}\nStatus: Active`);
      } catch (e) {
        return message.reply("❌ Could not fetch quiz info.");
      }
    }

    try {
      const res = await axios.get(BASE_URL);
      const quiz = res.data;
      if (!quiz.status) return message.reply("❌ API Error.");

      const labels = ["A", "B", "C", "D"];
      let optionsText = "";
      quiz.options.forEach((opt, index) => {
        optionsText += `${labels[index]}. ${opt}\n`;
      });

      const msgText = `📝 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡:\n${quiz.question}\n\n${optionsText}\n━━━━━━━━━━━━━━━━━━\n⏳ You have 60s to reply!\n`;

      return message.reply(msgText, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          correctAnswer: quiz.answer,
          correctText: quiz.correct_text
        });

        setTimeout(() => {
          if (global.GoatBot.onReply.has(info.messageID)) {
            api.unsendMessage(info.messageID);
            global.GoatBot.onReply.delete(info.messageID);
          }
        }, 60000);
      });

    } catch (e) {
      return message.reply("❌ Server Error.");
    }
  },

  onReply: async function ({ event, Reply, message, usersData, api }) {
    const { senderID, body } = event;

    if (senderID !== Reply.author) {
      return message.reply(`ιʂ ɳσƚ ყσυɾ ϙυιȥ ႦႦყ 🐸`);
    }

    const userAnswer = body.trim().toUpperCase();
    const validOptions = ["A", "B", "C", "D"];
    if (!validOptions.includes(userAnswer)) return;

    try {
      let resultMsg = "";
      if (userAnswer === Reply.correctAnswer) {
        const reward = 500;
        const userData = await usersData.get(senderID);
        const currentMoney = parseInt(userData.money || 0);
        await usersData.set(senderID, { money: currentMoney + reward });
        resultMsg = `✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁!\n━━━━━━━━━━━━━━━━━━\n📖 Explanation: ${Reply.correctText}\n💰 Reward: +$${reward}`;
      } else {
        resultMsg = `❌ 𝗪𝗿𝗼𝗻𝗴!\n━━━━━━━━━━━━━━━━━━\n📖 Correct Answer: ${Reply.correctAnswer}. ${Reply.correctText}`;
      }

      message.reply(resultMsg, (err, info) => {
        setTimeout(() => {
          api.unsendMessage(info.messageID);
          api.unsendMessage(Reply.messageID);
        }, 10000);
      });

      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (e) {
      return message.reply("❌ Processing Error.");
    }
  }
};
