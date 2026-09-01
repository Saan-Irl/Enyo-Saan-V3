const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "marry",
    aliases: ["married", "biya", "engage"], 
    version: "3.7",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Propose with custom image",
    longDescription: "Generate a propose image with avatars perfectly placed over characters’ heads (swapped).",
    category: "FUN & SOCIAL",
    guide: "{pn} @mention"
  },

  onStart: async function ({ message, event, usersData }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0)
      return message.reply(" plz mention someone");

    const senderID = event.senderID;
    const mentionedID = mention[0];

    try {
      const nameSender = await usersData.getName(senderID);
      const nameMentioned = await usersData.getName(mentionedID);
      const avatarSender =
        (await usersData.getAvatarUrl(senderID)) ||
        `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
      const avatarMentioned =
        (await usersData.getAvatarUrl(mentionedID)) ||
        `https://graph.facebook.com/${mentionedID}/picture?width=512&height=512`;

      const [avatarImgSender, avatarImgMentioned, bg] = await Promise.all([
        Canvas.loadImage(avatarSender),
        Canvas.loadImage(avatarMentioned),
        Canvas.loadImage("https://i.postimg.cc/VvjW9DwJ/images-8.jpg")
      ]);

      const canvasWidth = 1280;
      const canvasHeight = 1280;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      const avatarSize = Math.floor(canvasWidth * 0.11);
      const girlHead = { x: 470, y: 310 };
      const boyHead = { x: 690, y: 200 };

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        girlHead.x + avatarSize / 2,
        girlHead.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(avatarImgMentioned, girlHead.x, girlHead.y, avatarSize, avatarSize);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        boyHead.x + avatarSize / 2,
        boyHead.y + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(avatarImgSender, boyHead.x, boyHead.y, avatarSize, avatarSize);
      ctx.restore();

      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const imgPath = path.join(tmpDir, `${senderID}_${mentionedID}_marry.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      const text =
        senderID === mentionedID
          ? "নিজেকে নিজেকে বিয়ে করবে ? 😂"
          : `💍 ${nameSender} এর বিয়ে${nameMentioned}- এর সাথে 🥰❤️`;

      await message.reply(
        {
          body: text,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlink(imgPath).catch(() => {})
      );

      canvas.width = canvas.height = 0;
      global.gc && global.gc();

    } catch (err) {
      console.error("❌ Error in marry command:", err);
      message.reply(`error!\n${err.message}`);
    }
  }
};
