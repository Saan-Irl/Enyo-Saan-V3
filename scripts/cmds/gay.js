const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "gay",
    version: "3.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Gay canvas with fixed syntax",
    longDescription: "Places PFPs on background with fixed destructuring and blacklist.",
    category: "FUN & SOCIAL",
    guide: "{pn} @tag | {pn} [reply]"
  },

  onStart: async function ({ api, event, args, usersData }) {

    const { threadID, messageID, senderID, mentions, type, messageReply } = event; 
    
    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else {
      return api.sendMessage("❌ Please mention someone or reply to their message to use this command!", threadID, messageID);
    }

    const blacklistedID = "61570641868681";
    if (targetID == blacklistedID) {
      return api.sendMessage("❌ Ei user er upor ei command kaj korbe na!", threadID, messageID);
    }

    try {
      api.sendMessage("Processing...", threadID, messageID);

      const backgroundURL = "https://i.ibb.co/Ld1J2cx6/598832374d5c.png";
      const senderPFPURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const targetPFPURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const [bgImg, senderPFP, targetPFP] = await Promise.all([
        loadImage(backgroundURL),
        loadImage(senderPFPURL),
        loadImage(targetPFPURL)
      ]);

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      const drawCirclePFP = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      drawCirclePFP(senderPFP, 400, 170, 60); 
      drawCirclePFP(targetPFP, 210, 180, 60);

      const path = __dirname + `/cache/gay_${senderID}.png`;
      fs.writeFileSync(path, canvas.toBuffer("image/png"));

      return api.sendMessage({
        body: `🌈 Gay user ${await usersData.getName(targetID)}!`,
        attachment: fs.createReadStream(path)
      }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Error: Image generate kora somvob hoyni.", threadID, messageID);
    }
  }
};
