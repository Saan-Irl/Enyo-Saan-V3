module.exports = {
  config: {
    name: "unsent",
    aliases: ["u", "uns", "un", "r"],
    version: "3.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 2,
    role: 0,
    shortDescription: "Unsend bot's message ",
    category: "utility"
  },

  onChat: async function ({ api, event }) {
    const { messageReply, body, type } = event;
    const triggers = ["unsent", "u", "uns", "un", "r"];

    if (!triggers.includes(body?.toLowerCase())) return;

    if (type === "message_reply" && messageReply.senderID === api.getCurrentUserID()) {
      try {
        await api.unsendMessage(event.messageReply.messageID, event.threadID);
      } catch {}
    }
  },

  onStart: async function ({ api, event }) {
    const { messageReply, type } = event;

    if (type === "message_reply" && messageReply?.senderID === api.getCurrentUserID()) {
      try {
        await api.unsendMessage(event.messageReply.messageID, event.threadID);
      } catch {}
    }
  }
};
