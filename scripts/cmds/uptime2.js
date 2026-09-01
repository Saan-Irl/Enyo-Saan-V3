const os = require('os');
const { bold } = require("fontstyles");

module.exports = {
  config: {
    name: 'uptime2',
    aliases: ['upt2', 'up2'],
    version: '1.6',
    author: '𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍', /*create by siyuu full fixed and modified by 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍*/
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime',
    longDescription: {
      id: 'Display bot uptime and system stats with media ban check',
      en: 'Display bot uptime and system stats with media ban check'
    },
    category: 'system',
    guide: {
      id: '{pn}: Display bot uptime and system stats',
      en: '{pn}: Display bot uptime and system stats'
    }
  },
  onStart: async function ({ message, event, usersData, threadsData, api }) {

    if (this.config.author !== '𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍') {
      return message.reply("⚠ Unauthorized author change detected. Command execution stopped.");
    }

    const startTime = Date.now();
    
    try {
      const users = await usersData.getAll();
      const groups = await threadsData.getAll();
      const uptime = process.uptime();

      const bangladeshTime = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka', weekday: 'long', year: 'numeric', month: 'long', 
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
      });

      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memPercentage = (usedMemory / totalMemory * 100).toFixed(1);
      const barLength = 10;
      const filledBar = Math.round((memPercentage / 100) * barLength);
      const ramBar = "█".repeat(filledBar) + "▒".repeat(barLength - filledBar);
      const usedMemoryGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
      const cpuUsage = os.loadavg();
      const cpuModel = os.cpus()[0].model.split('@')[0].trim();
      const nodeVersion = process.version;
      const botPing = Date.now() - startTime;   
      const mediaBan = await threadsData.get(event.threadID, 'mediaBan') || false;
      const mediaStatus = mediaBan ? '🚫 Restricted' : '✅ Active';
      const editSegments = [
        `╭─❒ ${bold("SYSTEM UPTIME")}\n│ 🕒 ${days}d ${hours}h ${minutes}m ${seconds}s\n╰───────────────❒`,
        `╭─❒ ${bold("RESOURCE USAGE")}\n│ 📟 RAM: [${ramBar}] ${memPercentage}%\n│ 📥 ${usedMemoryGB}GB / ${totalMemoryGB}GB\n│ 🛡️ CPU: ${cpuModel}\n│ ⚡ Load: ${cpuUsage[0].toFixed(2)}%\n╰───────────────❒`,
        `╭─❒ ${bold("BOT STATUS")}\n│ 🚀 Ping: ${botPing}ms\n│ 📦 Node: ${nodeVersion}\n│ 👥 Users: ${users.length}\n│ 🏘️ Groups: ${groups.length}\n╰───────────────❒`,
        `╭─❒ ${bold("SECURITY & TIME")}\n│ 🖼️ Media: ${mediaStatus}\n│ 📅 ${bangladeshTime}\n╰───────────────❒`,
        `✨ ${bold("Status:")} All systems are operational.\nCreated by: ${this.config.author}`
      ];

      const loadingFrames = [
        '『 ▒▒▒▒▒▒▒▒▒▒ 』 0%',
        '『 ██▒▒▒▒▒▒▒▒ 』 25%',
        '『 █████▒▒▒▒▒ 』 50%',
        '『 ███████▒▒▒ 』 75%',
        '『 ██████████ 』 100%'
      ];

      let sentMessage = await message.reply("🔄 Fetching System Data...");

      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < editSegments.length; i++) {
        await sleep(700);
        const currentContent = `⚙️ ${bold("SYSTEM DASHBOARD")}\n${loadingFrames[i]}\n\n${editSegments.slice(0, i + 1).join('\n')}`;
        await api.editMessage(currentContent, sentMessage.messageID);
      }

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error: System data fetch failed.");
    }
  }
};
