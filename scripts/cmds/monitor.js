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

module.exports = {
  config: {
    name: "monitor",
    aliases: ["addmonitor"],
    version: "1.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Add a URL to the uptime monitoring system" },
    category: "tools",
    guide: { en: "{pn} <name> <url>" }
  },

  onStart: async function ({ message, args, event, api }) {
    const name = args[0];
    const url = args[1];

    if (!name || !url) {
      return message.reply("⚠️ Usage: monitor <name> <url>");
    }

    // startsWith("http") also lets "httpfoo" through — check it's a real http(s) URL.
    if (!/^https?:\/\/.+/i.test(url)) {
      return message.reply("❌ Invalid URL! It must start with http:// or https://");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const baseUrl = await getApiBaseUrl();
      const res = await axios.get(`${baseUrl}/api/monitor/add`, {
        params: { name, url },
        timeout: 15000
      });

      if (res.data?.status === true) {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        let msg = `✅ 𝗠𝗼𝗻𝗶𝘁𝗼𝗿 𝗔𝗱𝗱𝗲𝗱!\n━━━━━━━━━━━━━━━━━━\n👤 Name: ${name}\n🔗 URL: ${url}\n📝 Status: Success`;

        return message.reply(msg);
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ Failed: ${res.data?.message || "Rejected"}`);
      }

    } catch (error) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);

      // Log the real cause so this is actually debuggable, and surface the
      // server's own error message/status when there is one instead of a
      // generic line every time.
      console.error("[monitor command] request failed:", error.message);
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      const statusCode = error.response?.status;

      if (serverMsg) {
        return message.reply(`❌ API Error${statusCode ? ` (${statusCode})` : ""}: ${serverMsg}`);
      }
      return message.reply(`❌ API Server Error: ${error.message}`);
    }
  }
};
