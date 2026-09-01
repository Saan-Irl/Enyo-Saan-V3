const axios = require("axios");

module.exports = {
  config: {
    name: "translate",
    aliases: ["trans", "tr"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Translate text with language info",
    category: "tools",
    guide: "{pn} [text] | [target_lang] or reply with {pn} [target_lang]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/translate";

    let textToTranslate;
    let targetLang = "bn";

    if (type === "message_reply") {
      textToTranslate = messageReply.body;
      if (args[0]) targetLang = args[0];
    } else {
      const content = args.join(" ");
      if (!content) return api.sendMessage("╭─❍\n│ Usage: {pn} Text | Lang\n│ Reply: {pn} Lang\n╰───────────⟡", threadID, messageID);

      const splitContent = content.split("|");
      textToTranslate = splitContent[0].trim();
      if (splitContent[1]) targetLang = splitContent[1].trim();
    }

    api.setMessageReaction("🌐", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?text=${encodeURIComponent(textToTranslate)}&to=${targetLang}`);

      if (res.data.status === true) {
        const { translated, from_lang, to_lang } = res.data;
        
        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage(
          `${translated}\n\n━━━━━━━━━━━━━━━━━━\n🌐 ${from_lang.toUpperCase()} ➔ ${to_lang.toUpperCase()}`, 
          threadID, messageID
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Translation failed!", threadID, messageID);
    }
  }
};
