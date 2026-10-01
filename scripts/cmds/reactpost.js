module.exports = {
  config: {
    name: "postreact",
    aliases: ["react"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    role: 0,
    shortDescription: "React to a Facebook post via ID",
    longDescription: "Give any reaction (LIKE, LOVE, WOW, HAHA, SAD, ANGRY) to a Facebook post using its ID.",
    category: "utility",
    guide: {
      en: "{p}react [postID] [type]"
    },
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const postID = args[0];
    const type = args[1] ? args[1].toUpperCase() : "LIKE";

    const validReactions = ["LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY", "CARE"];
    
    if (!postID) {
      return api.sendMessage("Please provide a Post ID. Usage: /react [postID] [type]", threadID, messageID);
    }

    if (!validReactions.includes(type)) {
      return api.sendMessage(`Invalid reaction! Available: ${validReactions.join(", ")}`, threadID, messageID);
    }

    api.setPostReaction(postID, type, (err) => {
      if (err) {
        return api.sendMessage("Failed to react. Possible reasons:\n1. Invalid Post ID.\n2. Post is not Public.\n3. Bot session expired.", threadID, messageID);
      }
      return api.sendMessage(`Successfully reacted ${type} to post: ${postID}`, threadID, messageID);
    });
  }
};
