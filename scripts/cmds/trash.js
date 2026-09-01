const axios = require("axios");
const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "trash",
    aliases: ["dustbin"],
    version: "1.0.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "কাউকে ডাস্টবিনে ফেলার ছবি",
    longDescription: "Create a Trash image with user avatar in a dustbin",
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
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const avatarRes = await axios.get(avatarURL, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(avatarRes.data, 'utf-8');

      const img = await new DIG.Trash().getImage(avatarBuffer);
      
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const pathSave = path.join(cacheDir, `trash_${targetID}.png`);

      fs.writeFileSync(pathSave, Buffer.from(img));

      return api.sendMessage({
        attachment: fs.createReadStream(pathSave)
      }, threadID, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("command error ❌", threadID, messageID);
    }
  }
};
