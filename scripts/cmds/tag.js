module.exports = {
  config: {
    name: "tag",
    version: "3.0",
    category: "box chat",
    role: 0,
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 3,
    description: {
      en: "Real mention users"
    },
    guide: {
      en: "{pm}tag [name]\n{pm}tag all\nReply + {pm}tag"
    }
  },

  onStart: async ({ api, event, usersData, threadsData, args }) => {
    const { threadID, messageID, messageReply } = event;

    try {
      const threadData = await threadsData.get(threadID);
      const members = threadData.members
        .filter(m => m.inGroup === true)
        .map(m => ({
          name: m.name || "User",
          id: m.userID
        }));

      let tagUsers = [];

      if (messageReply) {
        const uid = messageReply.senderID;
        const name = (await usersData.getName(uid)) || "User";
        tagUsers.push({ name, id: uid });
      } else if (args[0] && ["all", "cdi", "everyone"].includes(args[0].toLowerCase())) {
        tagUsers = members;
      } else {
        if (!args[0]) {
          return api.sendMessage("⚠️ Mention user or reply.", threadID, messageID);
        }

        const searchName = args[0].toLowerCase();
        tagUsers = members.filter(m => m.name.toLowerCase().includes(searchName));

        if (tagUsers.length === 0) {
          return api.sendMessage("❌ User Not Found", threadID, messageID);
        }
      }

      const mentions = [];
      const nameTags = [];
      const nameCount = {};

      for (const u of tagUsers) {
        let tag = `@${u.name}`;

        if (nameCount[u.name]) {
          tag += "\u200B".repeat(nameCount[u.name]);
          nameCount[u.name]++;
        } else {
          nameCount[u.name] = 1;
        }

        nameTags.push(tag);
        mentions.push({ tag: tag, id: u.id });
      }

      const body = nameTags.join(" ");

      return api.sendMessage(
        { body, mentions },
        threadID,
        messageReply ? messageReply.messageID : messageID
      );

    } catch (err) {
      return api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
