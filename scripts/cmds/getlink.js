const axios = require("axios");

module.exports = {
  config: {
    name: "getlink",
    version: "1.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 5,
    shortDescription: "Get direct link of replied media (image/video/voice)",
    category: "utility"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply) {
      return api.sendMessage("❌ Please reply to an image, video, or voice message.", threadID, messageID);
    }

    const attachments = messageReply.attachments;
    if (!attachments || attachments.length === 0) {
      return api.sendMessage("❌ No attachments found in the replied message.", threadID, messageID);
    }

    try {
      const links = [];

      for (const att of attachments) {
        let url = att.url || null;

        if (!url && att.id) {
          try {
            const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
            const graphRes = await axios.get(`https://graph.facebook.com/${att.id}?access_token=${token}&fields=url`);
            if (graphRes.data && graphRes.data.url) {
              url = graphRes.data.url;
            }
          } catch {
            url = `https://www.facebook.com/photo.php?fbid=${att.id}`;
          }
        }

        if (!url) {
          url = "Unable to retrieve link.";
        }

        const type = att.type || "media";
        links.push(`📎 ${type.charAt(0).toUpperCase() + type.slice(1)}: ${url}`);
      }

      const replyMsg = links.length === 1
        ? `🔗 Direct link:\n${links[0]}`
        : `🔗 Direct links:\n${links.join("\n")}`;

      return api.sendMessage(replyMsg, threadID, messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Failed to fetch attachment link. Please try again.", threadID, messageID);
    }
  }
};
