const axios = require("axios");
const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/xnil6x404/Api-Zone/refs/heads/main/Api.json"
  );
  return base.data.x2;
};
module.exports = {
  config: {
    name: "gemini",
    version: "1.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    shortDescription: {
      en: "🧠 Gemini Vision – describe image or text using AI"
    },
    longDescription: {
      en: "Send an image and/or prompt, and Gemini AI will respond intelligently."
    },
    category: "AI & IMAGE GENERATION",
    guide: {
      en: "{pn} [optional prompt] (reply to an image or send image URL)"
    }
  },

  onStart: async function ({ api, event, args }) {
    let imageUrl = null;
    const prompt = args.join(" ") || "What do you see?";

    if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        imageUrl = attachment.url;
      }
    }

    if (!imageUrl && args[0]?.startsWith("http")) {
      imageUrl = args[0];
    }

    const baseUrl = `${await baseApiUrl()}/xnil/geminiv2`;
    const key = "xnil8679926169";
    const apiUrl = `${baseUrl}?prompt=${encodeURIComponent(prompt)}&key=${key}${imageUrl ? `&imgUrl=${encodeURIComponent(imageUrl)}` : ""}`;

    try {
      const res = await axios.get(apiUrl);
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return api.sendMessage("⚠️ Gemini couldn't generate a response.", event.threadID, event.messageID);
      }

      api.sendMessage(`🧠 Gemini:\n${text}`, event.threadID, event.messageID);
    } catch (err) {
      console.error("Gemini API Error:", err.message);
      api.sendMessage("❌ Failed to connect to Gemini API.", event.threadID, event.messageID);
    }
  }
};