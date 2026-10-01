function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  config: {
    name: "filteruser",
    version: "2.2",
    author: "NTKhang",
    countDown: 5,
    role: 1,
    description: {
      en: "filter group members by number of messages or locked account"
    },
    category: "box chat",
    guide: {
      en: "   {pn} [<number of messages> | die]"
    }
  },

  langs: {
    en: {
      needAdmin: "⚠️ | Please add the bot as a group admin to use this command",
      botNotAdmin: "🤖 | Bot is not an admin in this group. Please make bot admin first.",
      confirm: "⚠️ | Are you sure you want to delete group members with less than %1 messages?\nReact to this message to confirm",
      kickByBlock: "✅ | Successfully removed %1 members with locked accounts",
      kickByMsg: "✅ | Successfully removed %1 members with less than %2 messages",
      kickError: "❌ | An error occurred and could not kick %1 members:\n%2",
      noBlock: "✅ | There are no members with locked accounts",
      noMsg: "✅ | There are no members with less than %1 messages",
      noMembers: "✅ | No members to remove.",
      dieInvalid: "❌ | Invalid command. Use: filteruser <number> or filteruser die",
      notAdminMsg: "❌ | You are not a group admin. Only admins can use this command."
    }
  },

  onStart: async function ({ api, args, message, event, commandName, getLang }) {
    const { senderID, threadID } = event;

    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id == botID);
    const isUserAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);

    if (!isUserAdmin) {
      return message.reply(getLang("notAdminMsg"));
    }

    if (!args[0]) {
      return message.reply(getLang("dieInvalid"));
    }

    if (!isBotAdmin) {
      return message.reply(getLang("botNotAdmin"));
    }

    if (!isNaN(args[0])) {
      const minMsg = Number(args[0]);
      if (minMsg < 1) {
        return message.reply("❌ | Minimum message count must be greater than 0.");
      }
      message.reply(getLang("confirm", minMsg), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          author: senderID,
          messageID: info.messageID,
          minimum: minMsg,
          commandName
        });
      });
    } else if (args[0].toLowerCase() === "die") {
      const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
      const errors = [];
      const success = [];
      for (const user of membersBlocked) {
        if (user.type !== "User" && !threadInfo.adminIDs.some(id => id == user.id)) {
          try {
            await api.removeUserFromGroup(user.id, threadID);
            success.push(user.id);
          } catch (e) {
            errors.push(user.name);
          }
          await sleep(700);
        }
      }

      let msg = "";
      if (success.length > 0)
        msg += `${getLang("kickByBlock", success.length)}\n`;
      if (errors.length > 0)
        msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
      if (msg === "")
        msg += getLang("noBlock");
      message.reply(msg);
    } else {
      message.reply(getLang("dieInvalid"));
    }
  },

  onReaction: async function ({ api, Reaction, event, message, getLang }) {
    const { minimum = 1, author } = Reaction;
    const { senderID, threadID } = event;
    if (event.userID != author) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const isUserAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);
    const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id == botID);

    if (!isUserAdmin) {
      return message.reply(getLang("notAdminMsg"));
    }

    if (!isBotAdmin) {
      return message.reply(getLang("botNotAdmin"));
    }

    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const membersCountLess = threadInfo.userInfo.filter(member =>
      member.type === "User" &&
      member.count < minimum &&
      member.id != botID &&
      !adminIDs.includes(member.id)
    );

    if (membersCountLess.length === 0) {
      return message.reply(getLang("noMembers"));
    }

    const errors = [];
    const success = [];
    for (const member of membersCountLess) {
      try {
        await api.removeUserFromGroup(member.id, threadID);
        success.push(member.id);
      } catch (e) {
        errors.push(member.name);
      }
      await sleep(700);
    }

    let msg = "";
    if (success.length > 0)
      msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
    if (errors.length > 0)
      msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
    if (msg === "")
      msg += getLang("noMsg", minimum);
    message.reply(msg);
  }
};
