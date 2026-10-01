const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

module.exports = {
  config: {
    name: "punch",
    version: "3.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Punch a user with circular avatars",
    longDescription: "Generate a punch image (Saitama vs Goku) featuring circular avatars of the sender and the victim.",
    category: "FUN & SOCIAL",
    guide: "{pn} @tag or reply to a message"
  },

  onStart: async function({ event, message }) {
    const uid1 = event.senderID;
    let uid2;

    if (event.messageReply) {
      uid2 = event.messageReply.senderID;
    } else {
      const mentions = Object.keys(event.mentions || {});
      uid2 = mentions[0];
    }

    if (!uid2) return message.reply("Please mention a user or reply to a message to punch! 👊");

    async function getFbProfilePic(userId) {
      const url = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}&redirect=false`;
      try {
        const res = await axios.get(url);
        return res.data.data.url;
      } catch {
        return `https://graph.facebook.com/${userId}/picture?width=512&height=512`;
      }
    }

    try {
      const avatar1Url = await getFbProfilePic(uid1);
      const avatar2Url = await getFbProfilePic(uid2);
      const templateUrl = "https://i.ibb.co.com/gbYFjcpg/a393bc56c922e3624637f7113219c2b7.jpg";

      const [template, img1, img2] = await Promise.all([
        loadImage(templateUrl),
        loadImage(avatar1Url),
        loadImage(avatar2Url)
      ]);

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      function drawCircleAvatar(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircleAvatar(ctx, img1, 210, 238, 60); 
      drawCircleAvatar(ctx, img2, 280, 320, 60); 

      const tmpDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `punch_${uid1}_${uid2}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply({
        body: "👊💥 ONE PUNCH!!!",
        attachment: fs.createReadStream(filePath)
      }, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error(error);
      return message.reply("⚠️ Failed to generate image. Please try again later.");
    }
  }
};
