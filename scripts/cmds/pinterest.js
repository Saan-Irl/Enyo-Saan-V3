const axios = require("axios");

module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Search images from Pinterest",
    longDescription: "Search and get multiple images from Pinterest",
    category: "tools",
    guide: {
      en: "{p}pinterest <query> - <count>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");
    if (!input) return api.sendMessage("Please provide a search query!", event.threadID, event.messageID);

    const [query, count] = input.split("-").map(item => item.trim());
    const searchCount = Math.min(count || 6, 10);

    try {
      const res = await axios.get(`https://xalman-apis.vercel.app/api/pinimg`, {
        params: {
          search: query,
          count: searchCount
        }
      });

      const images = res.data.result;
      if (!images || images.length === 0) {
        return api.sendMessage("No results found for your query.", event.threadID, event.messageID);
      }

      const streams = [];
      for (const url of images) {
        try {
          const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
              "Referer": "https://www.pinterest.com/"
            }
          });
          streams.push(response.data);
        } catch (e) {
          console.error(`Error streaming image: ${url}`);
        }
      }

      if (streams.length === 0) return api.sendMessage("Could not fetch any images.", event.threadID, event.messageID);

      return api.sendMessage({
        body: `✅ Results for: ${query}\n📸 Total images: ${streams.length}`,
        attachment: streams
      }, event.threadID, event.messageID);

    } catch (error) {
      return api.sendMessage("An error occurred while fetching images.", event.threadID, event.messageID);
    }
  }
};
