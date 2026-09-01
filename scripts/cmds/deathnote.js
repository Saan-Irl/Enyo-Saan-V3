const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "deathnote",
    aliases: ["dn"],
    version: "2.0",
    author: "𝐒𝐈𝐀𝐌 𝐀𝐇𝐌𝐄𝐃 𝐒𝐀𝐀𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "Death Note (Canvas Version)",
    longDescription: "Cinematic Death Note using local canvas rendering",
    category: "FUN & SOCIAL",
    guide: "{pn} [reason] @tag/reply"
  },

  langs: {
    en: {
      noTag: "Tag or reply someone.",
      fail: "Death Note Failed..."
    }
  },

  onStart: async function ({ event, message, usersData, getLang, api, args }) {
    let targetID =
      Object.keys(event.mentions || {})[0] ||
      event.messageReply?.senderID ||
      null;

    if (!targetID) return message.reply(getLang("noTag"));

    const uniqueId = `${targetID}_${Date.now()}`;
    const tempDir = path.join(__dirname, "tmp");
    const outputPath = path.join(tempDir, `${uniqueId}.png`);

    try {
      await fs.ensureDir(tempDir);

      const targetName = await usersData
        .getName(targetID)
        .catch(() => "Unknown");

      const reason = (args.join(" ") || "heartattack").toLowerCase();

      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=512&height=512`;

      const notebookImage = "https://i.imgur.com/EkfBPCB.jpeg";
      const heartAttackImage = "https://i.imgur.com/ySQKrAZ.jpeg";
      const suicideImage = "https://i.imgur.com/pir16rx.jpeg";

      const avatarBuffer = await axios
        .get(avatarURL, { responseType: "arraybuffer" })
        .then(res => res.data)
        .catch(() => null);

      if (!avatarBuffer) return message.reply(getLang("fail"));

      async function generateDeathCard(bgURL, text1, text2) {
        const bgImg = await loadImage(bgURL);
        const avImg = await loadImage(Buffer.from(avatarBuffer));

        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bgImg, 0, 0, 700, 250);

        // avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 125, 65, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avImg, 35, 60, 130, 130);
        ctx.restore();

        // border
        ctx.beginPath();
        ctx.arc(100, 125, 65, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // name
        ctx.font = "bold 32px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 7;
        ctx.fillText(text1, 200, 110);

        // reason
        ctx.font = "22px sans-serif";
        ctx.fillStyle = "#dddddd";
        ctx.fillText(text2, 200, 160);

        return canvas.toBuffer();
      }

      // ===== SUICIDE MODE =====
      if (reason === "suicide") {
        const buffer = await generateDeathCard(
          suicideImage,
          targetName,
          "Suicide has been completed."
        );

        await fs.writeFile(outputPath, buffer);

        await message.reply({
          body: "☠️ Suicide has been completed.",
          attachment: fs.createReadStream(outputPath)
        });

        setTimeout(() => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }, 5000);

        return;
      }

      // ===== NORMAL MODE =====
      const firstBuffer = await generateDeathCard(
        notebookImage,
        targetName,
        "40 seconds remaining..."
      );

      await fs.writeFile(outputPath, firstBuffer);

      const firstMsg = await message.reply({
        body: "⏳ 40 seconds remaining...",
        attachment: fs.createReadStream(outputPath)
      });

      setTimeout(() => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, 5000);

      // countdown
      setTimeout(async () => {
        try {
          if (firstMsg?.messageID) {
            await api.unsendMessage(firstMsg.messageID).catch(() => null);
          }

          const finalBuffer = await generateDeathCard(
            heartAttackImage,
            targetName,
            "Embrace your death..."
          );

          const finalOutputPath = path.join(
            tempDir,
            `${uniqueId}_final.png`
          );

          await fs.writeFile(finalOutputPath, finalBuffer);

          await message.reply({
            body: "☠️ Embrace your death...",
            attachment: fs.createReadStream(finalOutputPath)
          });

          setTimeout(() => {
            if (fs.existsSync(finalOutputPath)) {
              fs.unlinkSync(finalOutputPath);
            }
          }, 5000);
        } catch (e) {
          console.log(e);
        }
      }, 40000);
    } catch (err) {
      console.log(err);
      return message.reply(getLang("fail"));
    }
  }
};
