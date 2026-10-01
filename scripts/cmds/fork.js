const axios = require("axios");

const REPO_OWNER = "Fineshyt-Saan";
const REPO_NAME = "SAAN-GOATBOT-V3-UPDATED";
const REPO_LINK = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const REPO_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

module.exports = {
  config: {
    name: "fork",
    version: "4.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Show github repository link",
    category: "utility",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: `🐐 𝗦𝗔𝗔𝗡-𝗚𝗢𝗔𝗧𝗕𝗢𝗧-𝗩𝟯-𝗨𝗣𝗗𝗔𝗧𝗘𝗗
━━━━━━━━━━━━━━━━━━━━
⭐ ▰▰▰▰▰▰▰▱▱▱  %2 Stars
🍴 ▰▰▰▰▰▰▰▰▰▱  %3 Forks
━━━━━━━━━━━━━━━━━━━━
🔗 %1
👑 Maintained by 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍`
    }
  },

  onStart: async function ({ message, getLang }) {
    const { stars, forks } = await getRepoStats();
    return message.reply(
      getLang("current", REPO_LINK, stars, forks)
    );
  },

  onChat: async function ({ message, getLang, event }) {
    if (
      event.body &&
      event.body.toLowerCase().trim() === "fork"
    ) {
      const { stars, forks } = await getRepoStats();

      return message.reply(
        getLang("current", REPO_LINK, stars, forks)
      );
    }
  }
};

async function getRepoStats() {
  try {
    const { data } = await axios.get(REPO_API, {
      timeout: 10000,
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "SAAN-GOATBOT-V3"
      }
    });

    return {
      stars: data.stargazers_count ?? "N/A",
      forks: data.forks_count ?? "N/A"
    };
  } catch (error) {
    return {
      stars: "N/A",
      forks: "N/A"
    };
  }
}