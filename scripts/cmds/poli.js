const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "poli",
    version: "1.2",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Generate pollination ai image ",
    category: "AI & IMAGE GENERATION",
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return message.reply("❌ | Prompt dao!\nExample: poli cat");
    }

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `poli_${event.senderID}_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const url = `https://xalman-apis.vercel.app/api/poli?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(url, { responseType: "arraybuffer", timeout: 240000 });

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `✅ | Prompt: ${prompt}`,
        attachment: fs.createReadStream(cachePath)
      });

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }

    } catch (err) {
      console.error(err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }

      if (err.code === "ECONNABORTED") {
        return message.reply("⏰ | Request timeout (4 min exceed)");
      }

      return message.reply("❌ | Image generate fail hoise!");
    }
  }
};
