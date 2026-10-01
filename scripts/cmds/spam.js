module.exports = {
  config: {
    name: "spam",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍", //kim/zed
    role: 2,
    shortDescription: "Repeat text sender",
    longDescription: "Sends a selected message multiple times with a controlled interval.",
    category: "system",
    guide: "{pn} <count> <text>"
  },

  onStart: async function ({ api, event, args }) {

    const count = Number(args.shift());
    const text = args.join(" ");

    if (!count || !text) {
      return api.sendMessage("❌ Usage: /spam <count> <text>", event.threadID);
    }

    if (count < 1 || count > 100) {
      return api.sendMessage("⚠️ Please choose a number between 1 and 100.", event.threadID);
    }

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let sent = 0;

    while (sent < count) {
      await api.sendMessage(text, event.threadID);
      sent++;
      await wait(180);
    }
  }
};
