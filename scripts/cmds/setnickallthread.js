module.exports = {
  config: {
    name: "setallnick",
    version: "3.0",
    role: 2,
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    description: "Set bot nickname in all groups",
    category: "admin",
    guide: "{pn} <nickname>",
    countDown: 50
  },
  onStart: async function ({ api, event, args, threadsData }) {
    const newNickname = args.join(" ");
    if (!newNickname) {
      return api.sendMessage("❌ Please enter a nickname.\nExample: /setallnick MyBot", event.threadID);
    }
    const allThreads = await threadsData.getAll();
    if (!allThreads || allThreads.length === 0) {
      return api.sendMessage("❌ No threads found in database.", event.threadID);
    }
    let successCount = 0;
    let failCount = 0;
    const botID = api.getCurrentUserID();
    const statusMsg = await api.sendMessage(`⏳ Changing nickname in ${allThreads.length} groups...`, event.threadID);
    const batchSize = 10;
    for (let i = 0; i < allThreads.length; i += batchSize) {
      const batch = allThreads.slice(i, i + batchSize);
      await Promise.all(batch.map(async (thread) => {
        const threadID = thread.threadID;
        try {
          await api.changeNickname(newNickname, threadID, botID);
          successCount++;
        } catch {
          failCount++;
        }
      }));
      await api.editMessage(
        `⏳ Progress: ${Math.min(i + batchSize, allThreads.length)}/${allThreads.length} groups processed.\n✅ Success: ${successCount} | ❌ Failed: ${failCount}`,
        statusMsg.messageID
      );
    }
    return api.editMessage(
      `✅ Nickname change completed!\n\n🔹 Successfully changed: ${successCount}\n❌ Failed: ${failCount}\n📊 Total groups processed: ${allThreads.length}`,
      statusMsg.messageID
    );
  }
};
