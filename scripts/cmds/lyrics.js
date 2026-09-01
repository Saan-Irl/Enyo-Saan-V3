const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["songlyrics"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Get song lyrics",
    category: "tools",
    guide: "{pn} [song name]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");

    if (!songName) {
      return api.sendMessage("╭─❍\n│ Please provide a song name!\n╰───────────⟡", threadID, messageID);
    }

    const waitMsg = await api.sendMessage(`🔍 | Searching lyrics for: ${songName}...`, threadID, messageID);

    try {
      const res = await axios.get(`https://xalman-apis.vercel.app/api/lyrics?song=${encodeURIComponent(songName)}`);
      
      if (res.data.status && res.data.data) {
        const { title, artist, lyrics } = res.data.data;

        const responseText = 
`╭───────❍
│  『 𝗦𝗢𝗡𝗚 𝗟𝗬𝗥𝗜𝗖𝗦 』
╰───────────⟡
🎵 𝗧𝗶𝘁𝗹𝗲  : ${title}
👤 𝗔𝗿𝘁𝗶𝘀𝘁 : ${artist}

📜 𝗟𝘆𝗿𝗶𝗰𝘀 :
━━━━━━━━━━━━━━━━━━
${lyrics}
━━━━━━━━━━━━━━━━━━`;

        return api.editMessage(responseText, waitMsg.messageID);
      } else {
        throw new Error();
      }
    } catch (error) {
      return api.editMessage(`✕ Could not find lyrics for "${songName}"!`, waitMsg.messageID);
    }
  }
};
