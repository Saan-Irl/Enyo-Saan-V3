const axios = require("axios");

module.exports = {
  config: {
    name: "waifuadult",
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 15,
    role: 0,
    shortDescription: "Get anime nsfw image",
    longDescription: "Fetch direct image from API and automatic unsent after 10 second",
    category: "ANIME & MEDIA",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const response = await axios.get(
        "https://xalman-apis.vercel.app/api/waifuadult",
        {
          responseType: "stream"
        }
      );

      api.sendMessage(
        {
          body: "😋Here is your adult anime image🫦💋",
          attachment: response.data
        },
        event.threadID,
        (err, info) => {
          if (!err) {
            setTimeout(() => api.unsendMessage(info.messageID), 10000);
          }
        },
        event.messageID
      );
    } catch {
      api.sendMessage(
        "Error fetching image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
