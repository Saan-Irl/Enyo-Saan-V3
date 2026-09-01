const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

if (!config.adminOnly) config.adminOnly = {};
if (!config.adminOnly.allowUID) config.adminOnly.allowUID = [];

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin"],
    version: "2.0",
    author: "NTKhang + Modified by 𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 2,
    description: {
      vi: "bật/tắt chế độ chỉ admin mới có thể sử dụng bot + UID permission",
      en: "toggle admin-only mode + UID permission"
    },
    category: "owner",
    guide: {
      en:
        "   {pn} on/off\n" +
        "   {pn} noti on/off\n" +
        "   {pn} allow add <uid>\n" +
        "   {pn} allow remove <uid>\n" +
        "   {pn} allow list"
    }
  },

  langs: {
    en: {
      turnedOn: "Admin-only mode enabled.",
      turnedOff: "Admin-only mode disabled.",
      turnedOnNoti: "Notification enabled for non-admin users.",
      turnedOffNoti: "Notification disabled.",
      addSuccess: "UID added to allowed user list.",
      removeSuccess: "UID removed from allowed user list.",
      list: "Allowed UIDs:\n%1",
      noList: "No allowed UID added yet."
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isSetNoti = false;
    let value;
    let indexGetVal = 0;

    // ----------- UID Permission System -----------
    if (args[0] === "allow") {
      const sub = args[1];

      if (sub === "add") {
        const uid = args[2];
        if (!uid) return message.reply("100081088184521");
        if (!config.adminOnly.allowUID.includes(uid))
          config.adminOnly.allowUID.push(uid);
        fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("addSuccess"));
      }

      if (sub === "remove") {
        const uid = args[2];
        if (!uid) return message.reply("100081088184521");
        config.adminOnly.allowUID =
          config.adminOnly.allowUID.filter(u => u !== uid);
        fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("removeSuccess"));
      }

      if (sub === "list") {
        const list = config.adminOnly.allowUID;
        if (list.length === 0) return message.reply(getLang("noList"));
        return message.reply(getLang("list", list.join("\n")));
      }

      return message.reply("❌ Wrong format.\nUse: allow add/remove/list");
    }

    // ------------- Normal Admin Only Switch --------------
    if (args[0] == "noti") {
      isSetNoti = true;
      indexGetVal = 1;
    }

    if (args[indexGetVal] == "on") value = true;
    else if (args[indexGetVal] == "off") value = false;
    else return message.SyntaxError();

    if (isSetNoti) {
      config.hideNotiMessage.adminOnly = !value;
      message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
    } else {
      config.adminOnly.enable = value;
      message.reply(getLang(value ? "turnedOn" : "turnedOff"));
    }

    fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
  }
};
