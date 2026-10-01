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

if (!global.deepAiSessions) {
  global.deepAiSessions = new Map();
}

async function askDeepAi(prompt, session) {
  const baseUrl = await getApiBaseUrl();

  const res = await axios.get(`${baseUrl}/api/deepai-chat`, {
    params: { prompt, session: session || "" },
    timeout: 60000,
    validateStatus: () => true
  });

  const data = res.data;
  if (!data?.status || !data?.result) {
    throw new Error(data?.message || "Failed to get a response from DeepAI.");
  }

  return { result: data.result, session: data.session };
}

module.exports = {
  config: {
    name: "ai",
    aliases: ["deepai"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Chat with DeepAI" },
    longDescription: { en: "Multi-turn chat with DeepAI" },
    category: "AI",
    guide: {
      en: "{p}ai <your prompt> (Reply to continue or reply 'close' to stop)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return message.reply("⚠️ Please provide a prompt or question.");
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const { result, session } = await askDeepAi(prompt, null);

      api.setMessageReaction("✅", messageID, () => {}, true);

      const sentMsg = await message.reply(`${result}\n\n💡 _Reply to continue or reply 'close' to exit session._`);

      global.deepAiSessions.set(senderID, {
        session,
        lastMsgID: sentMsg.messageID
      });

      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        author: senderID,
        type: "deepai_chat"
      });
    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      const errMsg = error.response?.data?.message || error.message;
      return message.reply(`❌ Error: ${errMsg}`);
    }
  },

  onReply: async function ({ api, event, message, Reply }) {
    const { senderID, body, messageID } = event;

    if (Reply.author !== senderID) {
      return message.reply("⚠️ You cannot reply to someone else's conversation.");
    }

    const sessionData = global.deepAiSessions.get(senderID);

    if (!sessionData) {
      return message.reply("❌ Session expired or not found. Please start a new chat with `.ai <prompt>`.");
    }

    const userText = body.trim();

    if (userText.toLowerCase() === "close" || userText.toLowerCase() === "stop") {
      global.deepAiSessions.delete(senderID);
      api.setMessageReaction("🔴", messageID, () => {}, true);
      return message.reply("🛑 Session closed successfully.");
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const { result, session } = await askDeepAi(userText, sessionData.session);

      api.setMessageReaction("✅", messageID, () => {}, true);

      const sentMsg = await message.reply(`${result}\n\n💡 _Reply to continue or reply 'close' to exit._`);

      sessionData.session = session;
      sessionData.lastMsgID = sentMsg.messageID;
      global.deepAiSessions.set(senderID, sessionData);

      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        author: senderID,
        type: "deepai_chat"
      });
    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      const errMsg = error.response?.data?.message || error.message;
      return message.reply(`❌ Error: ${errMsg}`);
    }
  }
};
