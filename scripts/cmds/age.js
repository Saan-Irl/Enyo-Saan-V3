const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "age",
    version: "4.0.",
    author: "Amit max//𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Age Checker",
    longDescription: "View age stats details.",
    category: "utility",
    guide: { en: "{pn} [DD-MM-YYYY]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;

    if (!args[0]) {
      return api.sendMessage("『 SYSTEM-ERROR 』\n\n➤ Please provide DOB (DD-MM-YYYY)\n➤ Example: .age 31-12-2003", threadID, messageID);
    }

    const birthDate = moment.tz(args[0], "DD-MM-YYYY", true, "Asia/Dhaka");
    if (!birthDate.isValid()) {
      return api.sendMessage("❌ FORMAT_INVALID: Use DD-MM-YYYY", threadID, messageID);
    }

    const now = moment.tz("Asia/Dhaka");
    const age = moment.duration(now.diff(birthDate));

    const Y = age.years();
    const M = age.months();
    const D = age.days();
    const totalDays = Math.floor(now.diff(birthDate, "days"));
    const totalSecs = Math.floor(now.diff(birthDate, "seconds"));

    const nextBday = birthDate.clone().year(now.year());
    if (nextBday.isBefore(now)) nextBday.add(1, 'year');
    const dLeft = nextBday.diff(now, 'days');

    const ratingArr = ["S-Rank", "A-Rank", "God-Tier", "Legendary", "Elite", "Supreme"];
    const randomRating = ratingArr[Math.floor(Math.random() * ratingArr.length)];

    const response = 
      `┌───  [ 𝗔𝗚𝗘 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥 ]  ───\n` +
      `├──────────────────\n` +
      `│ ✨ 𝗬𝗲𝗮𝗿𝘀: ${Y} \n` +
      `│ ✨ 𝗠𝗼𝗻𝘁𝗵𝘀: ${M} \n` +
      `│ ✨ 𝗗𝗮𝘆𝘀: ${D} \n` +
      `├──────────────────\n` +
      `│ 📊 𝗧𝗼𝘁𝗮𝗹 𝗟𝗶𝗳𝗲𝘀𝗽𝗮𝗻:\n` +
      `│ • Days: ${totalDays.toLocaleString()}\n` +
      `│ • Second: ${totalSecs.toLocaleString()}\n` +
      `├──────────────────\n` +
      `│ 🎯 𝗡𝗲𝘅𝘁 𝗘𝘃𝗲𝗻𝘁: ${dLeft} Days Left\n` +
      `│ 🎖️ 𝗨𝘀𝗲𝗿 𝗥𝗮𝗻𝗸: ${randomRating}\n` +
      `└──────────────────\n` ;

    return api.sendMessage(response, threadID, messageID);
  }
};
