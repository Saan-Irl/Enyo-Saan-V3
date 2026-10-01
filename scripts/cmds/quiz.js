const axios = require("axios");

const API_CONFIG_URL = "https://raw.githubusercontent.com/goatbotnx/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";
let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const baseUrl = data?.[API_KEY];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${API_KEY}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}

const CATEGORY_ALIASES = {
  bn: "bn",
  bangla: "bn",
  bengali: "bn",
  en: "en",
  english: "en",
  math: "math",
  maths: "math",
  mathematics: "math"
};

const CATEGORY_LABELS = {
  bn: "🇧🇩 Bangla",
  en: "🇬🇧 English",
  math: "🧮 Math"
};

function normalizeCategory(input) {
  if (!input) return null;
  const key = String(input).toLowerCase().trim();
  return CATEGORY_ALIASES[key] || null;
}

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "8.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    description: "Play a random quiz with elegant design and automatic clean-up",
    category: "GAMES",
    guide:
      "{pn} : random bangla quiz\n" +
      "{pn} bn / bangla : bangla quiz\n" +
      "{pn} en / english : english quiz\n" +
      "{pn} math : math quiz\n" +
      "{pn} list : total questions (all categories)\n" +
      "{pn} list <category> : total questions in a category"
  },

  onStart: async function ({ event, message, args, api }) {
    const { senderID } = event;
    const BASE_URL = `${await getApiBaseUrl()}/api/quiz`;

    // QUIZ DATABASE LIST
    if (args[0] === "list" || args[0] === "total") {
      const rawCategory = args[1];
      const category = normalizeCategory(rawCategory);

      if (rawCategory && !category) {
        return message.reply(
          `❌ Invalid category: "${rawCategory}"\n` +
          `Valid: bn, en, math`
        );
      }

      try {
        const url = category
          ? `${BASE_URL}?list=true&category=${category}`
          : `${BASE_URL}?list=true`;

        const res = await axios.get(url);
        const data = res.data;

        let listMsg;

        if (data.by_category) {
          listMsg =
            `📊 𝗤𝗨𝗜𝗭 𝗦𝗧𝗔𝗧𝗦\n` +
            `━━━━━━━━━━━━━━\n` +
            `📝 Total : ${data.total_questions}\n` +
            `🇧🇩 Bangla : ${data.by_category.bn}\n` +
            `🇬🇧 English : ${data.by_category.en}\n` +
            `🧮 Math : ${data.by_category.math}\n` +
            `🟢 Status : Active`;
        } else {
          listMsg =
            `📊 𝗤𝗨𝗜𝗭 𝗦𝗧𝗔𝗧𝗦 (${data.category})\n` +
            `━━━━━━━━━━━━━━\n` +
            `📝 Total : ${data.total_questions}\n` +
            `🟢 Status : Active`;
        }

        return message.reply(listMsg);
      } catch (e) {
        return message.reply(
          "❌ Unable to fetch quiz database information."
        );
      }
    }

    // CATEGORY
    const rawCategory = args[0];
    const requestedCategory = normalizeCategory(rawCategory);

    if (rawCategory && !requestedCategory) {
      return message.reply(
        `❌ Invalid category: "${rawCategory}"\n` +
        `Valid: bn, en, math\n\n` +
        `Usage:\n${this.config.guide.replace(
          /{pn}/g,
          this.config.name
        )}`
      );
    }

    try {
      const url = requestedCategory
        ? `${BASE_URL}?category=${requestedCategory}`
        : BASE_URL;

      const res = await axios.get(url);
      const quiz = res.data;

      if (!quiz.status) {
        return message.reply("❌ API returned an invalid response.");
      }

      const categoryLabel =
        CATEGORY_LABELS[quiz.category] || quiz.category;

      const labels = ["A", "B", "C", "D"];

      const optionsText = quiz.options
        .map((opt, index) => `〔${labels[index]}〕 ${opt}`)
        .join("\n");

      // COMPACT PREMIUM QUIZ
      const msgText =
        `🧠 𝗤𝗨𝗜𝗭 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘 • ${categoryLabel}\n` +
        `╭──────────────╮\n` +
        `❓ ${quiz.question}\n` +
        `╰──────────────╯\n\n` +
        `${optionsText}\n\n` +
        `⏳ Reply with A, B, C or D • 60s`;

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
      return message.reply(
        "❌ Unable to establish a connection with the quiz server."
      );
    }
  },

  onReply: async function ({ event, Reply, message, usersData, api }) {
    const { senderID, body } = event;

    if (senderID !== Reply.author) return;

    const userAnswer = body.trim().toUpperCase();
    const validOptions = ["A", "B", "C", "D"];

    if (!validOptions.includes(userAnswer)) return;

    try {
      api.unsendMessage(Reply.messageID);

      let resultMsg = "";

      if (userAnswer === Reply.correctAnswer) {
        const reward = 2000;
        const userData = await usersData.get(senderID);
        const currentMoney = parseInt(userData.money || 0);

        await usersData.set(senderID, {
          money: currentMoney + reward
        });

        resultMsg =
          `🎉 𝗖𝗢𝗥𝗥𝗘𝗖𝗧!\n` +
          `╭──────────────╮\n` +
          `✅ Choice: ${userAnswer}\n` +
          `📖 ${Reply.correctText}\n` +
          `💰 +${reward.toLocaleString()} ৳\n` +
          `╰──────────────╯`;
      } else {
        resultMsg =
          `😞 𝗪𝗥𝗢𝗡𝗚!\n` +
          `╭──────────────╮\n` +
          `❌ Choice: ${userAnswer}\n` +
          `✅ Answer: ${Reply.correctAnswer}\n` +
          `📖 ${Reply.correctText}\n` +
          `╰──────────────╯`;
      }

      message.reply(resultMsg);
      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (e) {
      console.error(e);
      return message.reply(
        "❌ An unexpected error occurred while processing your answer."
      );
    }
  }
};