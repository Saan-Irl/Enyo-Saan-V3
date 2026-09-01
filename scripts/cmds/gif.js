const axios = require("axios");

module.exports = {
  config: {
    name: "gif",
    aliases: ["animegif", "agif"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Anime GIF",
    category: "FUN & SOCIAL",
    guide: "{pn} [reaction]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const reaction = args[0]?.toLowerCase();

    if (!reaction) {
      return api.sendMessage(
`╭─❍
│ Example:
│ gif kiss
│ gif list
╰───────────⟡`,
        threadID,
        messageID
      );
    }

    try {

      const res = await axios.get(
        `https://xalman-apis.vercel.app/api/gif?reaction=${encodeURIComponent(reaction)}`
      );

      const data = res.data;

      if (!data.status) {

        return api.sendMessage(
`╭─❍
│ Invalid category
│
│ Available:
│ ${data.available_categories.join(", ")}
╰───────────⟡`,
          threadID,
          messageID
        );
      }

      const stream = (
        await axios.get(data.data.url, {
          responseType: "stream"
        })
      ).data;

      return api.sendMessage(
        {
          body:
`❖ ANIME GIF ❖
━━━━━━━━━━━━━━
🎭 Reaction: ${reaction}`,
          attachment: stream
        },
        threadID,
        messageID
      );

    } catch (err) {

      return api.sendMessage(
        `Error: ${err.message}`,
        threadID,
        messageID
      );
    }
  }
};
