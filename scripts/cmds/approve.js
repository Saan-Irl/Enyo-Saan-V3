module.exports = {
  config: {
    name: "approve",
    aliases: ["aprv"],
    version: "3.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 1,
    shortDescription: { en: "Approve pending members" },
    category: "box chat",
    guide: { en: "{pn} | {pn} 1 | {pn} all" }
  },

  onStart: async ({ api, event, args, commandName }) => {
    const { threadID, messageID, senderID, isGroup } = event;
    if (!isGroup) return api.sendMessage("❌ Group only.", threadID, messageID);

    let info;
    try {
      info = await api.getThreadInfo(threadID);
    } catch {
      return api.sendMessage("❌ Failed to get pending list.", threadID, messageID);
    }

    const queue = info?.approvalQueue || [];
    if (!queue.length) return api.sendMessage("✅ No pending members.", threadID, messageID);

    const approve = async targets => {
      const msg = await api.sendMessage(`⏳ Approving ${targets.length} member(s)...`, threadID);
      let ok = 0, fail = 0;

      for (const user of targets) {
        try {
          await api.addUserToGroup(user.requesterID, threadID);
          ok++;
        } catch {
          fail++;
        }
      }

      const result = `Done ${ok} member(s) ✅\nFailed ${fail} member(s) ❎`;

      try {
        await api.editMessage(result, msg.messageID);
      } catch {
        await api.sendMessage(result, threadID);
        try { await api.unsendMessage(msg.messageID); } catch {}
      }
    };

    if (args.length) {
      if (/^all$/i.test(args[0])) return approve(queue);

      const targets = [];
      for (const n of args) {
        if (!/^\d+$/.test(n) || n < 1 || n > queue.length)
          return api.sendMessage(`❌ Invalid number: ${n}`, threadID, messageID);
        targets.push(queue[n - 1]);
      }
      return approve(targets);
    }

    let names = {};
    try {
      names = await api.getUserInfo(queue.map(x => x.requesterID));
    } catch {}

    const list = queue.map((x, i) =>
      `${i + 1}. ${names?.[x.requesterID]?.name || "Unknown"} (${x.requesterID})`
    ).join("\n");

    return api.sendMessage(
      `🔔 PENDING MEMBERS (${queue.length})\n\n${list}\n\nReply with number(s) to approve.`,
      threadID,
      (err, m) => {
        if (!err) global.GoatBot.onReply.set(m.messageID, {
          commandName,
          author: senderID,
          queue
        });
      },
      messageID
    );
  },

  onReply: async ({ api, event, Reply }) => {
    if (event.senderID !== Reply.author) return;

    const input = event.body.trim();
    let targets;

    if (/^all$/i.test(input)) {
      targets = Reply.queue;
    } else {
      targets = [];
      for (const n of input.split(/\s+/)) {
        if (!/^\d+$/.test(n) || n < 1 || n > Reply.queue.length)
          return api.sendMessage(`❌ Invalid number: ${n}`, event.threadID, event.messageID);
        targets.push(Reply.queue[n - 1]);
      }
    }

    try { await api.unsendMessage(event.messageID); } catch {}
    global.GoatBot.onReply.delete(event.messageID);

    const msg = await api.sendMessage(
      `⏳ Approving ${targets.length} member(s)...`,
      event.threadID
    );

    let ok = 0, fail = 0;

    for (const user of targets) {
      try {
        await api.addUserToGroup(user.requesterID, event.threadID);
        ok++;
      } catch {
        fail++;
      }
    }

    const result = `Done ${ok} member(s) ✅\nFailed ${fail} member(s) ❎`;

    try {
      await api.editMessage(result, msg.messageID);
    } catch {
      await api.sendMessage(result, event.threadID);
      try { await api.unsendMessage(msg.messageID); } catch {}
    }
  }
};
