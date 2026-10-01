const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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

const RATIOS = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "4:3": "4:3",
  "3:4": "3:4"
};

const MODELS = [
  { id: 1, name: "Flux 2 Max", tag: "🔥", path: "/api/flux2max", supportsImage: true },
  { id: 2, name: "GPT Image 2", tag: "🧠", path: "/api/gptimage2", supportsImage: true },
  { id: 3, name: "GPT 2.5 Flare", tag: "✨", path: "/api/gpt2.5-flare", supportsImage: true },
  { id: 4, name: "GPT 2.5 Flare V2", tag: "✨", path: "/api/gpt2.5-flare-v2", supportsImage: true },
  { id: 5, name: "GPT 2.5 Sunburst", tag: "🌅", path: "/api/gpt2.5-sunburst", supportsImage: true },
  { id: 6, name: "GPT Image 2.5 Sunburst V2", tag: "🌅", path: "/api/gptimage2.5-sunburst-v2", supportsImage: true },
  { id: 7, name: "Grok", tag: "⚡", path: "/api/grok", supportsImage: true },
  { id: 8, name: "Nano Banana", tag: "🍌", path: "/api/nb", supportsImage: true },
  { id: 9, name: "Nano Banana 2", tag: "🍌", path: "/api/nanobanana2", supportsImage: true },
  { id: 10, name: "Qwen Image 2", tag: "🌀", path: "/api/qwenimage2", supportsImage: true },
  { id: 11, name: "Qwen Image", tag: "🌀", path: "/api/qwen-image", supportsImage: false },
  { id: 12, name: "SeedDream 4", tag: "🌱", path: "/api/seedream4", supportsImage: true }
];

function buildModelBox() {
  const rows = MODELS.map(m => `│ ${String(m.id).padStart(2, "0")}. ${m.tag} ${m.name}`);
  return (
    "╭─〔 🤖 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐌𝐎𝐃𝐄𝐋𝐒 〕─╮\n" +
    rows.join("\n") +
    "\n╰─────────────────────╯"
  );
}

module.exports = {
  config: {
    name: "genx",
    aliases: ["gnx"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Generate or edit images with 12 AI models" },
    longDescription: { en: "Text-to-image or image-edit generation using multiple AI models" },
    category: "AI",
    guide: {
      en:
        "   {pn} --m <1-12> <prompt> --ar <ratio>\n" +
        "   Reply to an image + {pn} --m <1-12> <prompt> → edit that image\n\n" +
        buildModelBox() +
        "\n\n📐 Ratios: " + Object.keys(RATIOS).join(", ")
    }
  },

  onStart: async function ({ api, event, args, message, prefix, commandName }) {
    const { messageID } = event;
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    if (!args.length) {
      return message.reply(
        `╭─〔 🤖 𝐆𝐄𝐍𝐗 𝐈𝐌𝐀𝐆𝐄 𝐀𝐈 〕─╮\n` +
        `│ 📝 ${prefix}${commandName} --m <1-12> <prompt> --ar <ratio>\n` +
        `│ 🖼️ Reply to an image + command → edit mode\n` +
        `╰─────────────────────╯\n\n` +
        buildModelBox() +
        `\n\n📐 Ratios: ${Object.keys(RATIOS).join(", ")}`
      );
    }

    let workingArgs = [...args];

    const mIndex = workingArgs.findIndex(a => a.toLowerCase() === "--m");
    let modelId = null;
    if (mIndex !== -1) {
      modelId = parseInt(workingArgs[mIndex + 1]);
      workingArgs = [...workingArgs.slice(0, mIndex), ...workingArgs.slice(mIndex + 2)];
    }

    const model = MODELS.find(m => m.id === modelId);
    if (!model) {
      return message.reply(
        `❌ Please choose a valid model with --m <1-12>.\n\n${buildModelBox()}`
      );
    }

    const arIndex = workingArgs.findIndex(a => a.toLowerCase() === "--ar");
    let ratio = "1:1";
    if (arIndex !== -1) {
      const ratioArg = workingArgs[arIndex + 1];
      if (ratioArg && RATIOS[ratioArg]) ratio = RATIOS[ratioArg];
      workingArgs = [...workingArgs.slice(0, arIndex), ...workingArgs.slice(arIndex + 2)];
    }

    const prompt = workingArgs.join(" ").trim();
    if (!prompt) return message.reply("❌ Please provide a prompt.");

    const imageUrl = event.messageReply?.attachments?.find(a => a.type === "photo")?.url || null;
    const isEdit = Boolean(imageUrl && model.supportsImage);

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let filePath;

    try {
      const baseUrl = await getApiBaseUrl();
      const endpoint = `${baseUrl}${model.path}`;

      const params = { prompt, ratio: ratio || "", image: model.supportsImage ? (imageUrl || "") : undefined };

      const res = await axios.get(endpoint, {
        params,
        timeout: 180000,
        responseType: "arraybuffer",
        validateStatus: () => true
      });

      const contentType = res.headers["content-type"] || "";
      const buffer = Buffer.from(res.data);
      const looksLikeJson = contentType.includes("json") || contentType.includes("text") || res.status >= 400;

      if (looksLikeJson) {
        let errMsg = `HTTP ${res.status} ${res.statusText || ""}`.trim();
        try {
          const errData = JSON.parse(buffer.toString("utf-8"));
          errMsg = errData?.message || errData?.error || errMsg;
        } catch {
          const snippet = buffer.toString("utf-8").replace(/\s+/g, " ").trim().slice(0, 150);
          if (snippet) errMsg = snippet;
        }
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ ${model.name} failed: ${errMsg}`);
      }

      const magic = buffer.slice(0, 12).toString("hex");
      let ext = "jpg";
      if (magic.startsWith("89504e470d0a1a0a")) ext = "png";
      else if (magic.startsWith("ffd8ff")) ext = "jpg";
      else if (magic.startsWith("47494638")) ext = "gif";
      else if (magic.startsWith("52494646") && magic.includes("57454250")) ext = "webp";
      else if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("webp")) ext = "webp";

      filePath = path.join(cacheDir, `genx_${Date.now()}.${ext}`);
      await fs.writeFile(filePath, buffer);

      api.setMessageReaction("✅", messageID, () => {}, true);

      return message.reply({
        body:
          `╭─〔 🤖 𝐆𝐄𝐍𝐗 𝐑𝐄𝐒𝐔𝐋𝐓 〕─╮\n` +
          `│ ${model.tag} 𝐌𝐨𝐝𝐞𝐥   ─> ${model.name}\n` +
          `│ 📐 𝐑𝐚𝐭𝐢𝐨   ─> 「 ${ratio} 」\n` +
          `│ 🎭 𝐌𝐨𝐝𝐞    ─> 『 ${isEdit ? "Edit" : "Text-to-Image"} 』\n` +
          `╰----------------------------─╯`,
        attachment: fs.createReadStream(filePath)
      });
    } catch (err) {
      console.error("[genx] Error:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(`❌ ${model.name} failed: ${err.message}`);
    } finally {
      if (filePath) fs.remove(filePath).catch(() => {});
    }
  }
};