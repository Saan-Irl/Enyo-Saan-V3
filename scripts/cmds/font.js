const axios = require("axios");

module.exports = {
  config: {
    name: "font",
    aliases: ["fontstyle"],
    version: "4.3",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Generate stylish fonts & see list",
    category: "tools",
    guide: "{pn} [text] [style_id] or {pn} list"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/font";

    if (args[0] && args[0].toLowerCase() === "list") {
      api.setMessageReaction("📜", messageID, () => {}, true);
      try {
        const res = await axios.get(`${API_URL}?text=Saan Ahmed&style=List`);
        const previews = res.data.previews;
        
        let listMsg = "❖ 𝖥𝖮𝖭𝖳 𝖲𝖳𝖸𝖫𝖨𝖲𝖳 𝖯𝖱𝖤𝖵𝖨𝖤𝖶 ❖\n━━━━━━━━━━━━━━━━━━\n";
        
        for (const [id, text] of Object.entries(previews)) {
          listMsg += `${id}. ${text}\n`;
        }

        listMsg += "━━━━━━━━━━━━━━━━━━\n𝖴𝗌𝖺𝗀𝖾: /font [text] [id]";
        
        return api.sendMessage(listMsg, threadID, messageID);
      } catch (err) {
        return api.sendMessage("✕ API Error!", threadID, messageID);
      }
    }

    const styleID = args.pop(); 
    const text = args.join(" ");

    if (!text || isNaN(styleID)) {
      return api.sendMessage("╭─❍\n│ 𝖴𝗌𝖺𝗀𝖾: /font [text] [style_id]\n│ 𝖤𝗑: /font Saan Ahmed 15\n╰───────────⟡", threadID, messageID);
    }

    try {
      api.setMessageReaction("✍️", messageID, () => {}, true);
      const res = await axios.get(`${API_URL}?text=${encodeURIComponent(text)}&style=${styleID}`);
      
      if (res.data.status === false) {
        return api.sendMessage(`✕ Invalid Style!`, threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(res.data.result, threadID, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ API Error!", threadID, messageID);
    }
  }
};
