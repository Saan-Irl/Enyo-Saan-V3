const axios = require("axios");

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix"],
    version: "1.0.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Mix two emojis into one image",
    category: "FUN & SOCIAL",
    guide: "{pn} [emoji1] [emoji2]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/emojimix";

    if (args.length < 2) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} 🥺 🙏\n╰───────────⟡", threadID, messageID);
    }

    const emoji1 = args[0];
    const emoji2 = args[1];

    api.setMessageReaction("🎨", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`, {
        responseType: 'stream'
      });

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: "❖ 𝗘𝗠𝗢𝗝𝗜-𝗠𝗜𝗫 ❖\n━━━━━━━━━━━━━━━━━━",
        attachment: res.data
      }, threadID, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ These emojis cannot be mixed!", threadID, messageID);
    }
  }
};
