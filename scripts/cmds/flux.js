const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const RATIOS = {
  "1:1":  { w: 1024, h: 1024 },
  "16:9": { w: 1024, h: 576  },
  "9:16": { w: 576,  h: 1024 },
  "21:9": { w: 1024, h: 448  },
  "4:3":  { w: 1024, h: 768  },
  "3:2":  { w: 1024, h: 682  },
  "2:3":  { w: 682,  h: 1024 },
  "4:5":  { w: 800,  h: 1000 }
};

const API_CONFIG_URL = "https://raw.githubusercontent.com/goatbotnx/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";
let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const baseUrl = data?.[API_KEY];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${API_KEY}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}

module.exports = {
    config: {
        name: "flux",
        version: "3.5",
        aliases: ["flux-schnell"],
        author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
        countDown: 8,
        role: 0,
        shortDescription: "Generate High-Quality AI Images",
        longDescription: "Generate stunning images using Flux.1-schnell model.",
        category: "AI",
        guide: "{pn} [prompt] --ratio [1:1 | 16:9 | 9:16 | 21:9 | 4:3 | 3:2 | 2:3 | 4:5]"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;

        let ratio = "1:1";
        const ratioIndex = args.findIndex(a => a === "--ratio" || a === "-r");

        if (ratioIndex !== -1 && args[ratioIndex + 1]) {
            const requested = args[ratioIndex + 1];
            if (RATIOS[requested]) ratio = requested;
            args.splice(ratioIndex, 2);
        }

        const prompt = args.join(" ").trim();

        if (!prompt) {
            return api.sendMessage(
                "✨ Please enter a prompt!\n━━━━━━━━━━━━━━━━━━━━\nExample: /flux a futuristic city\nOptional: /flux a cat --ratio 16:9",
                threadID,
                messageID
            );
        }

        api.setMessageReaction("⏳", messageID, (err) => {}, true);

        const apiUrl = `${await getApiBaseUrl()}/api/flux-1-schnell?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;
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

            api.setMessageReaction("✅", messageID, (err) => {}, true);

            return api.sendMessage({
                body: `✨ 𝗙𝗟𝗨𝗫 𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 ✨\n📐 Ratio: ${ratio}`,
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