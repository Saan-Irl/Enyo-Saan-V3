const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

function extractUID(link) {
  try {
    const url = new URL(link);
    if (url.pathname.includes("profile.php")) {
      const params = new URLSearchParams(url.search);
      return params.get("id");
    } else {
      return url.pathname.replace(/\//g, ""); 
    }
  } catch {
    return null;
  }
}

async function getUIDFromProfileLink(link) {
  const uidOrUsername = extractUID(link);
  if (!uidOrUsername) return null;

  try {
    const res = await axios.get(
      `https://graph.facebook.com/${uidOrUsername}?access_token=${ACCESS_TOKEN}`
    );
    return res.data.id;
  } catch (err) {
    return null;
  }
}

async function handlePFP({ api, event, message, args }) {
  const { senderID, mentions, type, messageReply, messageID } = event;
  let userId;

  try {
    api.setMessageReaction("🕧", messageID, () => {}, true);

    if (mentions && Object.keys(mentions).length > 0) {
      userId = Object.keys(mentions)[0];
    }
    else if (type === "message_reply" && messageReply) {
      userId = messageReply.senderID;
    }
    else if (args[0] && args[0].startsWith("http")) {
      userId = await getUIDFromProfileLink(args[0]);
      if (!userId) return message.reply("");
    }
    else if (args[0] && /^\d+$/.test(args[0])) {
      userId = args[0];
    }
    else {
      userId = senderID;
    }

    const fbURL = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;

    const res = await axios.get(fbURL, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, `pfp_${userId}.png`);
    fs.writeFileSync(imgPath, res.data);

    await message.reply({
      body: "✨ 𝑯𝑒𝑟𝑒'𝑠 𝑡ℎ𝑒 𝑝𝑟𝑜𝑓𝑖𝑙𝑒 𝑝𝑖𝑐𝑡𝑢𝑟𝑒 🌬️",
      attachment: fs.createReadStream(imgPath)
    });

    fs.unlinkSync(imgPath);
    api.setMessageReaction("✅", messageID, () => {}, true);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    message.reply("");
  }
}

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    shortDescription: { en: "Show profile picture by UID, mention or link" },
    category: "image"
  },

  onStart: async function ({ api, event, message, args }) {
    await handlePFP({ api, event, message, args });
  }
};
