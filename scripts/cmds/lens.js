const axios = require("axios");

module.exports = {
  config: {
    name: "lens",
    aliases: ["ocr"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Extract text from images (Google Lens)",
    category: "tools",
    guide: "{pn} [reply to image]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/lens";

    let imageUrl;
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else {
      return api.sendMessage("╭─❍\n│ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾!\n╰───────────⟡", threadID, messageID);
    }

    const lang = args[0] || "eng";
    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?url=${encodeURIComponent(imageUrl)}&lang=${lang}`);

      if (res.data.status === true) {
        const extractedText = res.data.text;
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage(
          ` 𝗟𝗘𝗡𝗦 𝗢𝗖𝗥\n━━━━━━━━━━━━━━━━━━\n${extractedText}\n𝗟𝗮𝗻𝗴: ${lang.toUpperCase()}`, 
          threadID, messageID
        );
      } else {
        throw new Error("No text found");
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Failed to extract text from image!", threadID, messageID);
    }
  }
};
