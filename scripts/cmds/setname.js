async function checkShortCut(nickname, uid, usersData) {
  try {
    if (/\{userName\}/gi.test(nickname)) {
      nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid));
    }
    if (/\{userID\}/gi.test(nickname)) {
      nickname = nickname.replace(/\{userID\}/gi, uid);
    }
    return nickname;
  } catch (e) {
    return nickname;
  }
}

module.exports = {
  config: {
    name: "setname",
    version: "2.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: "Change nickname of all members in chat or members tagged by a format",
    category: "box chat",
    guide: {
      en: "   {pn} <nick name>: change nickname of yourself"
        + "\n   {pn} @tags <nick name>: change nickname of members tagged"
        + "\n   {pn} all <nick name>: change nickname of all members in chat"
        + "\n\nWith available shortcuts:"
        + "\n   + {userName}: name of member"
        + "\n   + {userID}: ID of member"
        + "\n\n   Example: {pn} all {userName} 👑"
    }
  },

  langs: {
    en: {
      error: "❌ An error has occurred. Please try again later.",
      noName: "❌ Please provide a nickname to set.",
      success: "✅ Nickname changed successfully!",
      successMultiple: "✅ Nickname changed for {count} members successfully!"
    }
  },

  onStart: async function ({ args, message, event, api, usersData, getLang }) {
    const mentions = Object.keys(event.mentions);
    let uids = [];
    let nickname = args.join(" ");

    if (args[0] === "all" || mentions.includes(event.threadID)) {
      const threadInfo = await api.getThreadInfo(event.threadID);
      uids = threadInfo.participantIDs;
      nickname = args[0] === "all" ? args.slice(1).join(" ") : nickname.replace(event.mentions[event.threadID], "").trim();
    } else if (mentions.length > 0) {
      uids = mentions;
      const allName = new RegExp(
        Object.values(event.mentions)
          .map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
          .join("|"),
        "g"
      );
      nickname = nickname.replace(allName, "").trim();
    } else {
      uids = [event.senderID];
      nickname = nickname.trim();
    }

    if (!nickname) {
      return message.reply(getLang("noName"));
    }

    try {
      for (const uid of uids) {
        const newNickname = await checkShortCut(nickname, uid, usersData);
        await api.changeNickname(newNickname, event.threadID, uid);
      }
      
      const successMsg = uids.length === 1 
        ? getLang("success") 
        : getLang("successMultiple").replace("{count}", uids.length);
      
      return message.reply(successMsg);

    } catch (e) {
      console.error("Setname error:", e);
      return message.reply(getLang("error"));
    }
  }
};
