const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    version: "3.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 3,
    role: 0,
    shortDescription: "Upload media to Imgur (supports multiple)",
    category: "tools",
    guide: "{pn} [reply to any media]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("❌ Please reply to a photo, video, or GIF.", threadID, messageID);
    }

    const mediaUrls = messageReply.attachments.map(att => att.url);
    const waitMsg = await api.sendMessage(`⏳ Uploading ${mediaUrls.length} file(s)...`, threadID, messageID);

    try {
      const results = await Promise.all(
        mediaUrls.map(async (url) => {
          try {
            const res = await axios.get(
              `https://xalman-apis.vercel.app/api/imgur?url=${encodeURIComponent(url)}`
            );
            const imgurUrl = res.data.data?.url || res.data.url;
            return { success: true, url: imgurUrl };
          } catch {
            return { success: false, url: null };
          }
        })
      );

      const successful = results.filter(r => r.success);

      if (successful.length === 0) {
        return api.editMessage("❌ All uploads failed. Please try again.", waitMsg.messageID);
      }

      const links = successful.map(r => r.url).join("\n");
      return api.editMessage(links, waitMsg.messageID);

    } catch (error) {
      console.error(error);
      return api.editMessage("❌ Failed to upload to Imgur. Please try again.", waitMsg.messageID);
    }
  }
};
