module.exports = {
  config: {
    name: "gcadmin",
    version: "1.1",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍 | Edited by ChatGPT",
    role: 1,
    shortDescription: {
      en: "Make or remove someone as admin"
    },
    longDescription: {
      en: "Only the owner, bot admin or group admin can make or remove someone as admin."
    },
    category: "box chat",
    guide: {
      en: "/admin add [mention/reply/uid] or /admin remove [mention/reply/uid]"
    }
  },

  onStart: async function ({ api, event, args }) {
    // Multiple owner UIDs
    const ownerUIDs = ["61582662637419", "100081088184521"];

    const senderID = event.senderID;
    const threadID = event.threadID;

    // Get Thread Info
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (e) {
      return api.sendMessage("❌ Could not fetch thread info.", threadID);
    }

    // Check admin roles
    const isGroupAdmin = threadInfo.adminIDs.some(a => a.id == senderID);
    const isBotAdmin = threadInfo.adminIDs.some(a => a.id == api.getCurrentUserID());
    const isOwner = ownerUIDs.includes(senderID);

    // Permission check
    if (!isOwner && !isGroupAdmin && !isBotAdmin) {
      return api.sendMessage("❌ You do not have permission to use this command.", threadID);
    }

    // Command validation
    const action = args[0];
    if (!["add", "remove"].includes(action)) {
      return api.sendMessage("❌ Invalid command.\nUse: /admin add @tag or /admin remove @tag", threadID);
    }

    // Identify target user
    let uid = null;

    if (event.messageReply) {
      uid = event.messageReply.senderID;
    } 
    else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }
    else if (args[1]) {
      uid = args[1];
    }

    if (!uid) {
      return api.sendMessage("❌ Please reply/mention or provide a UID.", threadID);
    }

    // Apply admin status
    try {
      const makeAdmin = action === "add";

      await api.changeAdminStatus(threadID, uid, makeAdmin);

      api.sendMessage(
        makeAdmin ? 
        "🙂" : 
        "🙂",
        threadID
      );

    } catch (err) {
      api.sendMessage("❌ Failed. Make sure the bot is an admin in this group.", threadID);
      console.error(err);
    }
  }
};
