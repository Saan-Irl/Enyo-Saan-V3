const { getTime } = global.utils;

module.exports = {
	config: {
		name: "user",
		version: "1.5",
		author: "NTKhang & 𝐒𝐀𝐀𝐍 𝐄𝐗𝐇𝐀𝐔𝐒𝐓𝐄𝐃",
		countDown: 5,
		role: 2,
		description: {
			vi: "Quản lý người dùng trong hệ thống bot",
			en: "Manage users in bot system"
		},
		category: "owner",
		guide: {
			vi: "   {pn} [find | -f | search | -s] <tên>: tìm kiếm người dùng"
				+ "\n   {pn} [ban | -b] [<uid> | @tag | reply] <lý do>: cấm người dùng"
				+ "\n   {pn} unban [<uid> | @tag | reply]: bỏ cấm người dùng"
				+ "\n   {pn} [list | -l]: xem danh sách người dùng bị cấm",
			en: "   {pn} [find | -f | search | -s] <name>: search for users"
				+ "\n   {pn} [ban | -b] [<uid> | @tag | reply] <reason>: ban user"
				+ "\n   {pn} unban [<uid> | @tag | reply]: unban user"
				+ "\n   {pn} [list | -l]: list all banned users"
		}
	},

	langs: {
		vi: {
			noUserFound: "❌ Không tìm thấy người dùng nào có tên khớp với từ khóa: \"%1\"",
			userFound: "🔎 Tìm thấy %1 người dùng khớp với \"%2\":\n%3",
			uidRequired: "Uid của người cần ban không được để trống.",
			reasonRequired: "Vui lòng nhập lý do ban người dùng.",
			userHasBanned: "Người dùng [%1 | %2] đã bị cấm từ trước:\n» Lý do: %3\n» Thời gian: %4",
			userBanned: "Đã cấm người dùng [%1 | %2].\n» Lý do: %3\n» Thời gian: %4",
			uidRequiredUnban: "Uid của người cần unban không được để trống",
			userNotBanned: "Người dùng [%1 | %2] hiện không bị cấm",
			userUnbanned: "Đã bỏ cấm cho người dùng [%1 | %2]",
			emptyBanList: "Hiện tại không có người dùng nào bị cấm.",
			banListHeader: "📑 Danh sách %1 người dùng bị cấm:"
		},
		en: {
			noUserFound: "❌ No user found with name matching: \"%1\"",
			userFound: "🔎 Found %1 user matching \"%2\":\n%3",
			uidRequired: "Uid of user to ban cannot be empty.",
			reasonRequired: "Please enter a reason for the ban.",
			userHasBanned: "User [%1 | %2] was already banned:\n» Reason: %3\n» Date: %4",
			userBanned: "User [%1 | %2] has been banned:\n» Reason: %3\n» Date: %4",
			uidRequiredUnban: "Uid of user to unban cannot be empty",
			userNotBanned: "User [%1 | %2] is not banned",
			userUnbanned: "User [%1 | %2] has been unbanned",
			emptyBanList: "There are no banned users in the system.",
			banListHeader: "📑 List of %1 banned users:"
		}
	},

	onStart: async function ({ args, usersData, message, event, prefix, getLang }) {
		const type = args[0];
		switch (type) {
		
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const allUser = await usersData.getAll();
				const keyWord = args.slice(1).join(" ");
				const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
				const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.userID}`, "");
				message.reply(result.length == 0 ? getLang("noUserFound", keyWord) : getLang("userFound", result.length, keyWord, msg));
				break;
			}
		
			case "ban":
			case "-b": {
				let uid, reason;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
					reason = args.slice(1).join(" ").replace(mentions[uid], "");
				}
				else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}
				else return message.SyntaxError();

				if (!uid) return message.reply(getLang("uidRequired"));
				if (!reason) return message.reply(getLang("reasonRequired"));
				reason = reason.replace(/\s+/g, ' ');

				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;

				if (status) return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: { status: true, reason, date: time }
				});
				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}
	
			case "unban":
			case "-u": {
				let uid;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
				}
				else if (args[1]) {
					uid = args[1];
				}
				else return message.SyntaxError();

				if (!uid) return message.reply(getLang("uidRequiredUnban"));
				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;
				if (!status) return message.reply(getLang("userNotBanned", uid, name));
				await usersData.set(uid, { banned: {} });
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}
	
			case "list":
			case "-l": {
				const allUser = await usersData.getAll();
				const bannedUsers = allUser.filter(user => user.banned && user.banned.status === true);
				
				if (bannedUsers.length === 0) return message.reply(getLang("emptyBanList"));
				
				let msg = getLang("banListHeader", bannedUsers.length);
				bannedUsers.forEach((user, index) => {
					msg += `\n${index + 1}. ${user.name}\n   ID: ${user.userID}\n   Lý do: ${user.banned.reason}\n   Ngày: ${user.banned.date}\n`;
				});
				message.reply(msg);
				break;
			}
			default:
				return message.SyntaxError();
		}
	}
};
