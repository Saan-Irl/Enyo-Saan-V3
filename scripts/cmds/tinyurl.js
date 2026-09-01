const axios = require("axios");

module.exports = {
  config: {
    name: "tinyurl",
    aliases: ["tiny"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Shorten a long URL",
    category: "tools",
    guide: "{pn} [url]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const url = args[0];

    if (!url) {
      return api.sendMessage("Please provide a long URL to shorten!", threadID, messageID);
    }

    const waitMsg = await api.sendMessage("Shortening...", threadID, messageID);

    try {
      const res = await axios.get(`https://xalman-apis.vercel.app/api/shorten?url=${encodeURIComponent(url)}`);

      if (res.data.status === true && res.data.shortened) {
        return api.editMessage(res.data.shortened, waitMsg.messageID);
      } else {
        throw new Error();
      }
    } catch (error) {
      return api.editMessage("✕ Failed to shorten URL!", waitMsg.messageID);
    }
  }
};
