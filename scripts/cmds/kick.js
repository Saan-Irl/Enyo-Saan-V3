module.exports = {
  config: {
    name: "kick",
    aliases: ["kik"],
    version: "2.3",
    author: "ntkhanki||updated by 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃",
    countDown: 5,
    role: 1,
    shortDescription: "Kick members from group",
    longDescription: "Remove members by tagging or replying with real-time admin check.",
    category: "box chat",
    guide: "{pn} @tag or reply"
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const botID = api.getCurrentUserID();

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(item => item.id);

      if (!adminIDs.includes(botID)) {
        return message.reply("⚠️ Bot is not an admin in this group. Please promote the bot to admin first!");
      }

      let uids = [];
      if (messageReply) {
        uids.push(messageReply.senderID);
      } else if (Object.keys(mentions).length > 0) {
        uids = Object.keys(mentions);
      }

      if (uids.length === 0) {
        return message.reply("❌ Please tag the user or reply to their message to kick.");
      }

      for (let uid of uids) {
        if (uid == botID) continue;
        
        await api.removeUserFromGroup(uid, threadID, (err) => {
          if (err) return message.reply(`❌ Failed to kick UID: ${uid}`);
        });
      }

    } catch (error) {
      console.error(error);
      return message.reply("⚠️ An error occurred! Please check bot permissions or Facebook restrictions.");
    }
  }
};
