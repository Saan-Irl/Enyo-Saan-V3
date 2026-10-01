const axios = require("axios");

module.exports = {
  config: {
    name: "god",
    aliases: ["210"],
    version: "1.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 2, // Only admin can use
    shortDescription: {
      en: "Invite up to 250 friends to the group"
    },
    longDescription: {
      en: "This command allows group admins to invite up to 250 friends from their friend list to the current group."
    },
    category: "box chat",
    guide: {
      en: "Use {p}god to invite up to 250 friends to this group (admin only)."
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    try {
      // Permission check
      const threadInfo = await api.getThreadInfo(threadID);
      const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);

      if (!isAdmin) {
        return api.sendMessage("❌ You must be a group admin to use this command.", threadID);
      }

      const allFriends = await api.getFriendsList();

      if (!allFriends || allFriends.length === 0) {
        return api.sendMessage("⚠️ No friends found in your friend list.", threadID);
      }

      const limit = 250;
      const inviteCount = Math.min(allFriends.length, limit);
      let invited = 0;

      for (let i = 0; i < inviteCount; i++) {
        try {
          await api.addUserToGroup(allFriends[i].userID, threadID);
          invited++;
        } catch (err) {
          continue; // Skip if unable to add (e.g. user restricts group adds)
        }
      }

      if (allFriends.length < limit) {
        return api.sendMessage(`✅ ${invited} friend(s) were invited.\nNote: You have less than 250 friends.`, threadID);
      } else {
        return api.sendMessage(`✅ Successfully invited 250 friends to the group.`, threadID);
      }

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ An error occurred while trying to invite friends. Please try again later.", event.threadID);
    }
  }
};
