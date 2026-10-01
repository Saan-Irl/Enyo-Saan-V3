const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

const ACCESS_TOKEN =
  "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

const backgrounds = [
  "https://i.postimg.cc/90M4j2yZ/20251102-155328.png"
];

module.exports = {
  config: {
    name: "poke",
    aliases: ["chud"],
    version: "5.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    countDown: 10,
    shortDescription: "poke image",
    category: "FUN & SOCIAL"
  },

  onStart: async function ({ api, event, message, usersData }) {

    api.setMessageReaction("🕜", event.messageID, () => {}, true);

    let targetID = null;

    if (event.messageReply && event.messageReply.senderID) {
      targetID = event.messageReply.senderID;
    }

    else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    else {
      const match = event.body?.match(/\b\d{8,20}\b/);
      if (match) targetID = match[0];
    }

    if (!targetID) {
      return message.reply(
        "❌ Use any:\n• poke @mention\n• reply + poke\n• poke uid"
      );
    }

    const senderID = event.senderID;

    try {

      const senderName =
        (await usersData.getName(senderID).catch(() => "You"));
      const targetName =
        (await usersData.getName(targetID).catch(() => "Friend"));

      const senderAvatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
      const targetAvatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

      const bg =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];

      const [sImg, tImg, bgImg] = await Promise.all([
        Canvas.loadImage(senderAvatar),
        Canvas.loadImage(targetAvatar),
        Canvas.loadImage(bg)
      ]);

      const canvas = Canvas.createCanvas(873, 1280);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const size = Math.floor(canvas.width * 0.28);
      const y = 80;

      const drawAvatar = (img, x, color) => {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      drawAvatar(sImg, 80, "#ff4d6d");
      drawAvatar(tImg, canvas.width - size - 80, "#4d9cff");

      const imgPath = path.join(
        __dirname,
        "tmp",
        `${senderID}_${targetID}.png`
      );
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer());

      message.reply(
        {
          body: `${senderName} poked ${targetName} 🫦`,
          attachment: fs.createReadStream(imgPath)
        },
        () => {
          fs.unlinkSync(imgPath);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ Error occurred.");
    }
  }
};
