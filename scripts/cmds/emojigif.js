const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "emojigif",
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get emoji image"
    },
    category: "FUN & SOCIAL",
    guide: {
      en: "{pn} 😊"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const emoji = args.join(" ");

      if (!emoji)
        return message.reply("❌ | Please provide an emoji");

      const apiUrl = `https://xalman-apis.vercel.app/api/emojigif?emoji=${encodeURIComponent(emoji)}`;

      const res = await axios.get(apiUrl);
      const imageUrl = res.data?.data?.image;

      if (!imageUrl)
        return message.reply("❌ | No image found");

      const filePath = path.join(
        __dirname,
        "cache",
        `emoji_${Date.now()}.webp`
      );

      const img = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      img.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: `Emoji: ${emoji}`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);
      });

      writer.on("error", () => {
        message.reply("❌ | Failed to download image");
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | API Error");
    }
  }
};
