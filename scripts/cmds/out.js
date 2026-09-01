module.exports = {
  config: {
    name: "out",
    aliases: ["out"],
    version: "2.5",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 1,
    shortDescription: "Bot will leave group",
    longDescription: "",
    category: "admin",
    guide: {
      vi: "{pn} [tid,blank]",
      en: "{pn} [tid,blank]"
    }
  },

  onStart: async function ({ api, event, args }) {
    let id;

    if (!args.join(" ")) {
      id = event.threadID;
    } else {
      id = parseInt(args.join(" "));
    }

    const leaveMessage = `𝐥𝐞𝐟𝐭 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩..!🦆💨`;

    return api.sendMessage(
      leaveMessage,
      id,
      () => api.removeUserFromGroup(api.getCurrentUserID(), id)
    );
  }
};
