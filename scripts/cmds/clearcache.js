const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "clearcache",
    aliases: ["ccache", "clear"],
    version: "1.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 2,
    countDown: 5,
    shortDescription: { en: "Clear cache folder" },
    longDescription: { en: "Delete all files from cache folder to free up storage space." },
    category: "admin",
    guide: { en: "{pn} - Clear all cache files" }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID } = event;
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) {
      return message.reply("📁 Cache folder does not exist.");
    }

    const statusMsg = await message.reply("⏳ Scanning cache folder...");

    try {
      const files = await fs.readdir(cacheDir);
      if (files.length === 0) {
        return api.editMessage("✅ Cache folder is already empty.", statusMsg.messageID);
      }

      let deletedFiles = [];
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            const fileName = path.basename(filePath);
            await fs.remove(filePath);
            deletedFiles.push(fileName);
            deletedCount++;
          }
        } catch (e) {}
      }

      try {
        const subdirs = await fs.readdir(cacheDir);
        for (const subdir of subdirs) {
          const subdirPath = path.join(cacheDir, subdir);
          const stats = await fs.stat(subdirPath);
          if (stats.isDirectory()) {
            const subFiles = await fs.readdir(subdirPath);
            if (subFiles.length === 0) {
              await fs.rmdir(subdirPath);
            }
          }
        }
      } catch (e) {}

      let fileList = deletedFiles.map((name, i) => `${i+1}. ${name}`).join("\n");
      if (fileList.length > 2000) {
        fileList = fileList.substring(0, 2000) + "\n... and more";
      }

      const finalMsg = `🗑️ 𝗖𝗔𝗖𝗛𝗘 𝗖𝗟𝗘𝗔𝗡𝗨𝗣\n━━━━━━━━━━━━━━━━━━\n📁 Folder: cache/\n🗂️ Total files deleted: ${deletedCount}\n\n📄 Deleted files:\n${fileList || "No files deleted."}\n━━━━━━━━━━━━━━━━━━\n✅ Cache cleaned successfully!`;

      return api.editMessage(finalMsg, statusMsg.messageID);

    } catch (error) {
      console.error("Cache cleanup error:", error);
      return api.editMessage(`❌ Failed to clear cache: ${error.message}`, statusMsg.messageID);
    }
  }
};
