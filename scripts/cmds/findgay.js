const { createCanvas, loadImage } = require('canvas');
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "findgay",
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Finds the gayest person" },
    longDescription: { en: "Randomly selects a user and creates a premium gay card using Canvas." },
    category: "FUN & SOCIAL",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const blacklistedID = "61570641868681"; 

    try {
      const info = await api.getThreadInfo(threadID);
      const filteredParticipants = info.participantIDs.filter(id => id !== blacklistedID);
      
      if (filteredParticipants.length === 0) return api.sendMessage("No valid participants found.", threadID);

      const randomID = filteredParticipants[Math.floor(Math.random() * filteredParticipants.length)];
      const userInfo = await api.getUserInfo(randomID);
      const name = userInfo[randomID].name;

      const canvas = createCanvas(700, 900);
      const ctx = canvas.getContext('2d');

      const bgGrad = ctx.createLinearGradient(0, 0, 0, 900);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#ffdefa');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 700, 900);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.roundRect(50, 50, 600, 800, 40);
      ctx.fill();

      const avatarUrl = `https://graph.facebook.com/${randomID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar = await loadImage(avatarUrl);

      ctx.save();
      ctx.beginPath();
      ctx.arc(350, 300, 180, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 170, 120, 360, 360);
      ctx.restore();

      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#333";
      ctx.font = "bold 45px Arial";
      ctx.fillText("🔍 KHOJ PAOYA GECHE!", 350, 560);

      ctx.font = "italic 32px Arial";
      ctx.fillText("Ei group er shobcheye boro Gay holo:", 350, 630);

      const nameGrad = ctx.createLinearGradient(200, 0, 500, 0);
      nameGrad.addColorStop(0, "#ff0000");
      nameGrad.addColorStop(0.5, "#8b00ff");
      nameGrad.addColorStop(1, "#0000ff");
      ctx.fillStyle = nameGrad;
      ctx.font = "bold 65px Arial";
      ctx.fillText(name, 350, 730);

      const cachePath = path.join(cacheDir, `gay_card_${randomID}.png`);
      fs.writeFileSync(cachePath, canvas.toBuffer());

      return api.sendMessage({
        body: `! 😂\nTarget: ${name}`,
        mentions: [{ tag: name, id: randomID }],
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
      return api.sendMessage("Command execution failed.", threadID);
    }
  }
};
