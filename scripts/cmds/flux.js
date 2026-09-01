const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "flux",
        version: "3.2.0",
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        countDown: 8,
        role: 0,
        shortDescription: "Generate High-Quality AI Images",
        longDescription: "Generate stunning images using Flux.1-schnell model.",
        category: "AI & IMAGE GENERATION",
        guide: "{pn} [your prompt]"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const prompt = args.join(" ");

        if (!prompt) {
            return api.sendMessage("✨ Please enter a prompt!\n━━━━━━━━━━━━━━━━━━━━\nExample: /flux a futuristic city", threadID, messageID);
        }

        api.setMessageReaction("⏳", messageID, (err) => {}, true);
        const startTime = Date.now();

        const apiUrl = `https://xalman-apis.vercel.app/api/flux-schnell?prompt=${encodeURIComponent(prompt)}`;
        const cachePath = path.join(__dirname, 'cache', `flux_${senderID}_${Date.now()}.png`);

        try {
            if (!fs.existsSync(path.join(__dirname, 'cache'))) {
                fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
            }

            const response = await axios({
                method: 'get',
                url: apiUrl,
                responseType: 'arraybuffer',
                timeout: 60000 
            });

            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.includes('image')) {
                throw new Error("Invalid Image Data");
            }

            fs.writeFileSync(cachePath, Buffer.from(response.data, 'binary'));

            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

            const msgBody = `✨ 𝗙𝗟𝗨𝗫 𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 ✨\n━━━━━━━━━━━━━━━━━━━━\n📝 Prompt: ${prompt}\n👤 Author: 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃\n⏱️ Time Taken: ${timeTaken}s\n━━━━━━━━━━━━━━━━━━━━`;

            api.setMessageReaction("✅", messageID, (err) => {}, true);

            return api.sendMessage({
                body: msgBody,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return api.sendMessage(`⚠️ Generation Failed! ${error.message}`, threadID, messageID);
        }
    }
};
