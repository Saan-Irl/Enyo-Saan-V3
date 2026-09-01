const { findUid: getFBID } = global.utils;
const webUrlRegex = /^(https?:\/\/[^\s]+)$/;

module.exports = {
  config: {
    name: "uid",
    version: "2.0",
    author: "ntkhanki",
    role: 0,
    shortDescription: {
      en: "Extract Facebook UID"
    },
    longDescription: {
      en: "A versatile tool to get UIDs from profile links, mentions, or message replies."
    },
    category: "utility",
    guide: {
      en: "{pn} | [tag] | [link] | reply"
    }
  },

  onStart: async function ({ message, event, args }) {
    const { senderID: myID, messageReply: replyData, mentions: taggedUsers } = event;

    if (replyData) {
      return message.reply(replyData.senderID);
    }

    if (args.length === 0) {
      return message.reply(myID);
    }

    if (webUrlRegex.test(args[0])) {
      let responseMsg = "";
      for (const inputLink of args) {
        try {
          const retrievedUid = await getFBID(inputLink);
          responseMsg += `${retrievedUid}\n`;
        } catch (error) {
          responseMsg += `⚠️ Failed: ${error.message || "Invalid Link"}\n`;
        }
      }
      return message.reply(responseMsg.trim());
    }

    const taggedKeys = Object.keys(taggedUsers);
    if (taggedKeys.length > 0) {
      const allMentionedIds = taggedKeys.join("\n");
      return message.reply(allMentionedIds);
    }

    return message.reply("Invalid input. Use a link, tag someone, or reply to a message.");
  }
};
