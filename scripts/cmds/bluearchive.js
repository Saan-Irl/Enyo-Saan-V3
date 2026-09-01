const axios = require('axios');

module.exports = {
    config: {
        name: "bluearchive",
        aliases: ["ba"],
        version: "1.2",
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        countDown: 6,
        role: 0,
        shortDescription: "Get random Blue Archive images or check list",
        category: "ANIME & MEDIA",
        guide: "{pn} or {pn} list"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const BASE_URL = "https://xalman-apis.vercel.app/api/ba";

        if (args[0] === "list" || args[0] === "total") {
            try {
                const info = await axios.get(`${BASE_URL}?list=true`);
                return api.sendMessage(`📊 𝗕𝗟𝗨𝗘 𝗔𝗥𝗖𝗛𝗜𝗩𝗘 \n━━━━━━━━━━━━━━━━━━\nTotal Images: ${info.data.total_images}\nAuthor: ${info.data.author}\nStatus: Active`, threadID, messageID);
            } catch (e) {
                return api.sendMessage("✕ Could not fetch the image list.", threadID, messageID);
            }
        }

        api.setMessageReaction("🎨", messageID, () => {}, true);

        try {
            const response = await axios.get(BASE_URL, { 
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            api.setMessageReaction("✅", messageID, () => {}, true);
            
            return api.sendMessage({
                body: "❖ 𝗕𝗟𝗨𝗘 𝗔𝗥𝗖𝗛𝗜𝗩𝗘 ❖\n━━━━━━━━━━━━━━━━━━",
                attachment: response.data
            }, threadID, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("✕ Failed to load the image from API!", threadID, messageID);
        }
    }
};
