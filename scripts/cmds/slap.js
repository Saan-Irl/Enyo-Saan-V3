const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

module.exports = {
  config: {
    name: "slap",
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Custom slap image with circular avatars",
    longDescription: "Custom slap image with your own template and circular avatars",
    category: "FUN & SOCIAL",
    guide: { en: "{pn} @tag" }
  },

  langs: {
    en: { noTag: "যারে থাপড়াবি ওরে মেনশন দে 😒" }
  },

  onStart: async function({ event, message, usersData, getLang }) {

    const uid1 = event.senderID;
    const mentions = Object.keys(event.mentions || {});
    const uid2 = mentions[0];
    if (!uid2) return message.reply(getLang("noTag"));

    async function getFbProfilePic(userId, width = 512, height = 512) {
      const url = `https://graph.facebook.com/${userId}/picture?width=${width}&height=${height}&access_token=${ACCESS_TOKEN}&redirect=false`;
      try {
        const res = await axios.get(url);
        return res.data.data.url;
      } catch {
        return null;
      }
    }

    let avatar1 = await getFbProfilePic(uid1) || await usersData.getAvatarUrl(uid1);
    let avatar2 = await getFbProfilePic(uid2) || await usersData.getAvatarUrl(uid2);

    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const templateUrl = "https://i.postimg.cc/pdX3tmTt/xalmanx211.png";
    const [template, img1, img2] = await Promise.all([
      loadImage(templateUrl),
      loadImage(avatar1),
      loadImage(avatar2)
    ]);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0);

    function drawCircleAvatar(ctx, img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }
    
    drawCircleAvatar(ctx, img1, 165, 230, 90);
    drawCircleAvatar(ctx, img2, 235, 500, 110);

    const filePath = path.join(tmpDir, `slap_${uid1}_${uid2}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    message.reply({
      body: "👋 thassssshshhhhh!",
      attachment: fs.createReadStream(filePath)
    }, () => {
      try { fs.unlinkSync(filePath); } catch {}
    });
  }
};
