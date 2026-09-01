const axios = require("axios");

module.exports = {
  config: {
    name: "tikinfo",
    aliases: ["ttinfo", "tikuser"],
    version: "1.0.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Get TikTok user profile information",
    category: "tools",
    guide: "{pn} [username]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/tikinfo";

    const username = args[0];
    if (!username) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} [username]\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?username=${encodeURIComponent(username)}`);

      if (res.data.status === true) {
        const user = res.data.result;
        const info = `❖ 𝗧𝗜𝗞𝗧𝗢𝗞 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 ❖\n━━━━━━━━━━━━━━━━━━\n` +
          `👤 𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾: ${user.nickname}\n` +
          `🆔 𝖴𝗌𝖾𝗋𝗇𝖺𝗆𝖾: ${user.username}\n` +
          `📝 𝖲𝗂𝗀𝗇𝖺𝗍𝗎𝗋𝖾: ${user.signature || "No Bio"}\n` +
          `👥 𝖥𝗈𝗅𝗅𝗈𝗐𝖾𝗋𝗌: ${user.followerCount}\n` +
          `👤 𝖥𝗈𝗅𝗅𝗈𝗐𝗂𝗇𝗀: ${user.followingCount}\n` +
          `❤️ 𝖧𝖾𝖺𝗋𝗍𝗌: ${user.heartCount}\n` +
          `🎥 𝖵𝗂𝖽𝖾𝗈𝗌: ${user.videoCount}\n` +
          `━━━━━━━━━━━━━━━━━━`;

        const avatarStream = (await axios.get(user.avatarLarger, { responseType: 'stream' })).data;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage({
          body: info,
          attachment: avatarStream
        }, threadID, messageID);
      } else {
        throw new Error("User not found");
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ TikTok user not found or API error!", threadID, messageID);
    }
  }
};
