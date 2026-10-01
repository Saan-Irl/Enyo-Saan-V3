const { getTime, drive } = global.utils;
const axios = require("axios");

module.exports = {
	config: {
		name: "leave",
		version: "1.8",
		author: "NTKhang|| modified by xalman",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			leaveType1: "left",
			leaveType2: "was kicked from",
			defaultLeaveMessage: "{userName} {type} the group"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;
				
				const hours = getTime("HH");
				const threadName = threadData.threadName || "group";
				const userName = await usersData.getName(leftParticipantFbId);
				const isKicked = leftParticipantFbId != event.author;

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
				
				const form = {
					body: "",
					mentions: leaveMessage.includes("{userNameTag}") ? [{
						tag: userName,
						id: leftParticipantFbId
					}] : []
				};

				leaveMessage = leaveMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName)
					.replace(/\{type\}/g, isKicked ? getLang("leaveType2") : getLang("leaveType1"))
					.replace(/\{threadName\}|\{boxName\}/g, threadName)
					.replace(/\{time\}/g, hours)
					.replace(/\{session\}/g, hours <= 10 ?
						getLang("session1") :
						hours <= 12 ?
							getLang("session2") :
							hours <= 18 ?
								getLang("session3") :
								getLang("session4")
					);

				form.body = leaveMessage;

				if (isKicked) {
					try {
						const gifRes = await axios.get("https://i.imgur.com/SFQoVw7.gif", {
							responseType: "stream",
							headers: {
								'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
								'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
							}
						});
						form.attachment = gifRes.data;
					} catch (e) {
						// Error logic removed to keep console clean
					}
				} else if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.map(file => drive.getFile(file, "stream"));
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
			};
	}
};
