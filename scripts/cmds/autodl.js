const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream/promises");

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
];

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getUserAgent() {
  return USER_AGENTS[
    Math.floor(Math.random() * USER_AGENTS.length)
  ];
}

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function cleanText(text, max = 55) {
  if (!text) return "Untitled";

  const value = String(text)
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return value.length > max
    ? `${value.slice(0, max)}…`
    : value;
}

function getExtension(url, contentType, isAudio) {
  const value = String(url || "").toLowerCase();
  const type = String(contentType || "").toLowerCase();

  if (isAudio) {
    if (type.includes("mpeg") || value.includes(".mp3")) {
      return ".mp3";
    }

    if (type.includes("m4a") || value.includes(".m4a")) {
      return ".m4a";
    }

    if (type.includes("ogg") || value.includes(".ogg")) {
      return ".ogg";
    }

    if (type.includes("wav") || value.includes(".wav")) {
      return ".wav";
    }

    return ".mp3";
  }

  if (type.includes("webm") || value.includes(".webm")) {
    return ".webm";
  }

  if (type.includes("quicktime") || value.includes(".mov")) {
    return ".mov";
  }

  if (type.includes("gif") || value.includes(".gif")) {
    return ".gif";
  }

  return ".mp4";
}

module.exports = {
  config: {
    name: "autodl",
    version: "20.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 1,
    role: 0,
    shortDescription: "Multi-Platform Media Downloader",
    longDescription: "Download video/audio from supported platforms.",
    category: "ANIME & MEDIA",
    guide: "{pn} <link> (or just send the link)"
  },

  onStart: async function ({ api, event, args, message }) {
    const url = args[0];

    if (!url) {
      return message.reply("⚠️ Please provide a media link!");
    }

    return this.handleDownload(
      url,
      api,
      event,
      message,
      false
    );
  },

  onChat: async function ({ api, event, message }) {
    const { body, senderID } = event;

    if (!body || senderID === api.getCurrentUserID()) {
      return;
    }

    const match = body.match(/(https?:\/\/[^\s]+)/i);

    if (!match) return;

    const url = match[0].replace(/[)\]}>.,]+$/, "");

    const supported = [
      "tiktok.com",
      "facebook.com",
      "fb.watch",
      "instagram.com",
      "reels",
      "youtube.com",
      "youtu.be",
      "pinterest.com",
      "pin.it",
      "twitter.com",
      "x.com",
      "capcut.com",
      "spotify.com",
      "soundcloud.com",
      "mediafire.com",
      "snapchat.com",
      "threads.com",
      "likee.com",
      "likee.video"
    ];

    if (
      !supported.some(domain =>
        url.toLowerCase().includes(domain)
      )
    ) {
      return;
    }

    return this.handleDownload(
      url,
      api,
      event,
      message,
      true
    );
  },

  handleDownload: async function (
    url,
    api,
    event,
    message,
    isAuto = false
  ) {
    const { messageID } = event;
    const start = Date.now();

    let filePath = null;

    const react = emoji => {
      try {
        if (typeof api.setMessageReaction === "function") {
          api.setMessageReaction(
            emoji,
            messageID,
            () => {},
            true
          );
        }
      } catch {}
    };

    try {
      react("⏳");

      const apiUrl =
        `https://xalman-apis.vercel.app/api/universaldownloader?url=${encodeURIComponent(url)}`;

      const apiResponse = await axios.get(apiUrl, {
        timeout: 30000,
        maxRedirects: 10,
        headers: {
          "User-Agent": getUserAgent(),
          "Accept": "application/json"
        }
      });

      const apiData = apiResponse.data;

      if (!apiData?.status) {
        throw new Error(
          apiData?.message || "API returned an unsuccessful response."
        );
      }

      const result = apiData.data || {};

      const videoUrl = result.url;
      const audioUrl = result.audio_url;

      let primaryUrl;
      let isAudio = false;

      if (videoUrl) {
        primaryUrl = videoUrl;
        isAudio = false;
      } else if (audioUrl) {
        primaryUrl = audioUrl;
        isAudio = true;
      } else {
        throw new Error(
          "No video or audio URL found."
        );
      }

      const title =
        result.title ||
        "Untitled";

      const platform =
        apiData.platform ||
        "Unknown";

      const quality =
        result.quality ||
        (isAudio ? "Audio" : "Video");

      const cacheDir =
        path.join(
          __dirname,
          "cache"
        );

      await fs.ensureDir(
        cacheDir
      );

      let streamRes;
      let lastError;

      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        try {
          streamRes = await axios({
            method: "GET",
            url: primaryUrl,
            responseType: "stream",
            timeout: 120000,
            maxRedirects: 10,
            maxContentLength: MAX_FILE_SIZE,
            maxBodyLength: MAX_FILE_SIZE,
            headers: {
              "User-Agent": getUserAgent(),
              "Accept": "*/*",
              "Connection": "keep-alive",
              "Referer":
                platform.toLowerCase() === "pinterest"
                  ? "https://www.pinterest.com/"
                  : "https://www.google.com/"
            },
            validateStatus: status =>
              status >= 200 &&
              status < 400
          });

          break;
        } catch (error) {
          lastError = error;

          if (attempt < 3) {
            await new Promise(resolve =>
              setTimeout(
                resolve,
                attempt * 1500
              )
            );
          }
        }
      }

      if (!streamRes) {
        throw new Error(
          lastError?.message ||
          "Unable to connect to media server."
        );
      }

      const contentType =
        String(
          streamRes.headers[
            "content-type"
          ] || ""
        ).toLowerCase();

      const contentLength =
        Number(
          streamRes.headers[
            "content-length"
          ] || 0
        );

      if (
        contentLength >
        MAX_FILE_SIZE
      ) {
        streamRes.data.destroy();

        throw new Error(
          "File exceeds 100 MB limit."
        );
      }

      if (
        contentType.includes(
          "text/html"
        ) ||
        contentType.includes(
          "application/json"
        ) ||
        contentType.includes(
          "text/plain"
        )
      ) {
        streamRes.data.destroy();

        throw new Error(
          "The media URL returned an invalid response."
        );
      }

      const ext =
        getExtension(
          primaryUrl,
          contentType,
          isAudio
        );

      const fileName =
        `alldl_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}${ext}`;

      filePath =
        path.join(
          cacheDir,
          fileName
        );

      const writer =
        fs.createWriteStream(
          filePath
        );

      let downloaded =
        0;

      streamRes.data.on(
        "data",
        chunk => {
          downloaded += chunk.length;

          if (
            downloaded >
            MAX_FILE_SIZE
          ) {
            const error =
              new Error(
                "File exceeds 100 MB limit."
              );

            streamRes.data.destroy(
              error
            );

            writer.destroy(
              error
            );
          }
        }
      );

      streamRes.data.on(
        "error",
        error => {
          writer.destroy(
            error
          );
        }
      );

      await pipeline(
        streamRes.data,
        writer
      );

      const stats =
        await fs.stat(
          filePath
        );

      if (!stats.size) {
        await fs.remove(
          filePath
        );

        filePath = null;

        throw new Error(
          "Downloaded file is empty."
        );
      }

      if (
        stats.size >
        MAX_FILE_SIZE
      ) {
        await fs.remove(
          filePath
        );

        filePath = null;

        throw new Error(
          "File exceeds 100 MB limit."
        );
      }

      const elapsed =
        (
          (Date.now() - start) /
          1000
        ).toFixed(2);

      const shortTitle =
        cleanText(title);

      const mediaType =
        isAudio
          ? "🎵 𝗔𝘂𝗱𝗶𝗼"
          : "🎬 𝗩𝗶𝗱𝗲𝗼";

      const caption =
`┏━━━━━━━━━━━━━━━━━━━━┓
┃   📥 𝗔𝗟𝗟 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

📝 𝗧𝗶𝘁𝗹𝗲: ${shortTitle}
🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${String(platform).toUpperCase()}
${mediaType}
🎯 𝗤𝘂𝗮𝗹𝗶𝘁𝘆: ${quality}
📦 𝗦𝗶𝘇𝗲: ${formatSize(stats.size)}
⏱️ 𝗧𝗶𝗺𝗲: ${elapsed}s

👨‍💻 𝗗𝗲𝘃: 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍

╰─── ⋆⋅☆⋅⋆ ───╯`;

      await message.reply({
        body: caption,
        attachment:
          fs.createReadStream(
            filePath
          )
      });

      await fs.remove(
        filePath
      );

      filePath = null;

      react("✅");

    } catch (error) {
      console.error(
        "[ALLDL ERROR]",
        error.message
      );

      console.error(
        "Code:",
        error.code || "N/A"
      );

      console.error(
        "URL:",
        error.config?.url || url
      );

      try {
        if (
          filePath &&
          await fs.pathExists(
            filePath
          )
        ) {
          await fs.remove(
            filePath
          );
        }
      } catch {}

      react("❌");

      if (!isAuto) {
        let errorMessage =
          error.message ||
          "Download failed.";

        if (
          error.code ===
          "ECONNRESET"
        ) {
          errorMessage =
            "Connection reset by media server. Please try again.";
        }

        if (
          error.code ===
            "ETIMEDOUT" ||
          error.code ===
            "ECONNABORTED"
        ) {
          errorMessage =
            "Download timed out. Please try again.";
        }

        if (
          error.code ===
          "ERR_STREAM_PREMATURE_CLOSE"
        ) {
          errorMessage =
            "Media stream closed unexpectedly. Please try again.";
        }

        if (
          error.response?.status ===
          403
        ) {
          errorMessage =
            "Media server denied access.";
        }

        if (
          error.response?.status ===
          404
        ) {
          errorMessage =
            "Media URL expired or not found.";
        }

        await message.reply(
          `❌ ${errorMessage}`
        );
      }
    }
  }
};
