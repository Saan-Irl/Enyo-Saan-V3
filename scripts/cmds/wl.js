const fs = require("fs-extra");
const { config } = global.GoatBot;

module.exports = {
	config: {
		name: "wl",
		aliases: ["whitelist"],
		version: "4.0",
		author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
		countDown: 3,
		role: 2,
		longDescription: {
			en: "Manage user & thread whitelist in one command"
		},
		category: "owner",
		guide: {
			en:
				"👤 USER WHITELIST\n" +
				"   {pn} user on | off → enable/disable user whitelist mode\n" +
				"   {pn} user add <uid | @tag | reply> → add user(s)\n" +
				"   {pn} user remove <uid | @tag | reply> → remove user(s)\n" +
				"   {pn} user list → list whitelisted users\n\n" +
				"👥 THREAD WHITELIST\n" +
				"   {pn} thread on | off → enable/disable thread whitelist mode\n" +
				"   {pn} thread add [tid] → add this/specific thread\n" +
				"   {pn} thread remove [tid] → remove this/specific thread\n" +
				"   {pn} thread list → list whitelisted threads\n\n" +
				"📊 STATUS\n" +
				"   {pn} status → show both whitelist statuses"
		}
	},

	langs: {
		en: {
			userAdded: "✅ | Added whiteList role for %1 users:\n%2",
			userAlready: "\n⚠ | %1 users already have whiteList role:\n%2",
			userMissingAdd: "⚠ | Please enter ID, tag or reply to a user to add in whiteListIds",
			userRemoved: "✅ | Removed whiteList role of %1 users:\n%2",
			userNotIn: "⚠ | %1 users don't have whiteListIds role:\n%2",
			userMissingRemove: "⚠ | Please enter ID, tag or reply to a user to remove whiteListIds",
			userList: "👑 | List of whiteListIds:\n%1",
			userListEmpty: "👑 | No users in whiteListIds",
			userOn: "✅ | User whitelist mode: ON",
			userOff: "✅ | User whitelist mode: OFF",

			threadOn: "✅ 𝗪𝗛𝗜𝗧𝗘𝗟𝗜𝗦𝗧-𝗧𝗛𝗥𝗘𝗔𝗗 𝗠𝗢𝗗𝗘: 𝗢𝗡\n━━━━━━━━━━━━━━━━━━\n🔒 Only bot admins can use the bot in groups NOT on the whitelist.\n📋 Whitelisted groups : %1",
			threadOff: "🚫 𝗪𝗛𝗜𝗧𝗘𝗟𝗜𝗦𝗧-𝗧𝗛𝗥𝗘𝗔𝗗 𝗠𝗢𝗗𝗘: 𝗢𝗙𝗙\n━━━━━━━━━━━━━━━━━━\n🌍 The bot now works normally in every group.",
			threadAddedThis: "✅ 𝗔𝗗𝗗𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n📌 This group (%1) has been added to the whitelist.",
			threadAddedId: "✅ 𝗔𝗗𝗗𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n📌 Group %1 has been added to the whitelist.",
			threadAlready: "ℹ️ Group %1 is already on the whitelist.",
			threadRemovedThis: "✅ 𝗥𝗘𝗠𝗢𝗩𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n📌 This group (%1) has been removed from the whitelist.",
			threadRemovedId: "✅ 𝗥𝗘𝗠𝗢𝗩𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n📌 Group %1 has been removed from the whitelist.",
			threadNotIn: "ℹ️ Group %1 wasn't on the whitelist.",
			threadList: "📋 𝗪𝗛𝗜𝗧𝗘𝗟𝗜𝗦𝗧𝗘𝗗 𝗚𝗥𝗢𝗨𝗣𝗦\n━━━━━━━━━━━━━━━━━━\n%1",
			threadListEmpty: "📋 𝗪𝗛𝗜𝗧𝗘𝗟𝗜𝗦𝗧𝗘𝗗 𝗚𝗥𝗢𝗨𝗣𝗦\n━━━━━━━━━━━━━━━━━━\nNo groups have been whitelisted yet.",

			status: "🔐 𝗪𝗛𝗜𝗧𝗘𝗟𝗜𝗦𝗧 𝗦𝗧𝗔𝗧𝗨𝗦\n━━━━━━━━━━━━━━━━━━\n👤 User mode   : %1\n👥 Thread mode : %2\n• Whitelisted users   : %3\n• Whitelisted threads : %4",
			syntaxError: "⚠ | Invalid usage! Type {pn} for guide."
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, prefix, commandName, threadsData }) {
		const { client } = global;

		if (!config.whiteListMode)
			config.whiteListMode = { enable: false, whiteListIds: [] };
		if (!Array.isArray(config.whiteListMode.whiteListIds))
			config.whiteListMode.whiteListIds = [];

		if (!config.whiteListModeThread)
			config.whiteListModeThread = { enable: false, whiteListThreadIds: [] };
		if (!Array.isArray(config.whiteListModeThread.whiteListThreadIds))
			config.whiteListModeThread.whiteListThreadIds = [];

		const saveConfig = () => fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

		const type = (args[0] || "").toLowerCase();
		const sub = (args[1] || "").toLowerCase();

		const extractUIDs = (startIndex) => {
			let uids = [];
			const mentions = event.mentions || {};
			if (Object.keys(mentions).length > 0)
				uids.push(...Object.keys(mentions));
			if (event.messageReply && event.messageReply.senderID)
				uids.push(String(event.messageReply.senderID));
			const numericArgs = args.slice(startIndex).filter(a => /^\d+$/.test(a));
			uids.push(...numericArgs);
			return [...new Set(uids.filter(Boolean))];
		};

		if (type === "user" || type === "u") {
			switch (sub) {
				case "on": {
					config.whiteListMode.enable = true;
					saveConfig();
					return message.reply(getLang("userOn"));
				}
				case "off": {
					config.whiteListMode.enable = false;
					saveConfig();
					return message.reply(getLang("userOff"));
				}
				case "add":
				case "-a": {
					const uids = extractUIDs(2);
					if (uids.length === 0)
						return message.reply(getLang("userMissingAdd"));

					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					config.whiteListMode.whiteListIds.push(...notAdminIds);

					const getNames = await Promise.all(
						uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
					);
					saveConfig();

					return message.reply(
						(notAdminIds.length > 0
							? getLang("userAdded", notAdminIds.length, getNames.filter(n => notAdminIds.includes(n.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
							: "") +
						(adminIds.length > 0
							? getLang("userAlready", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n"))
							: "")
					);
				}
				case "remove":
				case "-r": {
					const uids = extractUIDs(2);
					if (uids.length === 0)
						return message.reply(getLang("userMissingRemove"));

					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);

					const getNames = await Promise.all(
						adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
					);
					saveConfig();

					return message.reply(
						(adminIds.length > 0
							? getLang("userRemoved", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n"))
							: "") +
						(notAdminIds.length > 0
							? getLang("userNotIn", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n"))
							: "")
					);
				}
				case "list":
				case "-l": {
					if (config.whiteListMode.whiteListIds.length === 0)
						return message.reply(getLang("userListEmpty"));
					const getNames = await Promise.all(
						config.whiteListMode.whiteListIds.map(uid =>
							usersData.getName(uid).then(name => ({ uid, name }))
						)
					);
					return message.reply(getLang("userList", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
				}
				default:
					return message.reply(getLang("syntaxError", prefix, commandName));
			}
		}

		if (type === "thread" || type === "t") {
			const wltConfig = config.whiteListModeThread;
			const getThreadLabel = async (tid) => {
				try {
					const t = await threadsData.get(tid);
					return t?.threadName ? `${t.threadName} (${tid})` : tid;
				} catch {
					return tid;
				}
			};

			const tidArg = args[2];

			switch (sub) {
				case "on": {
					wltConfig.enable = true;
					saveConfig();
					return message.reply(getLang("threadOn", wltConfig.whiteListThreadIds.length));
				}
				case "off": {
					wltConfig.enable = false;
					saveConfig();
					return message.reply(getLang("threadOff"));
				}
				case "add": {
					const targetID = tidArg && /^\d+$/.test(tidArg) ? tidArg : event.threadID;
					const usingCurrent = targetID === event.threadID && !tidArg;

					if (wltConfig.whiteListThreadIds.includes(targetID))
						return message.reply(getLang("threadAlready", targetID));

					wltConfig.whiteListThreadIds.push(targetID);
					saveConfig();
					return message.reply(usingCurrent ? getLang("threadAddedThis", targetID) : getLang("threadAddedId", targetID));
				}
				case "remove": {
					const targetID = tidArg && /^\d+$/.test(tidArg) ? tidArg : event.threadID;
					const usingCurrent = targetID === event.threadID && !tidArg;

					if (!wltConfig.whiteListThreadIds.includes(targetID))
						return message.reply(getLang("threadNotIn", targetID));

					wltConfig.whiteListThreadIds = wltConfig.whiteListThreadIds.filter(id => id !== targetID);
					saveConfig();
					return message.reply(usingCurrent ? getLang("threadRemovedThis", targetID) : getLang("threadRemovedId", targetID));
				}
				case "list": {
					if (wltConfig.whiteListThreadIds.length === 0)
						return message.reply(getLang("threadListEmpty"));
					const labels = await Promise.all(wltConfig.whiteListThreadIds.map(getThreadLabel));
					return message.reply(getLang("threadList", labels.map(l => `• ${l}`).join("\n")));
				}
				default:
					return message.reply(getLang("syntaxError", prefix, commandName));
			}
		}

		if (type === "status" || type === "s" || type === "") {
			return message.reply(
				getLang(
					"status",
					config.whiteListMode.enable ? "ON ✅" : "OFF 🚫",
					config.whiteListModeThread.enable ? "ON ✅" : "OFF 🚫",
					config.whiteListMode.whiteListIds.length,
					config.whiteListModeThread.whiteListThreadIds.length
				)
			);
		}

		return message.reply(getLang("syntaxError", prefix, commandName));
	}
};