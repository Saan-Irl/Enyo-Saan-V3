const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "v2a",
    aliases: ["video2audio"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Video to audio",
    longDescription: "Convert replied video or URL to audio",
    category: "ANIME & MEDIA",
    guide: {
      en: "{pn} <video url>\nReply to a video"
    }
  },

  onStart: async function ({ message, event, args }) {

    try {

      let videoUrl;
      
      if (args[0]) {
        videoUrl = args[0];
      }
        
      else if (
        event.messageReply &&
        event.messageReply.attachments &&
        event.messageReply.attachments[0]
      ) {

        const attachment = event.messageReply.attachments[0];

        if (
          attachment.type === "video" ||
          attachment.type === "animated_image"
        ) {
          videoUrl = attachment.url;
        }
      }

      if (!videoUrl) {
        return message.reply(
          "❌ | Reply to a video or give video URL"
        );
      }

      await message.reply("⏳ | Converting video to audio...");

      const api =
        `https://xalman-apis.vercel.app/api/v2a?url=${encodeURIComponent(videoUrl)}`;

      const filePath = path.join(
        __dirname,
        "cache",
        `v2a_${Date.now()}.mp3`
      );

      const response = await axios({
        url: api,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", async () => {

        await message.reply({
          body: "🎵 | Here is your audio",
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);

      });

      writer.on("error", async () => {
        return message.reply("❌ | Failed to save audio");
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ | Error while converting");
    }

  }
};
