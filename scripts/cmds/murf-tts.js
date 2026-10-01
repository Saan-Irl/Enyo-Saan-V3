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

function detectAudioExt(buffer, contentType) {
  const magic = buffer.slice(0, 12).toString("hex");
  if (magic.startsWith("494433") || magic.startsWith("fffb") || magic.startsWith("fff3") || magic.startsWith("fff2")) return "mp3";
  if (magic.startsWith("52494646")) return "wav";
  if (magic.startsWith("4f676753")) return "ogg";
  if (magic.slice(8, 16) === "66747970") return "m4a";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mp4") || contentType.includes("m4a")) return "m4a";
  return "mp3";
}

function parseError(res, buffer) {
  let errMsg = `HTTP ${res.status} ${res.statusText || ""}`.trim();
  try {
    const errData = JSON.parse(buffer.toString("utf-8"));
    errMsg = errData?.message || errData?.error || errMsg;
  } catch {
    const snippet = buffer.toString("utf-8").replace(/\s+/g, " ").trim().slice(0, 150);
    if (snippet) errMsg = snippet;
  }
  return errMsg;
}

module.exports = {
  config: {
    name: "murf-tts",
    aliases: ["murftts", "mtts"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Text to speech with Murf voices" },
    longDescription: { en: "Convert text to speech using 46 Murf AI voices" },
    category: "TTS",
    guide: {
      en:
        "   {pn} <text> → speak with default voice\n" +
        "   {pn} --v <voice> <text> → speak with a chosen voice\n" +
        "   {pn} list → show all voices\n" +
        "   Reply to a message + {pn} → speak that message\n\n" +
        "   Example: {pn} --v angela Hello how are you"
    }
  },

  onStart: async function ({ api, event, args, message, prefix, commandName }) {
    const { messageID } = event;
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    let workingArgs = [...args];

    if (workingArgs[0]?.toLowerCase() === "list") {
      return showVoiceList(message);
    }

    let voice = "";
    const vIndex = workingArgs.findIndex(a => a.toLowerCase() === "--v");
    if (vIndex !== -1) {
      voice = (workingArgs[vIndex + 1] || "").toLowerCase();
      workingArgs = [...workingArgs.slice(0, vIndex), ...workingArgs.slice(vIndex + 2)];
    }

    if (voice === "list") return showVoiceList(message);

    let text = workingArgs.join(" ").trim();
    if (!text && event.messageReply?.body) text = event.messageReply.body.trim();

    if (!text) {
      return message.reply(
        `╭─〔 🎙️ 𝐌𝐔𝐑𝐅 𝐓𝐓𝐒 〕─╮\n` +
        `│ 📝 ${prefix}${commandName} <text>\n` +
        `│ 🎭 ${prefix}${commandName} --v <voice> <text>\n` +
        `│ 📋 ${prefix}${commandName} list\n` +
        `╰─────────────────╯`
      );
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    let filePath;

    try {
      const baseUrl = await getApiBaseUrl();
      const params = { text };
      if (voice) params.voice = voice;

      const res = await axios.get(`${baseUrl}/api/murf-tts`, {
        params,
        timeout: 180000,
        responseType: "arraybuffer",
        validateStatus: () => true
      });

      const contentType = res.headers["content-type"] || "";
      const buffer = Buffer.from(res.data);
      const looksLikeError = contentType.includes("json") || contentType.includes("text") || res.status >= 400;

      if (looksLikeError) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ Murf TTS failed: ${parseError(res, buffer)}`);
      }

      const ext = detectAudioExt(buffer, contentType);
      filePath = path.join(cacheDir, `murf_${Date.now()}.${ext}`);
      await fs.writeFile(filePath, buffer);

      api.setMessageReaction("✅", messageID, () => {}, true);

      return message.reply({
        body:
          `╭─〔 🎙️ 𝐌𝐔𝐑𝐅 𝐓𝐓𝐒 〕─╮\n` +
          `│ 🗣️ 𝐕𝐨𝐢𝐜𝐞  ─> ${voice ? voice.charAt(0).toUpperCase() + voice.slice(1) : "Default"}\n` +
          `╰──────────────╯`,
        attachment: fs.createReadStream(filePath)
      });
    } catch (err) {
      console.error("[murf] Error:", err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply(`❌ Murf TTS failed: ${err.message}`);
    } finally {
      if (filePath) fs.remove(filePath).catch(() => {});
    }
  }
};

async function showVoiceList(message) {
  try {
    const baseUrl = await getApiBaseUrl();
    const res = await axios.get(`${baseUrl}/api/murf-tts`, {
      params: { text: "", voice: "list" },
      timeout: 30000,
      validateStatus: () => true
    });

    const data = res.data;
    if (!data?.status || !data?.voices) {
      return message.reply(`❌ Failed to load voices: ${data?.message || `HTTP ${res.status}`}`);
    }

    const male = data.voices.male || [];
    const female = data.voices.female || [];

    return message.reply(
      `╭─〔 🎙️ 𝐌𝐔𝐑𝐅 𝐕𝐎𝐈𝐂𝐄𝐒 〕─╮\n` +
      `│ 👨 𝐌𝐚𝐥𝐞 (${male.length})\n` +
      `│ ${male.join(", ")}\n│\n` +
      `│ 👩 𝐅𝐞𝐦𝐚𝐥𝐞 (${female.length})\n` +
      `│ ${female.join(", ")}\n` +
      `╰───────────────╯\n\n` +
      `💡 Use: --v <voice> <text>`
    );
  } catch (err) {
    return message.reply(`❌ Failed to load voices: ${err.message}`);
  }
}