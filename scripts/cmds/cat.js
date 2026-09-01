const axios = require('axios');

module.exports = {
    config: {
        name: "cat",
        aliases: ["catimg"],
        version: "1.2.0",
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        countDown: 5,
        role: 0,
        shortDescription: "Get random cat images or check list count",
        category: "ANIME & MEDIA",
        guide: "{pn} or {pn} list"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const BASE_URL = "https://xalman-apis.vercel.app/api/cat"; 

        if (args[0] === "list" || args[0] === "total") {
            try {
                const info = await axios.get(`${BASE_URL}?list=true`);
                return api.sendMessage(
                    `🐾 𝗖𝗔𝗧 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 𝗜𝗡𝗙𝗢\n━━━━━━━━━━━━━━━━━━\n` +
                    `Total Images: ${info.data.total_images}\n` +
                    `Status: Active`, 
                    threadID, messageID
                );
            } catch (e) {
                return api.sendMessage("✕ Could not fetch the cat image list.", threadID, messageID);
            }
        }

        api.setMessageReaction("🐱", messageID, () => {}, true);

        try {
            const res = await axios.get(BASE_URL);
            const imageUrl = res.data.url;

            const imageStream = await axios.get(imageUrl, { 
                responseType: 'stream' 
            });

            api.setMessageReaction("✅", messageID, () => {}, true);
            
            return api.sendMessage({
                body: "❖ 𝗖𝗨𝗧𝗘 𝗖𝗔𝗧 ❖\n━━━━━━━━━━━━━━━━━━",
                attachment: imageStream.data
            }, threadID, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("✕ Failed to load the cat image!", threadID, messageID);
        }
    }
};
