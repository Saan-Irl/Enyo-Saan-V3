const axios = require("axios");

module.exports = {
  config: {
    name: "freeimage",
    aliases: ["freeimg", "imghost"],
    version: "1.0.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Upload image to FreeImage via URL",
    category: "tools",
    guide: "{pn} [reply to an image]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/imghost";

    let imageUrl;
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else {
      return api.sendMessage("╭─❍\n│ Please reply to an image!\n╰───────────⟡", threadID, messageID);
    }

    const waitMsg = await api.sendMessage("Uploading to FreeImage...", threadID, messageID);

    try {
      const res = await axios.get(`${API_URL}?url=${encodeURIComponent(imageUrl)}`);

      if (res.data.success === true) {
        const displayUrl = res.data.data.display_url;
        return api.editMessage(displayUrl, waitMsg.messageID);
      } else {
        throw new Error();
      }

    } catch (error) {
      return api.editMessage("✕ Failed to upload image!", waitMsg.messageID);
    }
  }
};
