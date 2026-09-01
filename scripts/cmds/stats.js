const fs = require("fs");
const os = require("os");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "stats",
    aliases: ["botstats"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    shortDescription: "Shows total users, groups, uptime and system stats",
    longDescription: "Fetches total users, groups, uptime, and system information.",
    category: "owner"
  },

  onStart: async function({ api, event, args, usersData, threadsData, Threads }) {
    try {
      const { threadID, messageID } = event;

      const loadingMsg = await api.sendMessage(
        `╭───〔 📊 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 〕───╮\n│\n│ ░░░░░░░░░░ 0%\n│\n╰─────────────────────`,
        threadID
      );

      const steps = [
        { percent: 20, filled: 2 },
        { percent: 50, filled: 5 },
        { percent: 80, filled: 8 },
        { percent: 100, filled: 10 }
      ];

      for (const step of steps) {
        const bar = "█".repeat(step.filled) + "░".repeat(10 - step.filled);
        await api.editMessage(
          `╭───〔 📊 𝗟𝗢𝗔𝗗𝗜𝗡𝗚 〕───╮\n│\n│ ${bar} ${step.percent}%\n│\n╰─────────────────────`,
          loadingMsg.messageID
        );
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      let usersCount = 0;
      if (usersData && typeof usersData.getAll === "function") {
        const allUsers = await usersData.getAll();
        if (Array.isArray(allUsers)) usersCount = allUsers.length;
        else if (allUsers && typeof allUsers === "object") usersCount = Object.keys(allUsers).length;
      } else if (global.users && typeof global.users === "object") {
        usersCount = Object.keys(global.users).length;
      } else {
        try {
          const raw = fs.readFileSync("./data/users.json", "utf8");
          const parsed = JSON.parse(raw);
          usersCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        } catch (e) {
          usersCount = 0;
        }
      }

      let groupsCount = 0;
      if (threadsData && typeof threadsData.getAll === "function") {
        const allThreads = await threadsData.getAll();
        if (Array.isArray(allThreads)) groupsCount = allThreads.length;
        else if (allThreads && typeof allThreads === "object") groupsCount = Object.keys(allThreads).length;
      } else if (Threads && typeof Threads.getAll === "function") {
        const all = await Threads.getAll();
        groupsCount = Array.isArray(all) ? all.length : Object.keys(all || {}).length;
      } else if (api && typeof api.getThreadList === "function") {
        try {
          const list = await new Promise((resolve, reject) => {
            api.getThreadList(500, null, (err, data) => {
              if (err) return reject(err);
              resolve(data || []);
            });
          });
          groupsCount = Array.isArray(list) ? list.length : 0;
        } catch (e) {}
      }
      if (groupsCount === 0) {
        try {
          const raw = fs.readFileSync("./data/threads.json", "utf8");
          const parsed = JSON.parse(raw);
          groupsCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed || {}).length;
        } catch (e) {}
      }

      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memPercentage = ((usedMemory / totalMemory) * 100).toFixed(1);
      const totalMemoryGB = (totalMemory / 1024 / 1024 / 1024).toFixed(2);
      const usedMemoryGB = (usedMemory / 1024 / 1024 / 1024).toFixed(2);

      const cpuModel = os.cpus()[0]?.model?.split('@')[0]?.trim() || "Unknown";
      const cpuLoad = os.loadavg()[0].toFixed(2);

      const pingStart = Date.now();
      await api.sendMessage("", threadID);
      const pingEnd = Date.now();
      const ping = pingEnd - pingStart;

      const timeBD = moment().tz("Asia/Dhaka").format("DD MMM YYYY, hh:mm:ss A");
      const nodeVersion = process.version;
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

      const memBarFilled = Math.round((usedMemory / totalMemory) * 10);
      const memBarEmpty = 10 - memBarFilled;
      const memBar = "█".repeat(memBarFilled) + "░".repeat(memBarEmpty);

      const msg = `╭───〔 📊 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗦 〕───╮\n│\n│ 👤 Users        : ${usersCount}\n│ 👥 Groups       : ${groupsCount}\n│\n│ ⏱️ Uptime       : ${uptimeString}\n│ 🕒 Time         : ${timeBD}\n│\n│ 💾 RAM          : [${memBar}] ${memPercentage}%\n│ ${usedMemoryGB}GB / ${totalMemoryGB}GB\n│\n│ 🖥️ CPU         : ${cpuModel}\n│ ⚡ Load         : ${cpuLoad}%\n│\n│ 🏓 Ping         : ${ping}ms\n│ 📦 Node         : ${nodeVersion}\n│ 💻 Heap Used    : ${heapUsedMB}MB\n│ 📊 RSS          : ${rssMB}MB\n│\n╰─────────────────────`;

      return api.editMessage(msg, loadingMsg.messageID);

    } catch (error) {
      console.error("Stats command error:", error);
      return api.sendMessage("❌ Error: Unable to fetch bot stats.", event.threadID, event.messageID);
    }
  }
};
