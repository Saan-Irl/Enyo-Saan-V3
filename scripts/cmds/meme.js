const axios = require("axios");

module.exports = {
  config: {
    name: "meme",
    aliases: ["randommeme"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Get random memes or check total count",
    category: "fun",
    guide: "{pn} or {pn} list"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const BASE_URL = "https://xalman-apis.vercel.app/api/meme";

    if (args[0] === "list") {
      api.setMessageReaction("📊", messageID, () => {}, true);
      try {
        const res = await axios.get(`${BASE_URL}/list`);
        if (res.data.status === true) {
          const total = res.data.total;
          api.setMessageReaction("✅", messageID, () => {}, true);
          return api.sendMessage(`❖ 𝗠𝗘𝗠𝗘 𝗜𝗡𝗙𝗢 ❖\n━━━━━━━━━━━━━━━━━━\n📊 Total Memes: ${total}\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
        }
      } catch (err) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("✕ Failed to fetch meme list!", threadID, messageID);
      }
    }

    api.setMessageReaction("🐧", messageID, () => {}, true);
    try {
      const response = await axios.get(BASE_URL, { responseType: 'stream' });
      
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: "❖ 𝗥𝗔𝗡𝗗𝗢𝗠 𝗠𝗘𝗠𝗘 ❖\n━━━━━━━━━━━━━━━━━━",
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Failed to fetch meme!", threadID, messageID);
    }
  }
};
