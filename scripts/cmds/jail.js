const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "jail",
    version: "1.0.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "jail picture",
    longDescription: "Overlay jail bars on user's profile picture",
    category: "FUN & SOCIAL",
    guide: {
      en: "{pn} [@mention / reply / UID]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, mentions, type, messageReply, senderID } = event;
    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    try {
      const info = await api.getUserInfo(targetID);
      const name = info[targetID].name;

      api.sendMessage(`⏳ Putting ${name} behind bars... 🚔`, threadID, messageID);

      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const templateURL = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/main/xalman/xalmanimg/images/nx-jail.png";

      const [avatarRes, templateRes] = await Promise.all([
        axios.get(avatarURL, { responseType: 'arraybuffer' }),
        axios.get(templateURL, { responseType: 'arraybuffer' })
      ]);

      const avatarImg = await loadImage(avatarRes.data);
      const templateImg = await loadImage(templateRes.data);

      const canvasSize = 512;
      const canvas = createCanvas(canvasSize, canvasSize);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(avatarImg, 0, 0, canvasSize, canvasSize);

      ctx.drawImage(templateImg, 0, 0, canvasSize, canvasSize);

      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const pathSave = path.join(cacheDir, `jail_${targetID}.png`);
      fs.writeFileSync(pathSave, canvas.toBuffer());

      return api.sendMessage({
        body: `${name} is in jail now.👮‍♂️⛓️`,
        attachment: fs.createReadStream(pathSave)
      }, threadID, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Failed to put user in jail. The suspect escaped! 🏃‍♂️", threadID, messageID);
    }
  }
};
